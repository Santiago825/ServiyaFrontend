/** Cuerpo de POST resenar_contrato/{id} (ResenarContratoRequest del backend). */
export interface ResenarContratoRequest {
  /** 1 a 5. */
  puntuacion: number;
  /** Opcional, máximo 255 caracteres. */
  comentario: string;
}
