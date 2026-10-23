/** ResenaRecibidaDTO del backend (GET mis_resenas_colaborador). */
export interface ResenaRecibida {
  idResena: number;
  puntuacion: number;
  comentario: string | null;
  idContrato: number;
  nombreContrato: string;
  descripcionContrato: string | null;
  nombreContratante: string;
}
