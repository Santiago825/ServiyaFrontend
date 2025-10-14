import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ColaboradoresService } from 'src/app/services/colaboradores.service';
import { colaborador } from 'src/app/models/colaborador';
import { Servicio } from 'src/app/models/servicio';
import { detalleColaborador } from 'src/app/models/detalleColaborador';

import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { CONSTANTES } from 'src/app/constants/constants';

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
  detalleColaborador: detalleColaborador[] = [];
  formBusqueda!: FormGroup;

  hasSearched = false;
  showCollaborators = false;

  selectedColaborador: any = null;
  showModal = false;
  animateModal = false;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private colaboradoresService: ColaboradoresService,
    private servicioService: ServiciosService,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.formBusqueda = this.fb.group({
      servicio: [null],
      departamento: [null],
      municipio: [null],
    });

    this.obtenerServicios();
    this.cargarDepartamentos();
  }

  /** Cargar lista de servicios */
  obtenerServicios(): void {
    this.servicioService.obtenerServicios().subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.servicios = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando servicios:', err),
    });
  }

  /** Cargar departamentos */
  cargarDepartamentos(): void {
    this.generalService.obtenerDepartamento().subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.departamentos = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando departamentos:', err),
    });
  }

  /** Cargar municipios cuando cambia el departamento */
  onDepartamentoChange(): void {
    const idDepartamento = this.formBusqueda.get('departamento')?.value;
    if (!idDepartamento) return;

    this.generalService.obtenerMunicipio(idDepartamento).subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.municipios = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando municipios:', err),
    });
  }

  /** Buscar colaboradores según servicio y municipio */
  obtenerColaboradores(): void {
    this.colaboradores = [];
    const { servicio, municipio } = this.formBusqueda.value;

    if (!servicio || !municipio) {
      alert('Por favor selecciona un servicio y un municipio.');
      return;
    }

    this.servicioService.obtenerColaboradors(servicio, municipio).subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.hasSearched = true;
          if (resp['lista'] != null) {
            this.showCollaborators = resp['lista'].length > 0;
            this.colaboradores = resp['lista'];
          } else {
            this.hasSearched = true;
            this.showCollaborators = false;
          }
        }
      },
      error: (err) => {
        console.error('Error cargando colaboradores:', err);
        this.hasSearched = true;
        this.showCollaborators = false;
      },
    });
  }

  /** Modal: abrir perfil colaborador */
  openModal(colaborador: any): void {
    this.obtenerDetalleColaborador(colaborador.id_persona);
    this.showModal = true;

    // Delay para activar la animación
    setTimeout(() => (this.animateModal = true), 10);
  }

  /** Modal: cerrar perfil */
  closeModal(): void {
    this.animateModal = false;
    setTimeout(() => {
      this.showModal = false;
      this.selectedColaborador = null;
    }, 300);
  }
  obtenerDetalleColaborador(idColaborador: number) {
    this.servicioService.obtenerDetalleColaborador(idColaborador).subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          const lista = resp['lista'][0];
          this.selectedColaborador = {
            foto: this.getImageSrc(lista.foto),
            nombre: `${lista.nombre} ${lista.apellido}`,
            telefono: lista.telefono,
            descripcion: lista.descripcion,
            ciudad: lista.municipio,
            correo: lista.username,
            categoria: lista.servicio,
            resenas: lista.numero_resenas,
            comentarios:
              lista.resena?.map((r: any) => ({
                usuario: `${r.nombre}`,
                texto: r.comentario,
                estrellas: r.puntuacion,
              })) || [],
          };
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  /** Acciones */
  seguirColaborador(c: any): void {
    console.log('Siguiendo a:', c.nombre);
    alert('Ahora sigues a ' + c.nombre);
  }

  contactarColaborador(c: any): void {
    console.log('Contactando a:', c.nombre);
    alert('Has enviado una solicitud de contacto a ' + c.nombre);
  }
  getImageSrc(base64String: string | null): string {
    if (!base64String) {
      return 'assets/img/default-avatar.png'; // Imagen por defecto
    }
    return `data:image/jpeg;base64,${base64String}`;
  }
}
