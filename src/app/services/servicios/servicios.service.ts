import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { ListaResponse } from 'src/app/models/lista-response';
import { Servicio } from 'src/app/models/servicio';

/** Catálogo de servicios (plomería, electricidad...). Colaboradores y seguimiento tienen el suyo. */
@Injectable({ providedIn: 'root' })
export class ServiciosService {
  constructor(private http: HttpClient) {}

  obtenerServicios(): Observable<Servicio[]> {
    return this.http.get<ListaResponse<Servicio>>(ENDPOINTS.servicios).pipe(listaDe());
  }

  obtenerMasUsados(): Observable<Servicio[]> {
    return this.http.get<ListaResponse<Servicio>>(ENDPOINTS.serviciosMasUsos).pipe(listaDe());
  }
}
