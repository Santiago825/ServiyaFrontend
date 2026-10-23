import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistroProgresoService } from '../services/registro/registro-progreso.service';

/** El paso 2 del registro solo se abre tras completar el paso 1. */
@Injectable({ providedIn: 'root' })
export class RegistroGuard implements CanActivate {
  constructor(private router: Router, private progreso: RegistroProgresoService) {}

  canActivate(): boolean {
    if (!this.progreso.paso1Completo()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
