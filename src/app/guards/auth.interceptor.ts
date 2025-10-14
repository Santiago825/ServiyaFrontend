import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 🔑 Obtener el token del AuthService
    const token = this.authService.getToken();

    // 🛠️ Si hay token, clonar la petición agregando el header Authorization
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 🚀 Continuar con la petición y manejar errores
    return next.handle(authReq).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.status === 401) {
          // ⚠️ Token inválido o no autorizado
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: errorMessage,
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.authService.logout();
          });
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para acceder a este recurso.';
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: errorMessage,
            confirmButtonText: 'Aceptar'
          });
        } else {
          // Otros errores genéricos
          errorMessage = 'Ocurrió un error. Intenta nuevamente.';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonText: 'Aceptar'
          });
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
