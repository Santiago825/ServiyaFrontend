import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { ArchivoDescargable } from 'src/app/models/archivo';
import { Contrato, ContratoDetalle } from 'src/app/models/contrato';
import { ListaResponse } from 'src/app/models/lista-response';

/**
 * Contratos. El token lo añade AuthTokenInterceptor.
 * Los listados responden 200 con código INF_DAT_NO_ENC cuando no hay contratos (listaDe -> []).
 * El detalle y el archivo solo los ve quien participa del contrato (404 en otro caso).
 */
@Injectable({ providedIn: 'root' })
export class ContratoService {
  constructor(private http: HttpClient) {}

  /** COLABORADOR: crea un contrato (multipart: campos + archivo opcional). */
  crearContrato(datos: FormData): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.crearContrato, datos);
  }

  /** COLABORADOR: contratos que creó. */
  misContratosColaborador(): Observable<Contrato[]> {
    return this.http.get<ListaResponse<Contrato>>(ENDPOINTS.misContratosColaborador).pipe(listaDe());
  }

  /** CONTRATANTE: contratos que le crearon. */
  misContratos(): Observable<Contrato[]> {
    return this.http.get<ListaResponse<Contrato>>(ENDPOINTS.misContratos).pipe(listaDe());
  }

  detalleContrato(idContrato: number): Observable<ContratoDetalle | undefined> {
    return this.http.get<ListaResponse<ContratoDetalle>>(ENDPOINTS.detalleContrato(idContrato)).pipe(
      listaDe(),
      map((lista) => lista[0])
    );
  }

  /** CONTRATANTE. 409 si ya fue respondido. */
  aceptarContrato(idContrato: number): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.aceptarContrato(idContrato), {});
  }

  /** CONTRATANTE. 409 si ya fue respondido. */
  rechazarContrato(idContrato: number): Observable<ListaResponse<never>> {
    return this.http.post<ListaResponse<never>>(ENDPOINTS.rechazarContrato(idContrato), {});
  }

  obtenerArchivoContrato(idContrato: number): Observable<ArchivoDescargable | undefined> {
    return this.http.get<ListaResponse<ArchivoDescargable>>(ENDPOINTS.archivoContrato(idContrato)).pipe(
      listaDe(),
      map((lista) => lista[0])
    );
  }
}
