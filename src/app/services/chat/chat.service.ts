import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { SessionStore } from 'src/app/core/session/session.store';
import { ErrorChat, MensajeChat, PresenciaEvento } from 'src/app/models/chat';

/**
 * TRANSPORTE en tiempo real (WebSocket/STOMP). El historial por HTTP está en ChatApiService.
 * Protocolo (ver ChatController y PresenciaService en el backend):
 *  - CONNECT con cabecera STOMP "Authorization: Bearer <jwt>" (el servidor identifica al usuario).
 *  - Recibe en  /user/queue/messages  (mensajes de otros Y el eco de los propios, ya con id).
 *  - Recibe en  /user/queue/errors    (mensaje inválido).
 *  - Recibe en  /user/queue/presence  ({username, enLinea} de MIS contactos).
 *  - Envía a    /app/private-message  { receiverName, message }  (SIN remitente).
 *
 * La conexión es UNA para toda la app: la abre/cierra ChatSessionBinder según haya sesión, así el
 * usuario figura "En línea" en cualquier pantalla y no solo mientras tiene abierto el chat.
 * Ya no guarda el borrador del mensaje (`userData`): eso es estado del componente.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient?: Client;
  private usuarioConectado = '';

  /** Subject (no BehaviorSubject): un componente nuevo NO debe recibir de nuevo el último mensaje. */
  readonly message$ = new Subject<MensajeChat>();
  readonly error$ = new Subject<ErrorChat>();
  readonly presence$ = new Subject<PresenciaEvento>();

  private readonly conectadoSubject = new BehaviorSubject<boolean>(false);
  /** true mientras el socket está conectado Y suscrito. Emite al instante su valor actual. */
  readonly connected$: Observable<boolean> = this.conectadoSubject.asObservable();

  constructor(private session: SessionStore) {}

  connect(username: string): void {
    if (this.stompClient?.active) {
      if (this.usuarioConectado === username) {
        return; // ya conectado como este usuario
      }
      this.stompClient.deactivate(); // otra cuenta inició sesión en la misma pestaña
    }
    this.usuarioConectado = username;

    const client = new Client({
      webSocketFactory: () => new SockJS(ENDPOINTS.ws),
      reconnectDelay: 5000,
      // Deben coincidir con el broker (WebSocketConfig): permiten detectar conexiones muertas
      // en ambos sentidos, de lo que depende que el estado "En línea" sea fiable.
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // Se evalúa en CADA (re)conexión: toma el token vigente.
      beforeConnect: () => {
        const token = this.session.getToken();
        if (!token) {
          client.deactivate();
          return;
        }
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      },
      onConnect: () => {
        // Las suscripciones mueren con cada conexión: hay que repetirlas en cada reconexión.
        client.subscribe(ENDPOINTS.wsColaMensajes, (m: IMessage) =>
          this.message$.next(JSON.parse(m.body))
        );
        client.subscribe(ENDPOINTS.wsColaErrores, (m: IMessage) =>
          this.error$.next(JSON.parse(m.body))
        );
        client.subscribe(ENDPOINTS.wsColaPresencia, (m: IMessage) =>
          this.presence$.next(JSON.parse(m.body))
        );
        // Recién aquí se anuncia "conectado": los consumidores piden la foto inicial de presencia
        // con la suscripción ya activa, así no se pierde ningún cambio entre una y otra.
        this.marcarConectado(true);
      },
      onStompError: (frame) => {
        console.error('[chat] Error STOMP:', frame.headers['message'], frame.body);
        // Token inválido/vencido: no tiene sentido reintentar en bucle.
        if ((frame.headers['message'] || '').toLowerCase().includes('token')) {
          client.deactivate();
        }
      },
      onWebSocketError: (e) => console.error('[chat] Error de WebSocket/SockJS:', e),
      onWebSocketClose: (e) => {
        console.warn('[chat] Socket cerrado', e?.code, e?.reason);
        this.marcarConectado(false);
      },
    });
    this.stompClient = client;
    client.activate();
  }

  /**
   * Envía `texto` a `receiver`. Devuelve true si se publicó (el mensaje aparece cuando el servidor lo
   * devuelve: eco con id); false si no hay conexión o el texto está vacío.
   */
  enviar(receiver: string, texto: string): boolean {
    const limpio = (texto ?? '').trim();
    if (!this.stompClient?.connected || !receiver || !limpio) {
      return false;
    }
    this.stompClient.publish({
      destination: ENDPOINTS.wsEnviarMensaje,
      body: JSON.stringify({ receiverName: receiver, message: limpio }),
    });
    return true;
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
    this.usuarioConectado = '';
    this.marcarConectado(false);
  }

  private marcarConectado(valor: boolean): void {
    if (this.conectadoSubject.value !== valor) {
      this.conectadoSubject.next(valor);
    }
  }
}
