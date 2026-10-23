export interface Departamento {
  idDepartamento: number;
  nombre: string;
}

export interface Municipio {
  idMunicipio: number;
  nombre: string;
  id_departamento: number;
}

/** Entidad TipoDocumento del backend. */
export interface TipoDocumento {
  idDocumento: number;
  tipo: string;
  nombre: string;
}
