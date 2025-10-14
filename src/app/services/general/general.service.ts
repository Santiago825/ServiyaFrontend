import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  obtenerDepartamento(): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + '/obtener_departamento',
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
      `${environment.urlApiPrivate}/obtener_municipio/${id}`,
      { headers }
    );
  }
}
