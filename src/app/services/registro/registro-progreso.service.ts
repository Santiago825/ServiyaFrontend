import { Injectable } from '@angular/core';

const CLAVE = 'paso1Completo';

/**
 * Recuerda que la persona ya completó el paso 1 del registro (usuario, correo, contraseña) para que
 * RegistroGuard deje abrir el paso 2. Antes el login, el guard y el formulario escribían/leían
 * localStorage cada uno por su cuenta (y nadie borraba la marca al terminar).
 */
@Injectable({ providedIn: 'root' })
export class RegistroProgresoService {
  marcarPaso1Completo(): void {
    localStorage.setItem(CLAVE, 'true');
  }

  paso1Completo(): boolean {
    return !!localStorage.getItem(CLAVE);
  }

  limpiar(): void {
    localStorage.removeItem(CLAVE);
  }
}
