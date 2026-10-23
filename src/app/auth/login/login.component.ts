import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs';
import { rutaInicioDe } from 'src/app/core/navigation/rutas-por-rol';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { ErrorResponse } from 'src/app/models/lista-response';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RegistroProgresoService } from 'src/app/services/registro/registro-progreso.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registroForm!: FormGroup;
  showValidationMessage = false;
  isActive = false;

  constructor(
    private loader: NgxUiLoaderService,
    public translate: TranslateService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialogos: DialogosService,
    private registroProgreso: RegistroProgresoService
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

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  login(): void {
    this.showValidationMessage = true;
    if (!this.loginForm.valid) {
      return;
    }
    this.loader.start();
    const { username, password } = this.loginForm.value;
    this.authService
      .login(username, password)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        // El rol decide la pantalla de inicio (ver rutas-por-rol).
        next: (resp) => this.router.navigate([rutaInicioDe(resp.rol) ?? '/login']),
        error: (error) => console.error('Login fallido', error),
      });
  }

  isInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /** Paso 1 del registro: comprueba que el usuario esté libre y pasa al formulario completo. */
  registroCompleto(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    this.authService.validarUsername(this.registroForm.get('username')?.value).subscribe({
      next: () => {
        this.registroProgreso.marcarPaso1Completo();
        this.router.navigate(['/registro-completo'], {
          state: { formData: this.registroForm.value },
        });
      },
      // 409 = ya existe; cualquier otro fallo (red, servidor) también se informa con su mensaje.
      error: (error: HttpErrorResponse) => {
        const cuerpo = error.error as Partial<ErrorResponse> | null;
        this.dialogos.informar(cuerpo?.mensajeRespuesta || 'No se pudo validar el usuario. Inténtalo de nuevo.');
      },
    });
  }
}
