import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionStore } from '../core/session/session.store';

/** Deja pasar solo con sesión vigente; si no, al login. */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private session = inject(SessionStore);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    return this.session.hayTokenVigente() ? true : this.router.createUrlTree(['/login']);
  }
}
