import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';


@Component({
  selector: 'app-olvido-contrasena',
  templateUrl: './olvido-contrasena.component.html',
  styleUrls: ['./olvido-contrasena.component.css']
})
export class OlvidoContrasenaComponent {
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder,private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;
      Swal.fire({
        icon: 'info',
        title: 'Correo enviado',
        text: `Se ha enviado un enlace de recuperación a ${email}`,
        confirmButtonText: 'Aceptar'
      });
    }
    
  }
   volverLogin() {
    this.router.navigate(['/login']);
  }
}

