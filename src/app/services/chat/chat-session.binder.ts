import { Injectable } from '@angular/core';
import { SessionStore } from 'src/app/core/session/session.store';
import { ChatService } from './chat.service';

/**
 * Mantiene el socket del chat alineado con la sesión: se abre al iniciar sesión (o al recargar con
 * una sesión vigente) y se cierra al cerrarla, también cuando la cierra el interceptor por un 401.
 * Es la inversión de dependencia: antes AuthService llamaba a ChatService; ahora ninguno conoce al otro.
 */
@Injectable({ providedIn: 'root' })
export class ChatSessionBinder {
  constructor(private session: SessionStore, private chat: ChatService) {}

  iniciar(): void {
    this.session.usuario$.subscribe((usuario) => {
      if (usuario?.username) {
        this.chat.connect(usuario.username);
      } else {
        this.chat.disconnect();
      }
    });
  }
}
