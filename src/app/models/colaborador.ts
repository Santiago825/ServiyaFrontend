/** ColaboradorDTO del backend (resultado de la búsqueda). */
export interface Colaborador {
  id_persona: number;
  nombre: string;
  apellido: string;
  telefono: string;
  municipio: string;
  servicio: string;
  numero_resenas: number;
  foto: string | null;
  /** 1 si el contratante autenticado ya lo sigue; 0 si no. */
  seguido: number;
}
