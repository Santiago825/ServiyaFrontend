/** Una página de resultados (la lista de la página y los totales de toda la consulta). */
export interface Pagina<T> {
  items: T[];
  totalRegistros: number;
  totalPaginas: number;
}
