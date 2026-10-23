import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ENDPOINTS } from 'src/app/core/api/api-endpoints';
import { PersonaService } from './persona.service';

describe('PersonaService', () => {
  let service: PersonaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PersonaService);
    http = TestBed.inject(HttpTestingController);
  });

  it('devuelve la lista del ranking cuando el código es OK', () => {
    let resultado: unknown[] = [];
    service.obtenerRanking().subscribe((l) => (resultado = l));
    http.expectOne(ENDPOINTS.personasRaiting).flush({ codigoRespuesta: 'OK', lista: [{ idPersona: 1 }] });
    expect(resultado.length).toBe(1);
  });

  it('devuelve [] si el código no es OK', () => {
    let resultado: unknown[] = [{}];
    service.obtenerRanking().subscribe((l) => (resultado = l));
    http.expectOne(ENDPOINTS.personasRaiting).flush({ codigoRespuesta: 'INF_DAT_NO_ENC' });
    expect(resultado).toEqual([]);
  });
});
