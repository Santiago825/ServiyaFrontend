/**
 * PersonaRainting del backend (GET obtener_personas_raiting): los 4 colaboradores mejor valorados,
 * ordenados por promedio de estrellas (solo cuentan los que tienen al menos una reseña).
 */
export interface PersonaRanking {
  idPersona: number;
  nombre: string;
  foto: string | null;
  municipio: string | null;
  servicio: string | null;
  /** Promedio de estrellas, de 1 a 5 con un decimal. */
  promedio: number;
  numeroResenas: number;
}
