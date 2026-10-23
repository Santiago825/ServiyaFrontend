import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { SessionStore } from 'src/app/core/session/session.store';
import { DashboardColaborador, MesIngreso } from 'src/app/models/dashboard-colaborador';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { alturaBarra, etiquetaMes, monedaCompacta, porcentaje } from 'src/app/shared/utils/dashboard';

interface SegmentoEstado {
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface FilaEstrellas {
  estrellas: number;
  cantidad: number;
  porcentaje: number;
}

/**
 * Resumen del inicio del colaborador: contratos, valor aceptado, calificaciones, seguidores,
 * próximos contratos y últimas reseñas. Solo presenta lo que calcula el backend (dashboard_colaborador).
 */
@Component({
  selector: 'app-dashboard-colaborador',
  templateUrl: './dashboard-colaborador.component.html',
})
export class DashboardColaboradorComponent implements OnInit {
  datos: DashboardColaborador | null = null;
  cargando = true;
  fallo = false;

  usuario = '';
  readonly hoy = new Date();
  readonly etiquetaMes = etiquetaMes;
  readonly monedaCompacta = monedaCompacta;

  constructor(private dashboardService: DashboardService, private session: SessionStore) {}

  ngOnInit(): void {
    this.usuario = this.session.getUser().username;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.fallo = false;
    this.dashboardService
      .obtenerColaborador()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (datos) => (this.datos = datos),
        error: () => (this.fallo = true),
      });
  }

  /** Alto de la barra de un mes, respecto al mejor mes. */
  alturaMes(mes: MesIngreso): number {
    const maximo = Math.max(0, ...(this.datos?.ingresos.porMes ?? []).map((m) => m.total));
    return alturaBarra(mes.total, maximo);
  }

  /** Reparto de los contratos por estado de respuesta. */
  get segmentos(): SegmentoEstado[] {
    const c = this.datos?.contratos;
    if (!c) {
      return [];
    }
    return [
      { etiqueta: 'Aceptados', cantidad: c.aceptados, porcentaje: porcentaje(c.aceptados, c.total), color: 'bg-green-500' },
      { etiqueta: 'Pendientes', cantidad: c.pendientes, porcentaje: porcentaje(c.pendientes, c.total), color: 'bg-yellow-400' },
      { etiqueta: 'Rechazados', cantidad: c.rechazados, porcentaje: porcentaje(c.rechazados, c.total), color: 'bg-red-400' },
    ];
  }

  /** De 5 a 1 estrellas, con su cantidad y su proporción del total de reseñas. */
  get filasEstrellas(): FilaEstrellas[] {
    const r = this.datos?.resenas;
    if (!r) {
      return [];
    }
    return [5, 4, 3, 2, 1].map((estrellas) => {
      const cantidad = r.distribucion[estrellas - 1] ?? 0;
      return { estrellas, cantidad, porcentaje: porcentaje(cantidad, r.total) };
    });
  }

  get hayIngresos(): boolean {
    return (this.datos?.ingresos.porMes ?? []).some((m) => m.total > 0);
  }
}
