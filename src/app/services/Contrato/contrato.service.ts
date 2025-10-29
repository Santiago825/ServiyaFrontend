import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/app/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  constructor(private http: HttpClient,
      private auth: AuthService) { }

    obtenerContrato(idContratante:number): Observable<any> {
      const token = this.auth.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
  
      return this.http.get<any>(
        environment.urlApiPrivate + 'obtener_contrato/'+idContratante,
        { headers }
      );
    }
    obtenerDetalleContrato(idContrato:number): Observable<any> {
      const token = this.auth.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
  
      return this.http.get<any>(
        environment.urlApiPrivate + 'obtener_contrato_detalle/'+idContrato,
        { headers }
      );
    }
    obtenerArchivoContrato(idContrato:number): Observable<any> {
      const token = this.auth.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
  
      return this.http.get<any>(
        environment.urlApiPrivate + 'obtener_archivo_contrato/'+idContrato,
        { headers }
      );
    }
}
