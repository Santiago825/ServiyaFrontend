import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { ContratoService } from 'src/app/services/Contrato/contrato.service';
import {
  Contrato,
  ContratoDetalle,
  ESTADO_CLASES,
  ESTADO_ETIQUETA,
} from 'src/app/models/contrato';

@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.css'],
})
export class ContratoComponent implements OnInit {
  contratos: Contrato[] = [];
  /** Contrato cuyo detalle se está viendo (abre el modal compartido). */
  idContratoDetalle: number | null = null;
  /** Detalle ya cargado por el modal: se necesita para decidir (aceptar / rechazar). */
  selectedContract: ContratoDetalle | null = null;
  /** Contrato que se está reseñando (abre el modal de reseña). */
  contratoAResenar: Contrato | null = null;

  readonly etiqueta = ESTADO_ETIQUETA;
  readonly clases = ESTADO_CLASES;

  constructor(
    private contratoService: ContratoService,
    private loader: NgxUiLoaderService,
    private dialogos: DialogosService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loader.start();
    this.contratoService
      .misContratos()
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        next: (lista) => (this.contratos = lista),
        error: (e) => console.error('Error al obtener contratos:', e),
      });
  }

  /** Abre el detalle (solo lectura); el modal compartido lo carga por id. */
  verDetalle(contrato: Contrato): void {
    this.selectedContract = null;
    this.idContratoDetalle = contrato.idContrato;
  }

  cerrarDetalle(): void {
    this.idContratoDetalle = null;
    this.selectedContract = null;
  }

  alCargarDetalle(detalle: ContratoDetalle): void {
    this.selectedContract = detalle;
  }

  async decidir(aceptar: boolean): Promise<void> {
    const c = this.selectedContract;
    if (!c || c.estado !== 'PENDIENTE') {
      return;
    }
    const confirmado = await this.dialogos.confirmar({
      titulo: aceptar ? '¿Aceptar este contrato?' : '¿Rechazar este contrato?',
      texto: 'Esta decisión no se puede cambiar después.',
      textoConfirmar: aceptar ? 'Sí, aceptar' : 'Sí, rechazar',
      colorConfirmar: aceptar ? '#16a34a' : '#dc2626',
    });
    if (!confirmado) {
      return;
    }
    this.loader.start();
    const peticion = aceptar
      ? this.contratoService.aceptarContrato(c.idContrato)
      : this.contratoService.rechazarContrato(c.idContrato);
    peticion.pipe(finalize(() => this.loader.stop())).subscribe({
      next: () => {
        this.dialogos.exito(aceptar ? 'Contrato aceptado' : 'Contrato rechazado', undefined, 1800);
        this.cerrarDetalle();
        this.cargar();
      },
      // El interceptor ya muestra el motivo (p. ej. "ya fue aceptado"); se refresca el estado real.
      error: () => this.cargar(),
    });
  }

  // ───── Reseñas ─────

  abrirResena(contrato: Contrato): void {
    if (contrato.puedeResenar) {
      this.contratoAResenar = contrato;
    }
  }

  cerrarResena(): void {
    this.contratoAResenar = null;
  }

  /** Tras reseñar: se cierra el modal y se recarga la lista para ver "Reseñado". */
  alResenar(): void {
    this.cerrarResena();
    this.cargar();
  }

  /** Texto de ayuda del botón: por qué está deshabilitado (o qué hace si está habilitado). */
  tituloResenar(c: Contrato): string {
    if (c.resenado) {
      return 'Ya reseñaste este contrato';
    }
    if (c.estado !== 'ACEPTADO') {
      return 'Solo puedes reseñar contratos aceptados';
    }
    if (!c.puedeResenar) {
      return `Podrás reseñar a partir del ${c.fechaFin.split('-').reverse().join('/')}`;
    }
    return 'Reseñar al colaborador';
  }
}
