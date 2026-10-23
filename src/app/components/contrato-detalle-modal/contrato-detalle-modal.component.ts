import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs';
import { ContratoDetalle, ESTADO_CLASES, ESTADO_ETIQUETA } from 'src/app/models/contrato';
import { ArchivoDescargaService } from 'src/app/services/archivo/archivo-descarga.service';
import { ContratoService } from 'src/app/services/Contrato/contrato.service';
import { fotoSrc } from 'src/app/shared/utils/foto';

/**
 * Ventana de solo lectura con TODA la información de un contrato y la descarga de su archivo
 * adjunto. La usan el contratante, el colaborador y la pestaña de reseñas: carga el detalle por id
 * (el backend solo lo entrega a quien participa del contrato) y lo que cada pantalla necesite
 * añadir (p. ej. los botones Aceptar / Rechazar) se proyecta dentro con <ng-content>.
 */
@Component({
  selector: 'app-contrato-detalle-modal',
  templateUrl: './contrato-detalle-modal.component.html',
  animations: [
    trigger('fadeZoom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))]),
    ]),
  ],
})
export class ContratoDetalleModalComponent implements OnInit {
  @Input() idContrato!: number;
  /** Foto del colaborador. Se oculta en las pantallas del propio colaborador (sería su foto). */
  @Input() mostrarFoto = true;
  @Output() cerrar = new EventEmitter<void>();
  /** Se emite cuando el detalle ya cargó (el padre puede necesitar su estado, p. ej. para decidir). */
  @Output() cargado = new EventEmitter<ContratoDetalle>();

  contrato: ContratoDetalle | null = null;

  readonly etiqueta = ESTADO_ETIQUETA;
  readonly clases = ESTADO_CLASES;

  constructor(
    private contratoService: ContratoService,
    private archivoDescarga: ArchivoDescargaService,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.contratoService
      .detalleContrato(this.idContrato)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        next: (detalle) => {
          if (detalle) {
            this.contrato = detalle;
            this.cargado.emit(detalle);
          } else {
            this.cerrar.emit();
          }
        },
        // El interceptor ya mostró el motivo (p. ej. "Contrato no encontrado").
        error: () => this.cerrar.emit(),
      });
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar.emit();
  }

  descargar(): void {
    if (!this.contrato) {
      return;
    }
    this.loader.start();
    this.contratoService
      .obtenerArchivoContrato(this.contrato.idContrato)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe((archivo) => {
        if (archivo) {
          this.archivoDescarga.descargar(archivo);
        }
      });
  }

  fotoSrc(foto: string | null | undefined): string | null {
    return fotoSrc(foto, null);
  }
}
