import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { ListaResponse } from 'src/app/models/lista-response';
import { UsuarioSeguido } from 'src/app/models/usuario-seguido';

/**
 * Contactos del usuario. Cada consulta es exclusiva de un rol en el backend:
 *  - colaboradores seguidos -> solo CONTRATANTE
 *  - seguidores del colaborador -> solo COLABORADOR (403 en otro caso)
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {}

  obtenerColaboradoresSeguidos(idUsuario: number): Observable<UsuarioSeguido[]> {
    return this.http
      .get<ListaResponse<UsuarioSeguido>>(ENDPOINTS.colaboradoresSeguidos(idUsuario))
      .pipe(listaDe());
  }

  obtenerSeguidoresColaborador(idUsuario: number): Observable<UsuarioSeguido[]> {
    return this.http
      .get<ListaResponse<UsuarioSeguido>>(ENDPOINTS.seguidoresColaborador(idUsuario))
      .pipe(listaDe());
  }
}
