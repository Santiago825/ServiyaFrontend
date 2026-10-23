import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs';
import { DialogosService } from 'src/app/core/ui/dialogos.service';
import { Departamento, Municipio, TipoDocumento } from 'src/app/models/catalogo';
import { RegistroRequest } from 'src/app/models/registro';
import { Rol } from 'src/app/models/rol';
import { Servicio } from 'src/app/models/servicio';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CatalogoService } from 'src/app/services/catalogo/catalogo.service';
import { RegistroProgresoService } from 'src/app/services/registro/registro-progreso.service';
import { ServiciosService } from 'src/app/services/servicios/servicios.service';
import { archivoABase64 } from 'src/app/shared/utils/archivo';

/** Datos del paso 1 (usuario, correo, contraseña) que llegan desde el login. */
interface DatosPaso1 {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-resgistro-completo',
  templateUrl: './resgistro-completo.component.html',
  styleUrls: ['./resgistro-completo.component.css'],
})
export class ResgistroCompletoComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  fotoPreview: string | ArrayBuffer | null = null;
  datos?: DatosPaso1;

  departamentos: Departamento[] = [];
  municipios: Municipio[] = [];
  servicios: Servicio[] = [];
  tipoDocumento: TipoDocumento[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviciosService: ServiciosService,
    private catalogoService: CatalogoService,
    private authService: AuthService,
    private registroProgreso: RegistroProgresoService,
    private dialogos: DialogosService,
    private loader: NgxUiLoaderService
  ) {
    // Solo se puede leer durante la construcción.
    this.datos = this.router.getCurrentNavigation()?.extras?.state?.['formData'];
  }

  ngOnInit(): void {
    // Al recargar la página se pierde el estado del paso 1: se vuelve a empezar.
    if (!this.datos) {
      this.registroProgreso.limpiar();
      this.router.navigate(['/login']);
      return;
    }

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
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

    // Validaciones dinámicas según el rol
    this.form.get('rol')?.valueChanges.subscribe((rol) => {
      const esColaborador = this.esColaborador(rol);
      const servicio = this.form.get('servicio');
      const cv = this.form.get('cv');
      if (esColaborador) {
        servicio?.setValidators([Validators.required]);
        cv?.setValidators([Validators.required]);
      } else {
        servicio?.clearValidators();
        cv?.clearValidators();
      }
      servicio?.updateValueAndValidity();
      cv?.updateValueAndValidity();
    });

    this.serviciosService.obtenerServicios().subscribe((lista) => (this.servicios = lista));
    this.catalogoService.obtenerDepartamentos().subscribe((lista) => (this.departamentos = lista));
    this.catalogoService.obtenerTiposDocumento().subscribe((lista) => (this.tipoDocumento = lista));
  }

  /** Cargar municipios cuando cambia el departamento */
  onDepartamentoChange(): void {
    const idDepartamento = this.form.get('departamento')?.value;
    if (!idDepartamento) return;
    this.catalogoService.obtenerMunicipios(idDepartamento).subscribe((lista) => (this.municipios = lista));
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

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Estás seguro?',
      texto: 'Se registrará la información ingresada',
      icono: 'warning',
      textoConfirmar: 'Sí, registrar',
      colorConfirmar: '#3085d6',
      colorCancelar: '#d33',
    });
    if (!confirmado) {
      return;
    }

    const registro = await this.construirRegistro();
    this.loader.start();
    this.authService
      .registro(registro)
      .pipe(finalize(() => this.loader.stop()))
      .subscribe({
        next: async (resp) => {
          this.registroProgreso.limpiar();
          await this.dialogos.exito('Registro exitoso', `${resp.mensajeRespuesta ?? ''} Inicie sesión`);
          this.router.navigate(['/login']);
        },
        // Duplicados (409) y datos inválidos (400): el interceptor muestra el mensaje del servidor.
        error: (error) => console.error('Error en el registro', error),
      });
  }

  private esColaborador(rol: string): boolean {
    return rol?.toUpperCase() === Rol.COLABORADOR;
  }

  private async construirRegistro(): Promise<RegistroRequest> {
    const v = this.form.value;
    const paso1 = this.datos as DatosPaso1;
    const colaborador = this.esColaborador(v.rol);
    const [foto, cv] = await Promise.all([
      v.foto ? archivoABase64(v.foto) : Promise.resolve(''),
      v.cv ? archivoABase64(v.cv) : Promise.resolve(''),
    ]);
    return {
      username: paso1.username,
      email: paso1.email,
      password: paso1.password,
      nombre: v.nombre,
      apellido: v.apellido,
      telefono: v.telefono,
      idMunicipio: Number(v.municipio),
      idDocumento: Number(v.tipoDocumento),
      numeroDocumento: Number(v.numeroDocumento),
      rol: v.rol,
      descripcion: v.descripcion,
      // Los contratantes no tienen servicio (el backend solo lo exige a los colaboradores).
      idServicio: colaborador && v.servicio ? Number(v.servicio) : null,
      foto: foto || null,
      cv: cv || null,
    };
  }
}
