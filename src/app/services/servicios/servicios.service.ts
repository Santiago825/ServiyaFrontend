import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  obtenerServicios(): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + '/obtener_servicios',
      { headers }
    );
  }
  obtenerColaboradors(
    idServicio: number,
    idMunicipio: number
  ): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      `${environment.urlApiPrivate}/obtener_colaborador?idServicio=${idServicio}&idMunicipio=${idMunicipio}`,
      { headers }
    );
  }
  obtenerDetalleColaborador(idColabotrador: number): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      `${environment.urlApiPrivate}/obtener_detalle_colaborador?idColaborador=${idColabotrador}`,
      { headers }
    );
  }
}
