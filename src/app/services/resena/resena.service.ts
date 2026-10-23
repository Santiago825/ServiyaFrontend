import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { ListaResponse } from 'src/app/models/lista-response';
import { Pagina } from 'src/app/models/pagina';
import { ResenaRecibida } from 'src/app/models/resena-recibida';
import { ResenarContratoRequest } from 'src/app/models/resenar-contrato';

/**
 * Reseñas (solo CONTRATANTE). El backend valida que el contrato sea suyo, esté aceptado, ya haya
 * llegado su fecha de fin y no tenga reseña (409 con el motivo en cualquier otro caso).
 */
@Injectable({ providedIn: 'root' })
export class ResenaService {
  constructor(private http: HttpClient) {}

  /**
   * COLABORADOR: reseñas que ha recibido, de la más reciente a la más antigua.
   * @param busqueda  texto a buscar en contratante, contrato, descripción o comentario ('' = todas)
   * @param pagina    base 0
   */
  recibidas(busqueda: string, pagina: number, tamano: number): Observable<Pagina<ResenaRecibida>> {
    const params = new HttpParams().set('q', busqueda).set('page', pagina).set('size', tamano);
    return this.http
      .get<ListaResponse<ResenaRecibida>>(ENDPOINTS.misResenasColaborador, { params })
      .pipe(
        map((r) => ({
          items: r.lista ?? [],
          totalRegistros: r.totalRegistros ?? 0,
          totalPaginas: r.totalPaginas ?? 0,
        }))
      );
  }

  resenar(idContrato: number, datos: ResenarContratoRequest): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.resenarContrato(idContrato), datos);
  }
}
