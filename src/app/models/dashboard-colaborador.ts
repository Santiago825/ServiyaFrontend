import { ResenaRecibida } from './resena-recibida';

/** DashboardColaboradorDTO del backend (GET dashboard_colaborador). Fechas en formato yyyy-MM-dd. */
export interface DashboardColaborador {
  contratos: {
    total: number;
    pendientes: number;
    aceptados: number;
    rechazados: number;
    /** Aceptados cuya fecha de hoy está entre inicio y fin. */
    enCurso: number;
    porIniciar: number;
    finalizados: number;
    /** % de aceptados sobre los ya respondidos; null si aún no hay respuestas. */
    tasaAceptacion: number | null;
  };
  ingresos: {
    /** Suma del precio de los contratos aceptados. */
    totalAceptado: number;
    mesActual: number;
    /** Últimos 6 meses (el actual incluido), según la fecha de inicio del contrato. */
    porMes: MesIngreso[];
  };
  resenas: {
    total: number;
    promedio: number | null;
    /** [0] = reseñas de 1 estrella ... [4] = reseñas de 5 estrellas. */
    distribucion: number[];
  };
  seguidores: number;
  proximos: ContratoProximo[];
  ultimasResenas: ResenaRecibida[];
}

export interface MesIngreso {
  /** "2026-10" */
  mes: string;
  total: number;
  contratos: number;
}

export interface ContratoProximo {
  idContrato: number;
  nombreContrato: string;
  nombreContratante: string;
  fechaInicio: string;
  fechaFin: string;
}
