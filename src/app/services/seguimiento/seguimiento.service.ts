import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { ListaResponse } from 'src/app/models/lista-response';
import { SeguirColaboradorRequest } from 'src/app/models/requestSeguidor';

/**
 * Seguir / dejar de seguir (solo CONTRATANTE). El backend toma el contratante del token.
 * Errores: 409 si ya lo sigue; 404 si no lo seguía.
 */
@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  constructor(private http: HttpClient) {}

  seguir(idColaborador: number): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.seguirColaborador, this.cuerpo(idColaborador));
  }

  dejarDeSeguir(idColaborador: number): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(
      ENDPOINTS.dejarSeguirColaborador,
      this.cuerpo(idColaborador)
    );
  }

  private cuerpo(colaborador: number): SeguirColaboradorRequest {
    return { colaborador };
  }
}
