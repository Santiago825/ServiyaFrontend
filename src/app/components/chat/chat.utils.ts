import { MensajeChat } from 'src/app/models/chat';

/** Funciones puras del chat (sin Angular): se pueden probar y reutilizar aparte del componente. */

/** Minúsculas y sin tildes, para buscar sin importar cómo se escribió. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Une dos listas de mensajes sin duplicados (por id) y en orden cronológico. */
export function fusionarMensajes(a: MensajeChat[], b: MensajeChat[]): MensajeChat[] {
  const porId = new Map<number, MensajeChat>();
  a.forEach((m) => porId.set(m.id, m));
  b.forEach((m) => porId.set(m.id, m));
  return [...porId.values()].sort((x, y) => x.id - y.id);
}

/** Hora de un mensaje: "14:05". */
export function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/** Etiqueta de la lista: hoy → hora, ayer → "Ayer", antes → dd/mm/aa. */
export function etiquetaListaDe(iso: string): string {
  const d = new Date(iso);
  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
  if (d.getTime() >= inicioHoy) {
    return horaDe(iso);
  }
  if (d.getTime() >= inicioHoy - 24 * 60 * 60 * 1000) {
    return 'Ayer';
  }
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
