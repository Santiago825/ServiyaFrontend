/** Envoltorio estándar de listas del backend (ListaDTO). */
export interface ListaResponse<T> {
  codigoRespuesta: string;
  mensajeRespuesta?: string;
  totalRegistros?: number;
  totalPaginas?: number;
  lista?: T[];
}

/** Cuerpo de TODOS los errores del backend (ErrorResponse). */
export interface ErrorResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  status?: number;
  path?: string;
  timestamp?: string;
  /** Solo en validaciones: campo -> mensaje. */
  errores?: Record<string, string>;
}
