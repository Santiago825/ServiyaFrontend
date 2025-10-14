import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // ✅ Inyectar dependencias correctamente
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate():
    Observable<boolean | UrlTree> |
    Promise<boolean | UrlTree> |
    boolean |
    UrlTree {

    // ✅ Validación de autenticación
    if (this.authService.isAutenticated()) {
      return true;
    } else {
      // ✅ Redirigir si no está autenticado
      this.router.navigate(['/login']);
      return false;
    }
  }
}
