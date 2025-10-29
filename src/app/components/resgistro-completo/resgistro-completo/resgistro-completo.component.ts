import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTES } from 'src/app/constants/constants';
import { registro } from 'src/app/models/registro';
import { Servicio } from 'src/app/models/servicio';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-resgistro-completo',
  templateUrl: './resgistro-completo.component.html',
  styleUrls: ['./resgistro-completo.component.css'],
})
export class ResgistroCompletoComponent {
  form!: FormGroup;
  submitted = false;
  fotoPreview: string | ArrayBuffer | null = null;
  datos: any;
  departamentos: any[] = [];
  municipios: any[] = [];
  servicios: Servicio[] = [];
  tipoDocumento: any[] = [];
  registro: registro = {
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    idMunicipio: 0,
    idDocumento: 0,
    numeroDocumento: 0,
    rol: '',
    descripcion: '',
    idServicio: 0,
    foto: null,
    cv: '',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicioService: ServiciosService,
    private generalService: GeneralService,
    private loginService: AuthService,
    private loader: NgxUiLoaderService,

  ) {
    const navigation = this.router.getCurrentNavigation();
    this.datos = navigation?.extras?.state?.['formData'];
    this.obtenerServicios();
    this.cargarDepartamentos();
    this.obtenerTipoDocumento();
  }

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)],
      ],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      rol: ['', Validators.required],
      servicio: [''], // se hace obligatorio solo si rol = Colaborador
      descripcion: [''], // opcional
      foto: [null],
      cv: [null], // obligatorio solo si rol = Colaborador
    });

    // ✅ Validaciones dinámicas según el rol
    this.form.get('rol')?.valueChanges.subscribe((rol) => {
      if (rol === 'Colaborador') {
        this.form.get('servicio')?.setValidators([Validators.required]);
        this.form.get('cv')?.setValidators([Validators.required]);
      } else {
        this.form.get('servicio')?.clearValidators();
        this.form.get('cv')?.clearValidators();
      }

      this.form.get('servicio')?.updateValueAndValidity();
      this.form.get('cv')?.updateValueAndValidity();
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ foto: file });

      const reader = new FileReader();
      reader.onload = () => (this.fotoPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  removeFoto() {
    this.form.patchValue({ foto: null });
    this.fotoPreview = null;
  }

  onFileCvChange(event: any) {
    const file = event.target.files[0];
    this.form.patchValue({ cv: file });
  }

async onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se registrará la información ingresada',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, registrar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await this.llenarRegistro();
      this.loader.start();
      this.loginService.registro(this.registro).subscribe({
        next: (resp) => {
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: resp[CONSTANTES.MENSAJE_RESPUESTA] + ' Inicie sesión',
            confirmButtonText: 'Aceptar',
          }).then(() => this.router.navigate(['/inicio']));
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: 'Ocurrió un problema al registrar el usuario',
          });
          console.error(error);
        },
        complete: () => {
        this.loader.stop(); 
      }
      });
    }
  });
}


  obtenerTipoDocumento(): void {
    this.generalService.obtenerTipoDocumento().subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.tipoDocumento = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando servicios:', err),
    });
  }
  obtenerServicios(): void {
    this.servicioService.obtenerServicios().subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.servicios = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando servicios:', err),
    });
  }
  cargarDepartamentos(): void {
    this.generalService.obtenerDepartamento().subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.departamentos = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando departamentos:', err),
    });
  }

  /** Cargar municipios cuando cambia el departamento */
  onDepartamentoChange(): void {
    const idDepartamento = this.form.get('departamento')?.value;
    if (!idDepartamento) return;

    this.generalService.obtenerMunicipio(idDepartamento).subscribe({
      next: (resp) => {
        if (
          resp[CONSTANTES.CODIGO_RESPUESTA] &&
          resp[CONSTANTES.CODIGO_RESPUESTA] === CONSTANTES.OK
        ) {
          this.municipios = resp['lista'];
        }
      },
      error: (err) => console.error('Error cargando municipios:', err),
    });
  }
async llenarRegistro() {
  const fotoFile = this.form.get('foto')?.value;
  const cvFile = this.form.get('cv')?.value;

  let fotoBase64 = '';
  let cvBase64 = '';

  if (fotoFile) {
    fotoBase64 = await this.convertirArchivoBase64(fotoFile);
    // Elimina el encabezado data:image/...;base64,
    fotoBase64 = fotoBase64.split(',')[1];
  }

  if (cvFile) {
    cvBase64 = await this.convertirArchivoBase64(cvFile);
    // Elimina el encabezado data:application/pdf;base64,
    cvBase64 = cvBase64.split(',')[1];
  }

  this.registro = {
    username: this.datos.username,
    email: this.datos.email,
    password: this.datos.password,
    nombre: this.form.get('nombre')?.value,
    apellido: this.form.get('apellido')?.value,
    telefono: this.form.get('telefono')?.value,
    idMunicipio: this.form.get('municipio')?.value,
    rol: this.form.get('rol')?.value,
    descripcion: this.form.get('descripcion')?.value,
    idServicio: this.form.get('servicio')?.value,
    foto: fotoBase64 || '',
    cv: cvBase64 || '',
    idDocumento: this.form.get('tipoDocumento')?.value,
    numeroDocumento: this.form.get('numeroDocumento')?.value,
  };
}




  convertirArchivoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
}
