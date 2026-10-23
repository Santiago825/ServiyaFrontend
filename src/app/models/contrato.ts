export type EstadoContrato = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export interface Contrato {
  idContrato: number;
  nombreContrato: string;
  nombreColaborador: string;
  nombreContratante: string;
  direccion: string;
  precio: string;
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string; // yyyy-MM-dd
  estado: EstadoContrato;
  fechaRespuesta: string | null; // yyyy-MM-dd
  /** Solo en el listado del contratante: ya dejó su reseña. */
  resenado: boolean;
  /** El backend decide: aceptado, fecha de fin cumplida y sin reseña previa. */
  puedeResenar: boolean;
}

export interface ContratoDetalle extends Contrato {
  telefono: string;
  descripcion: string;
  nombreArchivo: string | null;
  foto: string | null; // foto del colaborador (base64)
}

export const ESTADO_ETIQUETA: Record<EstadoContrato, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
};

export const ESTADO_CLASES: Record<EstadoContrato, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  ACEPTADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
};