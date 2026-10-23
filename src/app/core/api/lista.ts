import { map, OperatorFunction } from 'rxjs';
import { CONSTANTES } from 'src/app/constants/constants';
import { ListaResponse } from 'src/app/models/lista-response';

/**
 * Convierte la respuesta ListaDTO del backend en la lista de datos. Si el código no es "OK"
 * (p. ej. INF_DAT_NO_ENC en los endpoints de contratos, que responden 200 sin datos) devuelve [].
 * Reemplaza el `if (resp[CODIGO_RESPUESTA] === OK) ... resp['lista'] || []` copiado en cada componente.
 */
export function listaDe<T>(): OperatorFunction<ListaResponse<T>, T[]> {
  return map((resp) => (resp?.codigoRespuesta === CONSTANTES.OK ? resp.lista ?? [] : []));
}
