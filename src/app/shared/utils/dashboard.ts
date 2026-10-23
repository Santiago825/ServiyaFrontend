/** Funciones puras de los gráficos del dashboard (sin Angular). */

/** Porcentaje entero de `valor` sobre `total` (0 si el total es 0). */
export function porcentaje(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 100) : 0;
}

/**
 * Alto (en %) de una barra respecto al máximo. Un valor > 0 nunca queda por debajo de `minimo`
 * para que siempre se vea; 0 queda en 0.
 */
export function alturaBarra(valor: number, maximo: number, minimo = 6): number {
  if (valor <= 0 || maximo <= 0) {
    return 0;
  }
  return Math.max(minimo, Math.round((valor / maximo) * 100));
}

/** "2026-10" -> "oct". */
export function etiquetaMes(mes: string): string {
  const [anio, numero] = mes.split('-').map(Number);
  return new Date(anio, numero - 1, 1).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
}

/** 2500000 -> "$2,5 M"; 45000 -> "$45 mil"; 800 -> "$800". Para etiquetas en espacios pequeños. */
export function monedaCompacta(valor: number): string {
  if (valor >= 1_000_000) {
    return `$${(valor / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')} M`;
  }
  if (valor >= 1_000) {
    return `$${Math.round(valor / 1_000)} mil`;
  }
  return `$${Math.round(valor)}`;
}
