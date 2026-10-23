import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { Colaborador } from 'src/app/models/colaborador';
import { Departamento, Municipio } from 'src/app/models/catalogo';
import { DetalleColaborador } from 'src/app/models/detalleColaborador';
import { Servicio } from 'src/app/models/servicio';
import { ArchivoDescargaService } from 'src/app/services/archivo/archivo-descarga.service';
import { CatalogoService } from 'src/app/services/catalogo/catalogo.service';
import { ColaboradorService } from 'src/app/services/colaborador/colaborador.service';
import { SeguimientoService } from 'src/app/services/seguimiento/seguimiento.service';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { promedio } from 'src/app/shared/utils/estrellas';
import { fotoSrc } from 'src/app/shared/utils/foto';

/** Lo que muestra el modal de un colaborador (perfil + reseñas ya adaptadas a la vista). */
interface ColaboradorSeleccionado {
  id_persona: number;
  foto: string | null;
  nombre: string;
  telefono: string;
  descripcion: string;
  ciudad: string;
  correo: string;
  categoria: string;
  resenas: number;
  /** Promedio de estrellas calculado con las reseñas recibidas (0 si no tiene). */
  promedio: number;
  seguido: number;
  comentarios: { usuario: string; texto: string; estrellas: number }[];
}

/** Adapta el DetalleColaborador del backend a lo que pinta el modal. */
function aSeleccionado(d: DetalleColaborador): ColaboradorSeleccionado {
  return {
    id_persona: d.id_persona,
    foto: fotoSrc(d.foto),
    nombre: `${d.nombre} ${d.apellido}`,
    telefono: d.telefono,
    descripcion: d.descripcion,
    ciudad: d.municipio,
    correo: d.username,
    categoria: d.servicio,
    resenas: d.numero_resenas,
    promedio: promedio((d.resena ?? []).map((r) => r.puntuacion)),
    seguido: d.seguido,
    comentarios: (d.resena ?? []).map((r) => ({
      usuario: r.nombre,
      texto: r.comentario,
      estrellas: r.puntuacion,
    })),
  };
}

/**
 * Pantalla de búsqueda de colaboradores. Solo coordina la interfaz (formulario, modal, loader): los
 * datos vienen de los servicios y el contratante lo identifica el backend por el token, por eso ya no
 * se lee ni se envía idPersona.
 */
@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  departamentos: Departamento[] = [];
  municipios: Municipio[] = [];
  colaboradores: Colaborador[] = [];
  formBusqueda!: FormGroup;
  hasSearched = false;
  showCollaborators = false;
  selectedColaborador: ColaboradorSeleccionado | null = null;
  showModal = false;
  animateModal = false;

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private serviciosService: ServiciosService,
    private catalogoService: CatalogoService,
    private colaboradorService: ColaboradorService,
    private seguimientoService: SeguimientoService,
    private archivoDescarga: ArchivoDescargaService,
    private dialogos: DialogosService
  ) {}

  ngOnInit(): void {
    this.formBusqueda = this.fb.group({
      servicio: [null],
      departamento: [null],
      municipio: [null],
    });
    this.serviciosService.obtenerServicios().subscribe((lista) => (this.servicios = lista));
    this.catalogoService.obtenerDepartamentos().subscribe((lista) => (this.departamentos = lista));
  }

  /** Cargar municipios al cambiar departamento */
  onDepartamentoChange(): void {
    const idDepartamento = this.formBusqueda.get('departamento')?.value;
    if (!idDepartamento) return;
    this.catalogoService.obtenerMunicipios(idDepartamento).subscribe((lista) => (this.municipios = lista));
  }

  /** Buscar colaboradores */
  obtenerColaboradores(): void {
    const { servicio, municipio } = this.formBusqueda.value;
    if (!servicio || !municipio) {
      this.dialogos.informar('Por favor selecciona un servicio y un municipio.');
      return;
    }
    this.loader.start();
    this.colaboradorService
      .buscar(servicio, municipio)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        next: (lista) => {
          this.hasSearched = true;
          this.colaboradores = lista;
          this.showCollaborators = lista.length > 0;
        },
        error: () => {
          // El interceptor ya mostró el motivo (p. ej. "No se encontraron colaboradores").
          this.hasSearched = true;
          this.showCollaborators = false;
        },
      });
  }

  /** Abrir modal */
  openModal(colaborador: Colaborador): void {
    this.obtenerDetalleColaborador(colaborador.id_persona);
    this.showModal = true;
    setTimeout(() => (this.animateModal = true), 10);
  }

  /** Cerrar modal */
  closeModal(): void {
    this.animateModal = false;
    setTimeout(() => {
      this.showModal = false;
      this.selectedColaborador = null;
    }, 300);
  }

  private obtenerDetalleColaborador(idColaborador: number): void {
    this.loader.start();
    this.colaboradorService
      .obtenerDetalle(idColaborador)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe((detalle) => {
        if (detalle) {
          this.selectedColaborador = aSeleccionado(detalle);
        }
      });
  }

  /** Seguir / dejar de seguir colaborador (sirve para un ítem de la lista y para el modal). */
  toggleSeguirColaborador(c: { id_persona: number; seguido: number }): void {
    const yaLoSigue = c.seguido === 1;
    const peticion = yaLoSigue
      ? this.seguimientoService.dejarDeSeguir(c.id_persona)
      : this.seguimientoService.seguir(c.id_persona);

    peticion.subscribe((resp) => {
      this.dialogos.informar(resp.mensajeRespuesta ?? '');
      const nuevo = yaLoSigue ? 0 : 1;
      c.seguido = nuevo;
      // Mantener sincronizados la lista principal y el modal
      this.colaboradores = this.colaboradores.map((col) =>
        col.id_persona === c.id_persona ? { ...col, seguido: nuevo } : col
      );
      if (this.selectedColaborador?.id_persona === c.id_persona) {
        this.selectedColaborador.seguido = nuevo;
      }
    });
  }

  /** Convertir base64 a imagen */
  getImageSrc(base64: string | null): string {
    return fotoSrc(base64) as string;
  }

  /** Descargar CV */
  obtenerCvColaborador(c: { id_persona: number }): void {
    this.loader.start();
    this.colaboradorService
      .obtenerCv(c.id_persona)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe((cv) => {
        if (cv) {
          this.archivoDescarga.descargar(cv);
        }
      });
  }
}
