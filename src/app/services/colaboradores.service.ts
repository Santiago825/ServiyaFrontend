import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Colaborador {
  id: number;
  nombre: string;
  resenas: number;
  ciudad: string;
  categoria: string;
  foto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColaboradoresService {

  private jsonUrl = 'assets/colaboradores.json'; // ruta al archivo JSON

  constructor(private http: HttpClient) {}

  getColaboradores(): Observable<Colaborador[]> {
    return this.http.get<Colaborador[]>(this.jsonUrl);
  }
}
