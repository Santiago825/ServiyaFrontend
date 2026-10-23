import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { SKIP_ERROR_DIALOG } from 'src/app/core/http/http-context';
import { DashboardColaborador } from 'src/app/models/dashboard-colaborador';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  /**
   * Resumen del colaborador autenticado (solo COLABORADOR). Sin diálogo del interceptor: el
   * dashboard muestra su propio mensaje con botón "Reintentar".
   */
  obtenerColaborador(): Observable<DashboardColaborador> {
    return this.http.get<DashboardColaborador>(ENDPOINTS.dashboardColaborador, {
      context: new HttpContext().set(SKIP_ERROR_DIALOG, true),
    });
  }
}
