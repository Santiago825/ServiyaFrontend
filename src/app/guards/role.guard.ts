import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { rutaInicioDe } from '../core/navigation/rutas-por-rol';
import { SessionStore } from '../core/session/session.store';

/**
 * Restringe una ruta a los roles de `data.roles`. Quien tiene otro rol va a SU pantalla de inicio;
 * antes un rol desconocido pasaba a cualquier ruta (este guard es solo comodidad de la interfaz: la
 * seguridad real la aplica el backend con @PreAuthorize).
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private session = inject(SessionStore);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const rolesPermitidos: string[] = route.data['roles'] ?? [];
    const rol = this.session.getRol();
    if (!rol) {
      return this.router.createUrlTree(['/login']);
    }
    if (rolesPermitidos.includes(rol)) {
      return true;
    }
    return this.router.createUrlTree([rutaInicioDe(rol) ?? '/login']);
  }
}
