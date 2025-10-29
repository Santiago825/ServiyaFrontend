import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RegistroGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const paso1Completado = localStorage.getItem('paso1Completo');
    if (!paso1Completado) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
