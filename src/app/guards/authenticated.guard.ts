import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    const isAuth = this.authService.isAutenticated();
    const rol = this.authService.getRol();

    if (!isAuth) return true;
   
    if (rol === 'COLABORADOR') {
      return this.router.createUrlTree(['/inicio-colaborador']);
    } else if (rol === 'CONTRATANTE') {
      return this.router.createUrlTree(['/inicio']);
    } else {
      console.warn('⚠️ Rol desconocido, redirigiendo a login');
      return this.router.createUrlTree(['/login']);
    }
  }
}
