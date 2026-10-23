import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavBase } from '../nav-base/nav-base';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent extends NavBase {
  constructor(authService: AuthService) {
    super(authService);
  }
}
