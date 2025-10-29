import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles: string[] = route.data['roles'];
    const userRol = this.authService.getRol();

    if (!userRol) {
      return this.router.createUrlTree(['/login']);
    }

    if (expectedRoles.includes(userRol)) {
      return true;
    }

    // Redirigir según el rol actual
    if (userRol === 'COLABORADOR') {
      return this.router.createUrlTree(['/inicio-colaborador']);
    } else if(userRol === 'CONTRATANTE') {
      return this.router.createUrlTree(['/inicio']);
    }
    else{
      return true;
    }
  }
}
