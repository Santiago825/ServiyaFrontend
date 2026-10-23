/** ResenaDTO del backend. */
export interface Resena {
  id_colaborador?: number;
  nombre: string;
  comentario: string;
  puntuacion: number;
}

/** DetalleColaboradorDTO del backend. */
export interface DetalleColaborador {
  id_persona: number;
  nombre: string;
  apellido: string;
  telefono: string;
  municipio: string;
  servicio: string;
  username: string;
  numero_resenas: number;
  resena: Resena[];
  foto: string | null;
  descripcion: string;
  seguido: number;
}
