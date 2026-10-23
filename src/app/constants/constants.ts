import { Rol } from '../models/rol';

export const CONSTANTES = {
  OK: 'OK',
  // Códigos de duplicado del backend (ConstantesCodigosError). Antes CORREO y DOCUMENTO estaban
  // intercambiados en el frontend.
  USUARIO_EXISTE: 'ERR_USU_EXI',
  CORREO_EXISTE: 'ERR_USU_COR_EXI',
  DOCUMENTO_EXISTE: 'ERR_USU_DOC_EXI',
  CODIGO_RESPUESTA: 'codigoRespuesta',
  MENSAJE_RESPUESTA: 'mensajeRespuesta',
  CONTRATANTE: Rol.CONTRATANTE,
  COLABORADOR: Rol.COLABORADOR,
};
