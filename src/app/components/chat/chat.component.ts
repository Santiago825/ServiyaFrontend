import { Component, ElementRef, OnDestroy, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { SessionStore } from 'src/app/core/session/session.store';
import { MensajeChat, PresenciaEvento } from 'src/app/models/chat';
import { Rol } from 'src/app/models/rol';
import { ChatApiService } from '../../services/chat/chat-api.service';
import { ChatService } from '../../services/chat/chat.service';
import { UsuarioService } from '../../services/Usuario/usuario.service';
import { etiquetaListaDe, fusionarMensajes, horaDe, normalizarTexto } from './chat.utils';

/** Último mensaje de una conversación, para la vista previa de la lista. */
interface UltimoMensaje {
  id: number;
  texto: string;
  timestamp: string;
  propio: boolean;
}

interface Contacto {
  username: string;
  enLinea: boolean;
  ultimo?: UltimoMensaje;
}

/** Estado de una conversación: mensajes cargados + paginación hacia atrás. */
interface Conversacion {
  mensajes: MensajeChat[]; // orden cronológico ascendente
  hayMas: boolean; // quedan mensajes más antiguos en el servidor
  cursor: number | null; // id del mensaje más antiguo cargado (beforeId de la próxima página)
  cargando: boolean;
  inicializada: boolean; // ya se pidió la primera página
}

const PAGINA = 30;
const UMBRAL_SCROLL_ARRIBA_PX = 80; // a esta distancia del borde superior se pide la página anterior
const UMBRAL_CERCA_DEL_FINAL_PX = 150; // "cerca del final": se sigue el hilo al llegar mensajes nuevos

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class Chat2Component implements OnInit, OnDestroy, AfterViewChecked {
  username = '';
  activeTab = '';
  rol: string | null;
  conectado = false;

  /** Lista ordenada para pintar (último mensaje más reciente primero). */
  contactos: Contacto[] = [];

  private contactosPorNombre = new Map<string, Contacto>();
  private conversaciones = new Map<string, Conversacion>();
  private enLineaSet = new Set<string>();
  private subs = new Subscription();

  /** Acciones de scroll a ejecutar justo DESPUÉS de que Angular pinte el DOM (ver ngAfterViewChecked). */
  private tareasPostPintado: Array<() => void> = [];

  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLElement>;

  /** Texto que se está escribiendo (estado de esta pantalla, no del servicio de socket). */
  borrador = '';

  constructor(
    private chatService: ChatService,
    private chatApi: ChatApiService,
    private session: SessionStore,
    private usuarioService: UsuarioService,
    private dialogos: DialogosService
  ) {
    this.rol = session.getRol();
  }
  busqueda = '';

  // ───────────────────────── ciclo de vida ─────────────────────────

  ngOnInit(): void {
    const { idUsuario, username } = this.session.getUser();
    this.username = username;

    this.cargarContactos(idUsuario);

    this.subs.add(this.chatService.message$.subscribe((m) => this.alRecibirMensaje(m)));
    this.subs.add(this.chatService.presence$.subscribe((p) => this.alCambiarPresencia(p)));
    this.subs.add(
      this.chatService.error$.subscribe((e) =>
        this.dialogos.advertir('Mensaje no enviado', e.mensajeRespuesta || 'Inténtalo de nuevo.')
      )
    );
    // Emite el estado actual al suscribirse y cada vez que cambia. Al (re)conectar se resincroniza
    // todo lo que pudo cambiar mientras no había socket.
    this.subs.add(
      this.chatService.connected$.subscribe((ok) => {
        this.conectado = ok;
        if (ok) {
          this.sincronizar();
        }
      })
    );

    // El socket lo abre ChatSessionBinder al iniciar sesión: este componente solo lo escucha.
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    // NO se desconecta el socket: es de toda la app (presencia) y lo cierra ChatSessionBinder al cerrar sesión.
  }

  /**
   * Se ejecuta tras cada pintado. Antes llamaba a scrollToBottom() SIEMPRE, lo que clavaba el scroll
   * abajo e impedía subir a ver mensajes antiguos. Ahora solo corre la tarea que alguien programó.
   */
  ngAfterViewChecked(): void {
    if (this.tareasPostPintado.length) {
      const tareas = this.tareasPostPintado;
      this.tareasPostPintado = [];
      tareas.forEach((t) => t());
    }
  }

  // ───────────────────────── contactos y vista previa ─────────────────────────

  private cargarContactos(idUsuario: number): void {
    // Cada consulta es exclusiva de un rol en el backend (403 si no corresponde).
    const origen =
      this.rol === Rol.COLABORADOR
        ? this.usuarioService.obtenerSeguidoresColaborador(idUsuario)
        : this.rol === Rol.CONTRATANTE
          ? this.usuarioService.obtenerColaboradoresSeguidos(idUsuario)
          : null;

    origen?.subscribe({
      next: (contactos) => {
        contactos
          .map((c) => c.username)
          .filter((n) => n && n !== this.username)
          .forEach((n) => this.contacto(n));
        this.ordenar();
      },
      error: (err) => console.error('Error al obtener contactos', err),
    });
  }

  /** Obtiene (o crea) el contacto. Crea al vuelo a quien escriba aunque no esté en la lista de seguimiento. */
  private contacto(username: string): Contacto {
    let c = this.contactosPorNombre.get(username);
    if (!c) {
      c = { username, enLinea: this.enLineaSet.has(username) };
      this.contactosPorNombre.set(username, c);
    }
    return c;
  }

  /** Con conversación primero (más reciente arriba); el resto, alfabético. El id es monótono: sirve de orden exacto. */
  private ordenar(): void {
    this.contactos = [...this.contactosPorNombre.values()].sort(
      (a, b) => (b.ultimo?.id ?? 0) - (a.ultimo?.id ?? 0) || a.username.localeCompare(b.username)
    );
  }

  private actualizarUltimo(con: string, m: MensajeChat): void {
    const c = this.contacto(con);
    if (c.ultimo && c.ultimo.id > m.id) {
      return; // llegó uno más viejo que el que ya se muestra
    }
    c.ultimo = {
      id: m.id,
      texto: m.message,
      timestamp: m.timestamp,
      propio: m.senderName === this.username,
    };
  }

  // ───────────────────────── sincronización (conexión / reconexión) ─────────────────────────

  private sincronizar(): void {
    // 1) Presencia: la suscripción a /user/queue/presence ya está activa, así que esta foto + los
    //    eventos posteriores no dejan huecos.
    this.chatApi.obtenerPresencia().subscribe({
      next: (r) => {
        this.enLineaSet = new Set(r.enLinea ?? []);
        this.contactosPorNombre.forEach((c) => (c.enLinea = this.enLineaSet.has(c.username)));
      },
      error: () => { },
    });

    // 2) Vista previa de todos los chats (recupera lo que llegó mientras no había socket).
    this.chatApi.obtenerConversaciones().subscribe({
      next: (lista) => {
        lista.forEach((r) => this.actualizarUltimo(r.interlocutor, r.ultimoMensaje));
        this.ordenar();
      },
      error: () => { },
    });

    // 3) Si hay un chat abierto, se refresca su última página.
    if (this.activeTab) {
      this.cargarPaginaInicial(this.activeTab);
    }
  }

  // ───────────────────────── tiempo real ─────────────────────────

  private alRecibirMensaje(m: MensajeChat): void {
    // El servidor reenvía también los mensajes propios (eco con id real).
    const otro = m.senderName === this.username ? m.receiverName : m.senderName;
    if (!otro) {
      return;
    }
    const abierta = otro === this.activeTab;
    const seguirHilo = abierta && (m.senderName === this.username || this.estaCercaDelFinal());

    // Siempre se fusiona (aunque el historial aún se esté cargando): evita perder un mensaje que llega
    // justo mientras la petición HTTP está en vuelo.
    const conv = this.conv(otro);
    conv.mensajes = this.fusionar(conv.mensajes, [m]);

    this.actualizarUltimo(otro, m);
    this.ordenar();

    if (seguirHilo) {
      this.irAlFinal();
    }
  }

  private alCambiarPresencia(p: PresenciaEvento): void {
    if (p.enLinea) {
      this.enLineaSet.add(p.username);
    } else {
      this.enLineaSet.delete(p.username);
    }
    const c = this.contactosPorNombre.get(p.username);
    if (c) {
      c.enLinea = p.enLinea;
    }
  }

  // ───────────────────────── conversación activa ─────────────────────────

  get convActiva(): Conversacion | undefined {
    return this.conversaciones.get(this.activeTab);
  }

  get mensajesActivos(): MensajeChat[] {
    return this.convActiva?.mensajes ?? [];
  }

  get contactoActivo(): Contacto | undefined {
    return this.contactosPorNombre.get(this.activeTab);
  }
  /** Contactos filtrados por nombre o por texto del último mensaje (sin importar tildes/mayúsculas). */
  get contactosFiltrados(): Contacto[] {
    const q = this.normalizar(this.busqueda);
    if (!q) {
      return this.contactos;
    }
    return this.contactos.filter(
      (c) =>
        this.normalizar(c.username).includes(q) ||
        this.normalizar(c.ultimo?.texto ?? '').includes(q)
    );
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  private normalizar(texto: string): string {
    return normalizarTexto(texto);
  }

  private conv(username: string): Conversacion {
    let c = this.conversaciones.get(username);
    if (!c) {
      c = { mensajes: [], hayMas: false, cursor: null, cargando: false, inicializada: false };
      this.conversaciones.set(username, c);
    }
    return c;
  }

  seleccionarChat(username: string): void {
    this.activeTab = username;
    const conv = this.conv(username);
    if (!conv.inicializada) {
      this.cargarPaginaInicial(username);
    } else {
      this.irAlFinal();
    }
  }

  volverALista(): void {
    this.activeTab = '';
  }

  /** Página más reciente. Si ya había mensajes cargados, se FUSIONA (no se pisa el historial ya paginado). */
  private cargarPaginaInicial(username: string): void {
    const conv = this.conv(username);
    if (conv.cargando) {
      return;
    }
    conv.cargando = true;
    this.chatApi.obtenerMensajesPrivados(username, null, PAGINA).subscribe({
      next: (pagina) => {
        conv.cargando = false;
        const ultimoConocido = conv.mensajes.length ? conv.mensajes[conv.mensajes.length - 1].id : null;
        const primeroDePagina = pagina.mensajes.length ? pagina.mensajes[0].id : null;
        const hayHueco =
          conv.inicializada &&
          pagina.hayMas &&
          ultimoConocido != null &&
          primeroDePagina != null &&
          primeroDePagina > ultimoConocido;

        if (!conv.inicializada || hayHueco) {
          // Primera carga (o se perdieron más de una página mientras no había conexión): se parte de cero.
          conv.mensajes = this.fusionar(hayHueco ? [] : conv.mensajes, pagina.mensajes);
          conv.hayMas = pagina.hayMas;
          conv.cursor = pagina.siguienteCursor;
          conv.inicializada = true;
        } else {
          conv.mensajes = this.fusionar(conv.mensajes, pagina.mensajes);
        }
        if (username === this.activeTab) {
          this.irAlFinal();
          // Si la página no llena el contenedor no habría scrollbar y no se podría pedir más.
          this.alPintar(() => this.completarSiNoHayScroll());
        }
      },
      error: (err) => {
        conv.cargando = false;
        console.error('Error al cargar mensajes privados:', err);
      },
    });
  }

  /** Scroll infinito: se pide la página anterior al acercarse al borde superior. */
  onScroll(): void {
    const el = this.scrollAnchor?.nativeElement;
    if (el && el.scrollTop <= UMBRAL_SCROLL_ARRIBA_PX) {
      this.cargarAnteriores();
    }
  }

  private cargarAnteriores(): void {
    const username = this.activeTab;
    const conv = this.conversaciones.get(username);
    if (!conv || !conv.inicializada || conv.cargando || !conv.hayMas || conv.cursor == null) {
      return;
    }
    conv.cargando = true;
    this.chatApi.obtenerMensajesPrivados(username, conv.cursor, PAGINA, true).subscribe({
      next: (pagina) => {
        conv.cargando = false;
        // Se mide ANTES de insertar arriba; la tarea corre después del pintado y compensa la
        // diferencia de altura, así la vista no se mueve de donde el usuario estaba leyendo.
        const el = this.scrollAnchor?.nativeElement;
        const alturaPrevia = el?.scrollHeight ?? 0;
        const topPrevio = el?.scrollTop ?? 0;

        conv.mensajes = this.fusionar(pagina.mensajes, conv.mensajes);
        conv.hayMas = pagina.hayMas;
        conv.cursor = pagina.siguienteCursor ?? conv.cursor;

        if (username === this.activeTab) {
          this.alPintar(() => {
            const actual = this.scrollAnchor?.nativeElement;
            if (actual) {
              actual.scrollTop = topPrevio + (actual.scrollHeight - alturaPrevia);
            }
          });
        }
      },
      error: () => (conv.cargando = false), // silencioso: el usuario puede volver a subir para reintentar
    });
  }

  private completarSiNoHayScroll(): void {
    const el = this.scrollAnchor?.nativeElement;
    if (el && el.scrollHeight <= el.clientHeight) {
      this.cargarAnteriores();
    }
  }

  // ───────────────────────── envío ─────────────────────────

  sendMessage(): void {
    if (!this.conectado || !this.activeTab) {
      return;
    }
    if (this.chatService.enviar(this.activeTab, this.borrador)) {
      this.borrador = '';
    }
    // El mensaje aparece (y el scroll baja) cuando vuelve el eco del servidor: ver alRecibirMensaje().
  }

  // ───────────────────────── utilidades de scroll ─────────────────────────

  private alPintar(tarea: () => void): void {
    this.tareasPostPintado.push(tarea);
  }

  private irAlFinal(): void {
    this.alPintar(() => {
      const el = this.scrollAnchor?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  private estaCercaDelFinal(): boolean {
    const el = this.scrollAnchor?.nativeElement;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight <= UMBRAL_CERCA_DEL_FINAL_PX;
  }

  // ───────────────────────── helpers ─────────────────────────

  private fusionar(a: MensajeChat[], b: MensajeChat[]): MensajeChat[] {
    return fusionarMensajes(a, b);
  }

  trackContacto = (_: number, c: Contacto) => c.username;
  trackMensaje = (_: number, m: MensajeChat) => m.id;

  /** Hora de un mensaje: "14:05". */
  hora(iso: string): string {
    return horaDe(iso);
  }

  /** Etiqueta de la lista: hoy → hora, ayer → "Ayer", antes → dd/mm/aa. */
  etiquetaLista(iso: string): string {
    return etiquetaListaDe(iso);
  }
}
