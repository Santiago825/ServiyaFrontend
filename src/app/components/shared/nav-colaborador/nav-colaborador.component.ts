import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavBase } from '../nav-base/nav-base';

@Component({
  selector: 'app-nav-colaborador',
  templateUrl: './nav-colaborador.component.html',
  styleUrls: ['./nav-colaborador.component.css'],
})
export class NavColaboradorComponent extends NavBase {
  constructor(authService: AuthService) {
    super(authService);
  }
}
