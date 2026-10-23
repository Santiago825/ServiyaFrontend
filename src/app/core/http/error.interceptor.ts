import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/app/environment/environment';
import { ErrorResponse } from 'src/app/models/lista-response';
import { DialogosService } from '../ui/dialogos.service';
import { SessionStore } from '../session/session.store';
import { SKIP_ERROR_DIALOG } from './http-context';

/**
 * Responsabilidad: traducir los errores HTTP a un mensaje para la persona.
 *  - El backend responde siempre con ErrorResponse { codigoRespuesta, mensajeRespuesta, errores? }.
 *  - 401 en el API PRIVADO = token ausente/vencido: se cierra la sesión local y se va al login.
 *    En el API PÚBLICO (login...) un 401 solo significa credenciales incorrectas.
 *  - Re-lanza el HttpErrorResponse original para que el componente decida qué más hacer.
 * Las peticiones que gestionan su propio error usan SKIP_ERROR_DIALOG (en vez de que este
 * interceptor conozca rutas concretas).
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private sesionExpiradaMostrada = false;

  constructor(
    private router: Router,
    private loader: NgxUiLoaderService,
    private session: SessionStore,
    private dialogos: DialogosService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.manejar(request, error);
        return throwError(() => error);
      })
    );
  }

  private manejar(request: HttpRequest<unknown>, error: HttpErrorResponse): void {
    this.loader.stop();

    const sesionExpirada = error.status === 401 && !request.url.startsWith(environment.urlApi);
    if (sesionExpirada) {
      this.session.cerrar();
      this.router.navigateByUrl('/login');
    }
    if (request.context.get(SKIP_ERROR_DIALOG)) {
      return;
    }
    if (sesionExpirada) {
      if (this.sesionExpiradaMostrada) {
        return; // varias peticiones fallan a la vez: un solo aviso
      }
      this.sesionExpiradaMostrada = true;
    }
    this.dialogos.informar(this.mensajeDe(error, sesionExpirada)).then(() => {
      this.sesionExpiradaMostrada = false;
    });
  }

  private mensajeDe(error: HttpErrorResponse, sesionExpirada: boolean): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
    }
    const cuerpo = error.error as Partial<ErrorResponse> | null;
    let mensaje =
      cuerpo && typeof cuerpo === 'object' && cuerpo.mensajeRespuesta
        ? String(cuerpo.mensajeRespuesta)
        : '';
    // Validaciones: se añade el detalle por campo ("El correo no es válido", ...).
    const detalles = cuerpo && typeof cuerpo === 'object' ? Object.values(cuerpo.errores ?? {}) : [];
    if (detalles.length) {
      mensaje = `${mensaje} ${detalles.join('. ')}.`.trim();
    }
    if (mensaje) {
      return mensaje;
    }
    if (sesionExpirada) {
      return 'Su sesión ha caducado. Por favor ingrese nuevamente.';
    }
    return error.status >= 500
      ? 'Ha ocurrido un inconveniente por favor intente nuevamente. (MSJ-U1)'
      : 'No se pudo completar la solicitud.';
  }
}
