import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { ArchivoDescargable } from 'src/app/models/archivo';
import { Colaborador } from 'src/app/models/colaborador';
import { DetalleColaborador } from 'src/app/models/detalleColaborador';
import { ListaResponse } from 'src/app/models/lista-response';

/**
 * Búsqueda y perfil de colaboradores. El contratante lo identifica el backend por el token: ya no se
 * envía idContratante (el campo "seguido" de la respuesta es respecto al usuario autenticado).
 */
@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  constructor(private http: HttpClient) {}

  buscar(idServicio: number, idMunicipio: number): Observable<Colaborador[]> {
    const params = new HttpParams().set('idServicio', idServicio).set('idMunicipio', idMunicipio);
    return this.http
      .get<ListaResponse<Colaborador>>(ENDPOINTS.colaboradores, { params })
      .pipe(listaDe());
  }

  /** El backend responde 404 si no existe, así que aquí siempre llega un detalle. */
  obtenerDetalle(idColaborador: number): Observable<DetalleColaborador | undefined> {
    const params = new HttpParams().set('idColaborador', idColaborador);
    return this.http
      .get<ListaResponse<DetalleColaborador>>(ENDPOINTS.detalleColaborador, { params })
      .pipe(
        listaDe(),
        map((lista) => lista[0])
      );
  }

  /**
   * Hoja de vida. El backend siempre etiqueta el archivo como "PDF" (no como tipo MIME) y no le pone
   * extensión al nombre: se normaliza aquí para que quien la descargue no tenga que saberlo.
   */
  obtenerCv(idPersona: number): Observable<ArchivoDescargable | undefined> {
    return this.http.get<ListaResponse<ArchivoDescargable>>(ENDPOINTS.cv(idPersona)).pipe(
      listaDe(),
      map((lista) => lista[0]),
      map((cv) =>
        cv
          ? {
              ...cv,
              tipoContenido: 'application/pdf',
              nombre: cv.nombre.toLowerCase().endsWith('.pdf') ? cv.nombre : `${cv.nombre}.pdf`,
            }
          : undefined
      )
    );
  }
}
