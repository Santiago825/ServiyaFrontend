import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../Usuario/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class UsersResolver implements Resolve<any[]> {

  constructor(private userService: UsuarioService) {}

  resolve(): Observable<any[]> {
    // 🔹 Devuelve el observable con todos los usuarios
    return this.userService.obtenerUsuarios();
  }
}
