import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    const isAuth = this.authService.isAutenticated();
    const rol = this.authService.getRol();

    if (isAuth) return true;

    return this.router.createUrlTree(['/login']);
  }
}
