import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment/environment';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public translate: TranslateService
  ) {}
    obtenerTipoDocumento(): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + 'obtener_documento',
      { headers }
    );
  }
  obtenerDepartamento(): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + 'obtener_departamento',
      { headers }
    );
  }
  obtenerMunicipio(id: number): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // 👇 Se agrega la id en la URL
    return this.http.get<any>(
      `${environment.urlApiPrivate}obtener_municipio/${id}`,
      { headers }
    );
  }
  async alertaMensajeInformacion(texto: string) {
    Swal.fire({
      title: await this.traduccionMensajeGenerico('MENSAJE_INFORMACION'),
      text: texto,
      background: '#f8fafc',
      color: '#1e293b',
      confirmButtonText: await this.traduccionMensajeGenerico('BOTON_ACEPTAR'),
      confirmButtonColor: '#7494ec', // Azul moderno
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-200',
        title: 'text-lg font-semibold text-blue-700',
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
      },
      width: '420px',
    });
  }
  async traduccionMensajeGenerico(variableTraduccion: string): Promise<string> {
    const trad = await this.translate.get(variableTraduccion).toPromise();
    return trad;
  }
}
