import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogosService } from 'src/app/core/ui/dialogos.service';

@Component({
  selector: 'app-olvido-contrasena',
  templateUrl: './olvido-contrasena.component.html',
  styleUrls: ['./olvido-contrasena.component.css'],
})
export class OlvidoContrasenaComponent {
  forgotForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialogos: DialogosService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;
      this.dialogos.informar(`Se ha enviado un enlace de recuperación a ${email}`, 'Correo enviado');
    }
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
