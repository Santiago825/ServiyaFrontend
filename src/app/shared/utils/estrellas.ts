/**
 * Clase de Font Awesome de la estrella número `posicion` (1 a 5) para un valor de 0 a 5.
 * El valor se redondea a la media estrella más cercana: 4.3 -> 4.5 (4 llenas + 1 media).
 */
export function claseEstrella(valor: number, posicion: number): string {
  const redondeado = Math.round((valor || 0) * 2) / 2;
  if (redondeado >= posicion) {
    return 'fas fa-star';
  }
  if (redondeado >= posicion - 0.5) {
    return 'fas fa-star-half-stroke';
  }
  return 'far fa-star';
}

/** Promedio de una lista de puntuaciones (0 si está vacía). */
export function promedio(puntuaciones: number[]): number {
  return puntuaciones.length ? puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length : 0;
}
