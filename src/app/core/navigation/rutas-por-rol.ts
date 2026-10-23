import { Rol } from 'src/app/models/rol';

/**
 * Pantalla de inicio de cada rol. Antes este if/else estaba copiado en los dos guards y en el login;
 * un rol nuevo se agrega aquí y nada más.
 */
const INICIO_POR_ROL: Record<string, string> = {
  [Rol.CONTRATANTE]: '/inicio',
  [Rol.COLABORADOR]: '/inicio-colaborador',
};

/** Ruta de inicio del rol, o undefined si el rol no tiene pantalla propia. */
export function rutaInicioDe(rol: string | null | undefined): string | undefined {
  return rol ? INICIO_POR_ROL[rol] : undefined;
}
