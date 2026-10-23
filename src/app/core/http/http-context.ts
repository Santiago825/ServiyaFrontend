import { HttpContextToken } from '@angular/common/http';

/**
 * Úsalo en una petición para que el interceptor de errores NO muestre el diálogo (p. ej. al cargar
 * mensajes antiguos con el scroll del chat, o cuando el propio componente maneja el error):
 *   this.http.get(url, { context: new HttpContext().set(SKIP_ERROR_DIALOG, true) })
 */
export const SKIP_ERROR_DIALOG = new HttpContextToken<boolean>(() => false);
