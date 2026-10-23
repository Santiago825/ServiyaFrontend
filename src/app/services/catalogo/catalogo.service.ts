import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { Departamento, Municipio, TipoDocumento } from 'src/app/models/catalogo';
import { ListaResponse } from 'src/app/models/lista-response';

/** Catálogos geográficos y de documentos (los usan el registro y la búsqueda de colaboradores). */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private http: HttpClient) {}

  obtenerDepartamentos(): Observable<Departamento[]> {
    return this.http.get<ListaResponse<Departamento>>(ENDPOINTS.departamentos).pipe(listaDe());
  }

  obtenerMunicipios(idDepartamento: number): Observable<Municipio[]> {
    return this.http
      .get<ListaResponse<Municipio>>(ENDPOINTS.municipios(idDepartamento))
      .pipe(listaDe());
  }

  obtenerTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<ListaResponse<TipoDocumento>>(ENDPOINTS.tiposDocumento).pipe(listaDe());
  }
}
