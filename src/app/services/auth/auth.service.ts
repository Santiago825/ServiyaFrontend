import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { SKIP_ERROR_DIALOG } from 'src/app/core/http/http-context';
import { SessionStore } from 'src/app/core/session/session.store';
import { AuthResponse } from 'src/app/models/auth';
import { ListaResponse } from 'src/app/models/lista-response';
import { RegistroRequest } from 'src/app/models/registro';

/**
 * Casos de uso de autenticación: iniciar sesión, registrarse, validar usuario y cerrar sesión.
 *
 * Ya NO guarda el token (SessionStore), ni vigila su vencimiento (SessionExpiryService), ni abre el
 * chat al iniciar sesión (ChatSessionBinder reacciona a SessionStore.usuario$): AuthService no
 * conoce a ninguno de ellos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private session: SessionStore
  ) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(ENDPOINTS.login, { username, password })
      .pipe(
        tap((respuesta) => {
          if (respuesta.token) {
            this.session.iniciar(respuesta);
          }
        })
      );
  }

  /** 201 al registrar; 409 con ERR_USU_EXI / ERR_USU_COR_EXI / ERR_USU_DOC_EXI si hay duplicados. */
  registro(datos: RegistroRequest): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.registro, datos);
  }

  /** 200 = disponible; 409 = ya existe. El formulario muestra el error, no el interceptor. */
  validarUsername(username: string): Observable<ListaResponse<never>> {
    return this.http.get<ListaResponse<never>>(ENDPOINTS.validarUsername, {
      params: new HttpParams().set('username', username),
      context: new HttpContext().set(SKIP_ERROR_DIALOG, true),
    });
  }

  logout(): void {
    this.session.cerrar();
    this.router.navigate(['login']);
  }
}
