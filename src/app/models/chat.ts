export interface MensajeChat {
  id: number;
  senderName: string;
  receiverName: string;
  message: string;
  status?: string;
  /** Instante ISO-8601 con zona (p. ej. "2026-10-06T21:08:00Z"): se puede pasar directo a `new Date()`. */
  timestamp: string;
}

/** Página del historial (paginación por cursor). `mensajes` va en orden cronológico ascendente. */
export interface MensajePagina {
  mensajes: MensajeChat[];
  hayMas: boolean;
  /** id del mensaje más antiguo de la página: se envía como `beforeId` para pedir la anterior. */
  siguienteCursor: number | null;
}

/** Vista previa de un chat: con quién y cuál fue el último mensaje (enviado o recibido). */
export interface ConversacionResumen {
  interlocutor: string;
  ultimoMensaje: MensajeChat;
}

export interface PresenciaEvento {
  username: string;
  enLinea: boolean;
}

/** Error que el servidor empuja por /user/queue/errors. */
export interface ErrorChat {
  codigoRespuesta?: string;
  mensajeRespuesta?: string;
}
