import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private loader: NgxUiLoaderService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse, caught) => {
        let errorMessage = '';

        this.mensajeDeSalida(error, errorMessage);

        return throwError(errorMessage);
      })
    );
  }

  mensajeDeSalida(error: HttpErrorResponse, errorMessage: string): void {
    if (error && error.error) {
      errorMessage = `${error.error.mensajeRespuesta}`;

      if (error.status == 401) {
        errorMessage =
          'Su sesión ha caducado. Por favor ingrese nuevamente. (MSJ-U2)';
        this.router.navigateByUrl('/h/login');
      }

      if (
        errorMessage === null ||
        errorMessage === 'null' ||
        errorMessage === undefined ||
        errorMessage === 'undefined' ||
        errorMessage === ''
      ) {
        errorMessage =
          'Ha ocurrido un inconveniente por favor intente nuevamente. (MSJ-U1)';
      }

      Swal.fire({
        title: 'Información',
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
        text: errorMessage,
      });
      this.loader.stop();
    }
  }
}
