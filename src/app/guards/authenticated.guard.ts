import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { rutaInicioDe } from '../core/navigation/rutas-por-rol';
import { SessionStore } from '../core/session/session.store';

/** Para el login: quien ya tiene sesión va directo a su pantalla de inicio. */
@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate {
  private session = inject(SessionStore);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    if (!this.session.hayTokenVigente()) {
      return true;
    }
    const inicio = rutaInicioDe(this.session.getRol());
    // Rol sin pantalla propia: se muestra el login (redirigir a /login desde /login sería un bucle).
    return inicio ? this.router.createUrlTree([inicio]) : true;
  }
}
