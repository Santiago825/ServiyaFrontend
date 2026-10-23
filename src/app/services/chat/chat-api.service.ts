import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { SKIP_ERROR_DIALOG } from 'src/app/core/http/http-context';
import { ConversacionResumen, MensajePagina } from 'src/app/models/chat';

/** Consultas HTTP del chat (historial, vista previa, presencia). El tiempo real está en ChatService. */
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  constructor(private http: HttpClient) {}

  /**
   * Historial con paginación por cursor.
   * @param beforeId  omitir para la página más reciente; usar `siguienteCursor` para la anterior.
   * @param silencioso true = no mostrar el diálogo de error (carga por scroll).
   */
  obtenerMensajesPrivados(
    interlocutor: string,
    beforeId?: number | null,
    size = 30,
    silencioso = false
  ): Observable<MensajePagina> {
    let params = new HttpParams().set('size', size);
    if (beforeId != null) {
      params = params.set('beforeId', beforeId);
    }
    return this.http.get<MensajePagina>(ENDPOINTS.mensajes(interlocutor), {
      params,
      context: new HttpContext().set(SKIP_ERROR_DIALOG, silencioso),
    });
  }

  /** Último mensaje de cada conversación (vista previa de la lista de chats). */
  obtenerConversaciones(): Observable<ConversacionResumen[]> {
    return this.http.get<ConversacionResumen[]>(ENDPOINTS.conversaciones, {
      context: new HttpContext().set(SKIP_ERROR_DIALOG, true),
    });
  }

  /** Contactos que están en línea ahora mismo. */
  obtenerPresencia(): Observable<{ enLinea: string[] }> {
    return this.http.get<{ enLinea: string[] }>(ENDPOINTS.presencia, {
      context: new HttpContext().set(SKIP_ERROR_DIALOG, true),
    });
  }
}
