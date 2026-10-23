import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse, UsuarioSesion } from 'src/app/models/auth';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const ROL_KEY = 'rol';

/**
 * Guarda y lee la sesión (token, usuario, rol) del navegador. Es la ÚNICA clase que toca estas claves
 * de localStorage y no depende de HttpClient: por eso pueden usarla los interceptores sin crear
 * dependencias circulares. Quien necesite reaccionar al inicio / cierre de sesión (chat, avisos)
 * se suscribe a `usuario$` en vez de que AuthService conozca a cada uno.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly usuarioSubject = new BehaviorSubject<UsuarioSesion | null>(null);

  /** Usuario con sesión vigente (null si no hay). Emite su valor actual al suscribirse. */
  readonly usuario$: Observable<UsuarioSesion | null> = this.usuarioSubject.asObservable();

  constructor() {
    this.usuarioSubject.next(this.hayTokenVigente() ? this.getUser() : null);
  }

  iniciar(respuesta: AuthResponse): void {
    const usuario: UsuarioSesion = {
      username: respuesta.username,
      idUsuario: respuesta.idUsuario,
      idPersona: respuesta.idPersona,
    };
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    localStorage.setItem(ROL_KEY, respuesta.rol);
    this.usuarioSubject.next(usuario);
  }

  cerrar(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROL_KEY);
    this.usuarioSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem(ROL_KEY);
  }

  getUser(): UsuarioSesion {
    try {
      const guardado = JSON.parse(localStorage.getItem(USER_KEY) ?? '{}');
      return { username: '', idUsuario: 0, idPersona: 0, ...guardado };
    } catch {
      return { username: '', idUsuario: 0, idPersona: 0 };
    }
  }

  /** true si hay un token no vencido (se lee el "exp" del JWT). */
  hayTokenVigente(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }
}
