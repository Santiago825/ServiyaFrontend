import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CONSTANTES } from 'src/app/constants/constants';
import { Servicio } from 'src/app/models/servicio';
import { colaborador } from 'src/app/models/colaborador';
import { RequestSeguidor } from 'src/app/models/requestSeguidor';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  colaboradores: colaborador[] = [];

  formBusqueda!: FormGroup;
  hasSearched = false;
  showCollaborators = false;

  selectedColaborador: any = null;
  showModal = false;
  animateModal = false;

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private servicioService: ServiciosService,
    private generalService: GeneralService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.formBusqueda = this.fb.group({
      servicio: [null],
      departamento: [null],
      municipio: [null],
    });

    this.obtenerServicios();
    this.cargarDepartamentos();
  }

  /** 🔹 Obtener servicios */
  private obtenerServicios(): void {
    this.servicioService.obtenerServicios().subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.servicios = resp['lista'] || [];
        }
      },
      error: (err) => console.error('Error cargando servicios:', err),
    });
  }

  /** 🔹 Cargar departamentos */
  private cargarDepartamentos(): void {
    this.generalService.obtenerDepartamento().subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.departamentos = resp['lista'] || [];
        }
      },
      error: (err) => console.error('Error cargando departamentos:', err),
    });
  }

  /** 🔹 Cargar municipios al cambiar departamento */
  onDepartamentoChange(): void {
    const idDepartamento = this.formBusqueda.get('departamento')?.value;
    if (!idDepartamento) return;

    this.generalService.obtenerMunicipio(idDepartamento).subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.municipios = resp['lista'] || [];
        }
      },
      error: (err) => console.error('Error cargando municipios:', err),
    });
  }

  /** 🔹 Buscar colaboradores */
  obtenerColaboradores(): void {
    const { servicio, municipio } = this.formBusqueda.value;
    if (!servicio || !municipio) {
      this.generalService.alertaMensajeInformacion(
        'Por favor selecciona un servicio y un municipio.'
      );
      return;
    }

    this.loader.start();
    this.servicioService.obtenerColaboradors(servicio, municipio).subscribe({
      next: (resp) => {
        this.hasSearched = true;
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          this.colaboradores = resp['lista'] || [];
          this.showCollaborators = this.colaboradores.length > 0;
        } else {
          this.showCollaborators = false;
        }
      },
      error: (err) => {
        console.error('Error cargando colaboradores:', err);
        this.showCollaborators = false;
      },
      complete: () => this.loader.stop(),
    });
  }

  /** 🔹 Abrir modal */
  openModal(colaborador: any): void {
    this.obtenerDetalleColaborador(colaborador.id_persona);
    this.showModal = true;
    setTimeout(() => (this.animateModal = true), 10);
  }

  /** 🔹 Cerrar modal */
  closeModal(): void {
    this.animateModal = false;
    setTimeout(() => {
      this.showModal = false;
      this.selectedColaborador = null;
    }, 300);
  }

  /** 🔹 Obtener detalle del colaborador */
  private obtenerDetalleColaborador(idColaborador: number): void {
    this.loader.start();
    this.servicioService.obtenerDetalleColaborador(idColaborador).subscribe({
      next: (resp) => {
        if (resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK) {
          const lista = resp['lista']?.[0];
          if (!lista) return;

          this.selectedColaborador = {
            id_persona: lista.id_persona,
            foto: this.getImageSrc(lista.foto),
            nombre: `${lista.nombre} ${lista.apellido}`,
            telefono: lista.telefono,
            descripcion: lista.descripcion,
            ciudad: lista.municipio,
            correo: lista.username,
            categoria: lista.servicio,
            resenas: lista.numero_resenas,
            seguido: lista.seguido,
            comentarios:
              lista.resena?.map((r: any) => ({
                usuario: r.nombre,
                texto: r.comentario,
                estrellas: r.puntuacion,
              })) || [],
          };
        }
      },
      error: (error) => console.error('Error obteniendo detalle:', error),
      complete: () => this.loader.stop(),
    });
  }

  /** 🔹 Seguir / dejar de seguir colaborador */
  toggleSeguirColaborador(c: any): void {
    const { idUsuario } = this.authService.getUser();
    const request: RequestSeguidor = {
      contratante: idUsuario,
      colaborador: c.id_persona,
    };

    const accion = c.seguido === 1 ? 'dejarSeguirColaborador' : 'seguirColaborador';

    this.servicioService[accion](request).subscribe({
      next: (resp) => {
        this.generalService.alertaMensajeInformacion(
          resp[CONSTANTES.MENSAJE_RESPUESTA]
        );
        c.seguido = c.seguido === 1 ? 0 : 1;

        // Actualizar lista principal y modal si aplica
        this.colaboradores = this.colaboradores.map(col =>
          col.id_persona === c.id_persona ? { ...col, seguido: c.seguido } : col
        );

        if (this.selectedColaborador?.id_persona === c.id_persona) {
          this.selectedColaborador.seguido = c.seguido;
        }
      },
      error: (error) => console.error('Error al seguir/dejar de seguir:', error),
    });
  }

  /** 🔹 Convertir base64 a imagen */
   getImageSrc(base64: string | null): string {
    return base64
      ? `data:image/jpeg;base64,${base64}`
      : 'assets/img/default-avatar.png';
  }

  /** 🔹 Descargar CV */
  obtenerCvColaborador(c: any): void {
    this.loader.start();
    this.servicioService.obtenerCv(c.id_persona).subscribe({
      next: (resp) => {
        const cv = resp['lista']?.[0];
        if (!cv?.contenidoBase64) return;

        const byteArray = Uint8Array.from(atob(cv.contenidoBase64), (char) =>
          char.charCodeAt(0)
        );
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${cv.nombre}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error al descargar CV:', error),
      complete: () => this.loader.stop(),
    });
  }
}
