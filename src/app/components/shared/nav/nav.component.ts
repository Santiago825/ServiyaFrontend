import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
menuIcon: string = 'menu';   // nombre inicial del ícono
  showMenu: boolean = false;
  constructor(private loginService:AuthService){

  }   // estado del menú

  onToggleMenu() {
    
    // Cambiar el ícono
    this.menuIcon = this.menuIcon === 'menu' ? 'close' : 'menu';
    // Mostrar u ocultar menú
    this.showMenu = !this.showMenu;
  }
  cerrarSesion(){
    this.loginService.logout();

  }
}
