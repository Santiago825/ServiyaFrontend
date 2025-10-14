import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  loginForm: FormGroup;
  constructor(
    private router: Router,
    private loginService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  isActive = false;

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }
  login(): void {
    console.log("aqui");
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.loginService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/inicio']);
        },
        error: (error) => {
          console.error('login fallido', error);
        },
      });
    }
  }
}
