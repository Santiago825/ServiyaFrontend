import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { listaDe } from 'src/app/core/api/lista';
import { SKIP_ERROR_DIALOG } from 'src/app/core/http/http-context';
import { ListaResponse } from 'src/app/models/lista-response';
import { PersonaRanking } from 'src/app/models/persona-ranking';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  constructor(private http: HttpClient) {}

  /**
   * Los 4 colaboradores mejor valorados (pantalla de inicio). Sin diálogo de error: si aún no hay
   * datos el backend responde con error y no debe interrumpir la portada.
   */
  obtenerRanking(): Observable<PersonaRanking[]> {
    return this.http
      .get<ListaResponse<PersonaRanking>>(ENDPOINTS.personasRaiting, {
        context: new HttpContext().set(SKIP_ERROR_DIALOG, true),
      })
      .pipe(listaDe());
  }
}
