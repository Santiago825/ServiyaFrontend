import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-nav-colaborador',
  templateUrl: './nav-colaborador.component.html',
  styleUrls: ['./nav-colaborador.component.css']
})
export class NavColaboradorComponent {
 menuIcon: string = 'menu'; // nombre inicial del ícono
  showMenu: boolean = false;
  constructor(
    private loginService: AuthService,
    public chatService: ChatService,
    private router: Router
  ) {} // estado del menú

  onToggleMenu() {
    // Cambiar el ícono
    this.menuIcon = this.menuIcon === 'menu' ? 'close' : 'menu';
    // Mostrar u ocultar menú
    this.showMenu = !this.showMenu;
  }
  cerrarSesion() {
    this.loginService.logout();
  }
  abrirChat() {
    this.router.navigate(['/chat2']);
  }
}

