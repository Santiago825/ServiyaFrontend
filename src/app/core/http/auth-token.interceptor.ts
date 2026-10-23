import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment/environment';
import { SessionStore } from '../session/session.store';

/**
 * Responsabilidad ÚNICA: adjuntar "Authorization: Bearer <jwt>" a las peticiones al API privado.
 * Ningún servicio arma ya el encabezado a mano (estaba copiado en cuatro servicios).
 * No toca el API público (login, registro, validar-username) ni peticiones que ya traen el encabezado.
 */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private session: SessionStore) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const esApi = request.url.startsWith(environment.urlHost);
    const esPublica = request.url.startsWith(environment.urlApi);
    const token = this.session.getToken();
    if (!esApi || esPublica || !token || request.headers.has('Authorization')) {
      return next.handle(request);
    }
    return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}
