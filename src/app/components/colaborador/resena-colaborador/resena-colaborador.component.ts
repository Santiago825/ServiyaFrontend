import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pagina } from 'src/app/models/pagina';
import { ResenaRecibida } from 'src/app/models/resena-recibida';
import { ResenaService } from 'src/app/services/resena/resena.service';
import { ventanaPaginas } from 'src/app/shared/utils/paginacion';

const VACIA: Pagina<ResenaRecibida> = { items: [], totalRegistros: 0, totalPaginas: 0 };

/**
 * Pestaña "Reseñas" del colaborador: todas las que ha recibido (más recientes primero), con búsqueda
 * por contratante / contrato / descripción y paginación. La búsqueda y la paginación las hace el
 * backend; aquí solo se coordina la pantalla.
 */
@Component({
  selector: 'app-resena-colaborador',
  templateUrl: './resena-colaborador.component.html',
  styleUrls: ['./resena-colaborador.component.css'],
})
export class ResenaColaboradorComponent implements OnInit, OnDestroy {
  readonly buscador = new FormControl('', { nonNullable: true });
  readonly opcionesTamano = [5, 10, 20];

  resenas: ResenaRecibida[] = [];
  pagina = 0; // base 0
  tamano = 10;
  totalRegistros = 0;
  totalPaginas = 0;
  cargando = false;
  /** Contrato cuyo detalle se está viendo (abre el modal compartido). */
  idContratoDetalle: number | null = null;

  private readonly consultar$ = new Subject<void>();
  private readonly destruir$ = new Subject<void>();

  constructor(private resenaService: ResenaService) {}

  ngOnInit(): void {
    // Cada consulta cancela la anterior (switchMap): si se escribe rápido, solo vale la última.
    this.consultar$
      .pipe(
        tap(() => (this.cargando = true)),
        switchMap(() =>
          this.resenaService
            .recibidas(this.buscador.value.trim(), this.pagina, this.tamano)
            // El interceptor ya mostró el error; la pantalla queda vacía en vez de rota.
            .pipe(catchError(() => of(VACIA)))
        ),
        takeUntil(this.destruir$)
      )
      .subscribe((resultado) => {
        this.resenas = resultado.items;
        this.totalRegistros = resultado.totalRegistros;
        this.totalPaginas = resultado.totalPaginas;
        this.cargando = false;
        // Si la página pedida quedó fuera de rango (p. ej. tras filtrar), vuelve a la última válida.
        if (!resultado.items.length && this.pagina > 0 && this.totalPaginas > 0) {
          this.irA(this.totalPaginas - 1);
        }
      });

    // Al escribir: espera 300 ms, y vuelve a la primera página.
    this.buscador.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destruir$))
      .subscribe(() => {
        this.pagina = 0;
        this.consultar$.next();
      });

    this.consultar$.next();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  irA(pagina: number): void {
    if (pagina < 0 || (this.totalPaginas && pagina >= this.totalPaginas) || pagina === this.pagina) {
      return;
    }
    this.pagina = pagina;
    this.consultar$.next();
  }

  cambiarTamano(valor: string): void {
    this.tamano = Number(valor);
    this.pagina = 0;
    this.consultar$.next();
  }

  verContrato(resena: ResenaRecibida): void {
    this.idContratoDetalle = resena.idContrato;
  }

  cerrarContrato(): void {
    this.idContratoDetalle = null;
  }

  limpiarBusqueda(): void {
    this.buscador.setValue(''); // dispara la consulta por valueChanges
  }

  get paginasVisibles(): number[] {
    return ventanaPaginas(this.pagina, this.totalPaginas);
  }

  /** "Mostrando 11–20 de 37". */
  get rango(): string {
    if (!this.totalRegistros) {
      return '';
    }
    const desde = this.pagina * this.tamano + 1;
    const hasta = Math.min(desde + this.resenas.length - 1, this.totalRegistros);
    return `Mostrando ${desde}–${hasta} de ${this.totalRegistros}`;
  }

  get hayBusqueda(): boolean {
    return this.buscador.value.trim().length > 0;
  }

  trackPorId(_: number, r: ResenaRecibida): number {
    return r.idResena;
  }
}
