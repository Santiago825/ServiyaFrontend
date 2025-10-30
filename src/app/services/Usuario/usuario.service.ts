import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  obtenerUsuarios(): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(environment.urlApiPrivate + 'obtener_usuarios', {
      headers,
    });
  }
    obtenerColaboradoresSeguidos(idUsuario: number): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + 'obtener_colaboradores_seguidos/' + idUsuario,
      {
        headers,
      }
    );
  }
  obtenerSeguidoresColaborador(idUsuario: number): Observable<any> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(
      environment.urlApiPrivate + 'obtener_seguidores_colaborador/' + idUsuario,
      {
        headers,
      }
    );
  }
}
