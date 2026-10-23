/**
 * Números de página (base 0) que se muestran en el paginador: una ventana de hasta `maximo`
 * páginas centrada en la actual. Ej.: actual=5, total=20, maximo=5 -> [3, 4, 5, 6, 7].
 */
export function ventanaPaginas(actual: number, total: number, maximo = 5): number[] {
  if (total <= 0) {
    return [];
  }
  const cantidad = Math.min(maximo, total);
  let inicio = Math.max(0, actual - Math.floor(cantidad / 2));
  inicio = Math.min(inicio, total - cantidad);
  return Array.from({ length: cantidad }, (_, i) => inicio + i);
}
