/** Respuesta de POST /public/login (AuthResponse del backend). */
export interface AuthResponse {
  token: string;
  username: string;
  idUsuario: number;
  idPersona: number;
  rol: string;
  codigoRespuesta?: string;
  mensajeRespuesta?: string;
}

/** Datos de la sesión que se conservan en el navegador. */
export interface UsuarioSesion {
  username: string;
  idUsuario: number;
  idPersona: number;
}
