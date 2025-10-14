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
