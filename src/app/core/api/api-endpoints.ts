import { environment } from 'src/app/environment/environment';

const PUBLICO = environment.urlApi; // <host>/public/
const PRIVADO = environment.urlApiPrivate; // <host>/private/

/**
 * ÚNICO lugar donde viven las rutas del backend. Espejo de ConstantesSeguridadPathRest: si una ruta
 * cambia allá, se cambia solo aquí (antes estaban escritas como texto dentro de cada servicio).
 */
export const ENDPOINTS = {
  // ───── públicos ─────
  login: `${PUBLICO}login`,
  registro: `${PUBLICO}registro`,
  validarUsername: `${PUBLICO}validar-username`,

  // ───── catálogos ─────
  servicios: `${PRIVADO}obtener_servicios`,
  serviciosMasUsos: `${PRIVADO}obtener_servicios_mas_usos`,
  departamentos: `${PRIVADO}obtener_departamento`,
  municipios: (idDepartamento: number) => `${PRIVADO}obtener_municipio/${idDepartamento}`,
  tiposDocumento: `${PRIVADO}obtener_documento`,

  // ───── colaboradores y seguimiento ─────
  colaboradores: `${PRIVADO}obtener_colaborador`,
  detalleColaborador: `${PRIVADO}obtener_detalle_colaborador`,
  personasRaiting: `${PRIVADO}obtener_personas_raiting`,
  cv: (idPersona: number) => `${PRIVADO}obtenerCV/${idPersona}`,
  seguirColaborador: `${PRIVADO}seguir_colaborador`,
  // La errata "Seeguir" es del backend (PATH_DEJAR_SEGUIR_COLABORADOR): debe coincidir tal cual.
  dejarSeguirColaborador: `${PRIVADO}dejar_Seeguir_colaborador`,
  colaboradoresSeguidos: (idUsuario: number) => `${PRIVADO}obtener_colaboradores_seguidos/${idUsuario}`,
  seguidoresColaborador: (idUsuario: number) => `${PRIVADO}obtener_seguidores_colaborador/${idUsuario}`,

  // ───── contratos ─────
  crearContrato: `${PRIVADO}crear_contrato`,
  misContratos: `${PRIVADO}mis_contratos`,
  misContratosColaborador: `${PRIVADO}mis_contratos_colaborador`,
  detalleContrato: (idContrato: number) => `${PRIVADO}contrato_detalle/${idContrato}`,
  misResenasColaborador: `${PRIVADO}mis_resenas_colaborador`,
  dashboardColaborador: `${PRIVADO}dashboard_colaborador`,
  resenarContrato: (idContrato: number) => `${PRIVADO}resenar_contrato/${idContrato}`,
  aceptarContrato: (idContrato: number) => `${PRIVADO}aceptar_contrato/${idContrato}`,
  rechazarContrato: (idContrato: number) => `${PRIVADO}rechazar_contrato/${idContrato}`,
  archivoContrato: (idContrato: number) => `${PRIVADO}obtener_archivo_contrato/${idContrato}`,

  // ───── chat ─────
  mensajes: (interlocutor: string) => `${PRIVADO}obtener_mensajes/${encodeURIComponent(interlocutor)}`,
  conversaciones: `${PRIVADO}obtener_conversaciones`,
  presencia: `${PRIVADO}obtener_presencia`,

  // ───── WebSocket / STOMP (WebSocketConfig del backend) ─────
  ws: `${environment.urlHost}ws`,
  wsEnviarMensaje: '/app/private-message',
  wsColaMensajes: '/user/queue/messages',
  wsColaErrores: '/user/queue/errors',
  wsColaPresencia: '/user/queue/presence',
} as const;
