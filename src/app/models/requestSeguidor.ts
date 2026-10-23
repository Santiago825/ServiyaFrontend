/**
 * Cuerpo de seguir / dejar de seguir. El contratante NO se envía: el backend lo toma del token
 * (antes se mandaba "contratante" y cualquiera podía actuar en nombre de otro).
 */
export interface SeguirColaboradorRequest {
  colaborador: number;
}
