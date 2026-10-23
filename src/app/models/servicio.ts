/** ServicioDTO del backend. */
export interface Servicio {
  idServicio: number;
  nombre: string;
  usos?: number;
  icono?: string | null;
}
