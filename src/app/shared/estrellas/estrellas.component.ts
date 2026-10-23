import { Component, EventEmitter, Input, Output } from '@angular/core';
import { claseEstrella } from 'src/app/shared/utils/estrellas';

/**
 * Estrellas de 0 a 5. Solo lectura por defecto (admite medias estrellas: 4.3 se ve como 4.5);
 * con [editable]="true" la persona elige de 1 a 5 y se emite (valorChange), por lo que sirve con
 * [(valor)]. Un solo componente para mostrar promedios, reseñas y capturar la puntuación.
 */
@Component({
  selector: 'app-estrellas',
  template: `
    <span class="inline-flex items-center gap-0.5 text-yellow-400" [attr.aria-label]="valor + ' de 5 estrellas'">
      <ng-container *ngFor="let i of posiciones">
        <button
          *ngIf="editable; else soloLectura"
          type="button"
          class="p-0.5 hover:scale-110 transition-transform"
          [attr.aria-label]="i + (i === 1 ? ' estrella' : ' estrellas')"
          (click)="elegir(i)"
          (mouseenter)="hover = i"
          (mouseleave)="hover = 0"
        >
          <i [ngClass]="clase(i)" [style.font-size]="tamano"></i>
        </button>
        <ng-template #soloLectura><i [ngClass]="clase(i)" [style.font-size]="tamano"></i></ng-template>
      </ng-container>
    </span>
  `,
})
export class EstrellasComponent {
  @Input() valor = 0;
  @Input() editable = false;
  /** Tamaño de cada estrella (CSS), p. ej. "1.75rem". Por defecto hereda el del texto. */
  @Input() tamano: string | null = null;
  @Output() valorChange = new EventEmitter<number>();

  readonly posiciones = [1, 2, 3, 4, 5];
  hover = 0;

  clase(posicion: number): string {
    return claseEstrella(this.editable && this.hover ? this.hover : this.valor, posicion);
  }

  elegir(valor: number): void {
    this.valor = valor;
    this.valorChange.emit(valor);
  }
}
