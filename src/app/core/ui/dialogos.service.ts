import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface OpcionesConfirmacion {
  titulo: string;
  texto: string;
  textoConfirmar: string;
  textoCancelar?: string;
  icono?: SweetAlertIcon;
  colorConfirmar?: string;
  colorCancelar?: string;
}

/**
 * Único punto que conoce SweetAlert2. Componentes e interceptores piden "informar", "confirmar"...
 * sin depender de la librería (se puede cambiar el diálogo sin tocarlos).
 *
 * TranslateService se resuelve de forma perezosa con Injector: así los interceptores pueden usar
 * este servicio sin crear una dependencia circular (TranslateService -> HttpClient -> interceptores).
 */
@Injectable({ providedIn: 'root' })
export class DialogosService {
  constructor(private injector: Injector) {}

  /** Diálogo informativo con un solo botón. */
  async informar(texto: string, titulo?: string): Promise<void> {
    await Swal.fire({
      title: titulo ?? (await this.traducir('MENSAJE_INFORMACION', 'Información')),
      text: texto,
      background: '#f8fafc',
      color: '#1e293b',
      confirmButtonText: await this.traducir('BOTON_ACEPTAR', 'Aceptar'),
      confirmButtonColor: '#7494ec',
      showClass: { popup: 'animate__animated animate__fadeInDown animate__faster' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp animate__faster' },
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-200',
        title: 'text-lg font-semibold text-blue-700',
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
      },
      width: '420px',
    });
  }

  async advertir(titulo: string, texto: string): Promise<void> {
    await Swal.fire({ title: titulo, text: texto, icon: 'warning' });
  }

  /**
   * Éxito. Con `temporizadorMs` se cierra solo; sin él espera al botón "Aceptar".
   */
  async exito(titulo: string, texto?: string, temporizadorMs?: number): Promise<void> {
    await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success',
      timer: temporizadorMs,
      showConfirmButton: temporizadorMs === undefined,
      confirmButtonText: 'Aceptar',
    });
  }

  /** true si la persona confirmó. */
  async confirmar(o: OpcionesConfirmacion): Promise<boolean> {
    const r = await Swal.fire({
      title: o.titulo,
      text: o.texto,
      icon: o.icono ?? 'question',
      showCancelButton: true,
      confirmButtonText: o.textoConfirmar,
      cancelButtonText: o.textoCancelar ?? 'Cancelar',
      confirmButtonColor: o.colorConfirmar,
      cancelButtonColor: o.colorCancelar,
    });
    return r.isConfirmed;
  }

  private async traducir(clave: string, porDefecto: string): Promise<string> {
    try {
      const valor = await firstValueFrom(this.injector.get(TranslateService).get(clave));
      return valor && valor !== clave ? valor : porDefecto;
    } catch {
      return porDefecto;
    }
  }
}
