import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { finalize } from 'rxjs';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { Contrato } from 'src/app/models/contrato';
import { ResenaService } from 'src/app/services/resena/resena.service';

/**
 * Ventana para reseñar al colaborador de un contrato: estrellas (obligatorio) y comentario (opcional).
 * Solo captura y envía; si el backend rechaza (409 ya reseñado / fecha no cumplida) el interceptor
 * muestra el motivo.
 */
@Component({
  selector: 'app-resena-modal',
  templateUrl: './resena-modal.component.html',
})
export class ResenaModalComponent {
  @Input() contrato!: Contrato;
  @Output() cerrar = new EventEmitter<void>();
  /** Se emite tras guardar (o si el servidor dice que ya estaba reseñado) para refrescar la lista. */
  @Output() enviada = new EventEmitter<void>();

  readonly maxComentario = 255;
  puntuacion = 0;
  comentario = '';
  intentoEnvio = false;
  enviando = false;

  constructor(private resenaService: ResenaService, private dialogos: DialogosService) {}

  enviar(): void {
    this.intentoEnvio = true;
    if (!this.puntuacion || this.enviando) {
      return;
    }
    this.enviando = true;
    this.resenaService
      .resenar(this.contrato.idContrato, { puntuacion: this.puntuacion, comentario: this.comentario })
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => {
          this.dialogos.exito('¡Gracias por tu reseña!', 'Tu opinión ayuda a otros contratantes.', 2000);
          this.enviada.emit();
        },
        error: (e: HttpErrorResponse) => {
          if (e.status === 409) {
            this.enviada.emit(); // el estado cambió (p. ej. ya reseñado): refrescar la lista
          }
        },
      });
  }
}
