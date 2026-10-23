import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SessionStore } from 'src/app/core/session/session.store';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { ContratoService } from 'src/app/services/Contrato/contrato.service';
import { UsuarioService } from 'src/app/services/Usuario/usuario.service';
import { Contrato, ESTADO_CLASES, ESTADO_ETIQUETA } from 'src/app/models/contrato';
import { UsuarioSeguido } from 'src/app/models/usuario-seguido';

const MAX_ARCHIVO_BYTES = 5 * 1024 * 1024;
const TIPOS_ARCHIVO = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** fechaFin no puede ser anterior a fechaInicio (yyyy-MM-dd: la comparación de texto basta). */
function rangoFechas(g: AbstractControl): ValidationErrors | null {
  const inicio = g.get('fechaInicio')?.value;
  const fin = g.get('fechaFin')?.value;
  return inicio && fin && fin < inicio ? { rangoFechas: true } : null;
}

@Component({
  selector: 'app-contrato-colaborador',
  templateUrl: './contrato-colaborador.component.html',
  styleUrls: ['./contrato-colaborador.component.css'],
})
export class ContratoColaboradorComponent implements OnInit {
  contratos: Contrato[] = [];
  contratantes: UsuarioSeguido[] = [];
  /** Contrato cuyo detalle se está viendo (abre el modal compartido). */
  idContratoDetalle: number | null = null;

  mostrarFormulario = false;
  enviando = false;
  archivo: File | null = null;
  errorArchivo = '';

  /** Hoy (yyyy-MM-dd, hora local): mínimo de la fecha de inicio. */
  hoy = this.aIso(new Date());

  readonly etiqueta = ESTADO_ETIQUETA;
  readonly clases = ESTADO_CLASES;

  form = this.fb.nonNullable.group(
    {
      contratanteUsername: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
      precio: ['', [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    },
    { validators: rangoFechas }
  );

  constructor(
    private fb: FormBuilder,
    private contratoService: ContratoService,
    private usuarioService: UsuarioService,
    private session: SessionStore,
    private loader: NgxUiLoaderService,
    private dialogos: DialogosService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.cargarContratantes();
  }

  get pendientes(): number {
    return this.contratos.filter((c) => c.estado === 'PENDIENTE').length;
  }
  get aceptados(): number {
    return this.contratos.filter((c) => c.estado === 'ACEPTADO').length;
  }
  get rechazados(): number {
    return this.contratos.filter((c) => c.estado === 'RECHAZADO').length;
  }

  cargar(): void {
    this.loader.start();
    this.contratoService
      .misContratosColaborador()
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        next: (lista) => (this.contratos = lista),
        error: (e) => console.error('Error al obtener contratos:', e),
      });
  }

  /** Los contratantes disponibles son los que siguen al colaborador. */
  private cargarContratantes(): void {
    const { idUsuario } = this.session.getUser();
    this.usuarioService.obtenerSeguidoresColaborador(idUsuario).subscribe({
      next: (lista) => (this.contratantes = lista),
      error: () => (this.contratantes = []),
    });
  }

  verDetalle(contrato: Contrato): void {
    this.idContratoDetalle = contrato.idContrato;
  }

  cerrarDetalle(): void {
    this.idContratoDetalle = null;
  }

  abrirFormulario(): void {
    this.form.reset();
    this.archivo = null;
    this.errorArchivo = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (!this.enviando) {
      this.mostrarFormulario = false;
    }
  }

  alElegirArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.errorArchivo = '';
    this.archivo = null;
    if (!file) {
      return;
    }
    if (file.size > MAX_ARCHIVO_BYTES) {
      this.errorArchivo = 'El archivo no puede superar 5 MB.';
    } else if (!TIPOS_ARCHIVO.includes(file.type)) {
      this.errorArchivo = 'Solo se permiten archivos PDF o Word.';
    } else {
      this.archivo = file;
      return;
    }
    input.value = '';
  }

  enviar(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => datos.append(k, v));
    if (this.archivo) {
      datos.append('archivo', this.archivo);
    }

    this.enviando = true;
    this.contratoService
      .crearContrato(datos)
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => {
          this.dialogos.exito('Contrato enviado', 'El contratante podrá aceptarlo o rechazarlo.', 2200);
          this.mostrarFormulario = false;
          this.cargar();
        },
        // Los errores de validación del servidor los muestra el interceptor.
      });
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  private aIso(d: Date): string {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}