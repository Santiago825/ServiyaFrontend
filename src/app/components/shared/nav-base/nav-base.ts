import { Directive } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

/**
 * Comportamiento común de las barras de navegación (menú móvil y cierre de sesión). Antes
 * NavComponent y NavColaboradorComponent eran copias idénticas; cada una solo difiere en su plantilla.
 */
@Directive()
export abstract class NavBase {
  menuIcon = 'menu'; // nombre del ícono
  showMenu = false;

  constructor(protected authService: AuthService) {}

  onToggleMenu(): void {
    this.menuIcon = this.menuIcon === 'menu' ? 'close' : 'menu';
    this.showMenu = !this.showMenu;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
