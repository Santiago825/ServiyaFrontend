import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionExpiryService } from './core/session/session-expiry.service';
import { ChatSessionBinder } from './services/chat/chat-session.binder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
          optional: true,
        }),
        group([
          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'translateX(20px)' }),
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateX(0)' })
              ),
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({ opacity: 1, transform: 'translateX(0)' }),
              animate(
                '300ms ease-out',
                style({ opacity: 0, transform: 'translateX(-20px)' })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
})
export class AppComponent {
  constructor(
    public translate: TranslateService,
    private sessionExpiry: SessionExpiryService,
    private chatSession: ChatSessionBinder
  ) {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es'); // idioma por defecto
    this.translate.use('es');
    // Servicios de fondo ligados a la sesión (antes los arrancaba AuthService desde su constructor).
    this.sessionExpiry.iniciar(); // avisa y cierra la sesión cuando el token vence
    this.chatSession.iniciar(); // abre/cierra el socket del chat según haya sesión
  }
  title = 'ServiYa';

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  isActive = false;

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }
}
