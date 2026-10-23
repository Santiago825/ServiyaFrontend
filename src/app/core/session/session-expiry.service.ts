import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogosService } from '../ui/dialogos.service';
import { SessionStore } from './session.store';

/**
 * Vigila el vencimiento del token: cada 5 s, si hay token pero ya venció, avisa (una sola vez) y
 * cierra la sesión al aceptar. Antes vivía dentro de AuthService, mezclando login con temporizadores
 * y diálogos. Lo arranca AppComponent.
 */
@Injectable({ providedIn: 'root' })
export class SessionExpiryService {
  private avisoVisible = false;

  constructor(
    private session: SessionStore,
    private auth: AuthService,
    private dialogos: DialogosService
  ) {}

  iniciar(): void {
    interval(5000).subscribe(() => this.verificar());
  }

  private verificar(): void {
    if (!this.session.getToken() || this.session.hayTokenVigente() || this.avisoVisible) {
      return;
    }
    this.avisoVisible = true;
    this.dialogos
      .advertir('Sesión expirada', 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.')
      .then(() => {
        this.avisoVisible = false;
        this.auth.logout();
      });
  }
}
