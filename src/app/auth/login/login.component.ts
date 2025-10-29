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
import { GeneralService } from 'src/app/services/general/general.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registroForm!: FormGroup;
  showValidationMessage = false;


  constructor(
    private loader: NgxUiLoaderService,
    public translate: TranslateService,
    private router: Router,
    private loginService: AuthService,
    private fb: FormBuilder,
    private generalService: GeneralService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.registroForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
  this.showValidationMessage = true;
  if (this.loginForm.valid) {
    this.loader.start();
    const { username, password } = this.loginForm.value;
    this.loginService.login(username, password).subscribe({
      next: (resp) => {
 
        if (resp.rol === 'CONTRATANTE') {
          this.router.navigate(['/inicio']);
        } else {
          this.router.navigate(['/inicio-colaborador']);
        }
      },
      error: (error) => {
        console.error('❌ Login fallido', error);
      },
      complete: () => {
        this.loader.stop(); 
      }
    });
  }
}



  isInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  registroCompleto(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    if (this.registroForm.valid) {
      this.loginService
        .validarUsername(this.registroForm.get('username')?.value)
        .subscribe({
          next: (resp) => {
            localStorage.setItem('paso1Completo', 'true');
            this.router.navigate(['/registro-completo'], {
              state: { formData: this.registroForm.value },
            });
          },
          error: (error) => {
            this.generalService.alertaMensajeInformacion(
              'Usuario ya existente'
            );
          },
        });
    }
  }
}
