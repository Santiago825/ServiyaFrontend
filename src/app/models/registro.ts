/** RegistroRequest del backend. foto y cv viajan en base64 (sin el prefijo "data:"). */
export interface RegistroRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idMunicipio: number;
  idDocumento: number;
  numeroDocumento: number;
  /** "Contratante" o "Colaborador" (el backend no distingue mayúsculas). */
  rol: string;
  descripcion: string;
  /** Obligatorio solo para colaboradores. */
  idServicio: number | null;
  foto: string | null;
  cv: string | null;
}
