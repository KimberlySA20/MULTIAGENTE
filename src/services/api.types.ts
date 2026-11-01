import type {
  ConfirmarResumenPayload,
  DecidirSugerenciaPayload,
  EstadoEmprendimiento,
  MensajeChat,
  ModificarItemPayload,
  OmitirSolucionPayload,
  RespuestaServicio,
} from '../types';

export interface IEmprendimientoService {
  /**
   * Obtiene el estado consolidado de la Fase 0 para el emprendedor
   */
  obtenerEstado(emprendimientoId: string): Promise<RespuestaServicio<EstadoEmprendimiento>>;

  /**
   * Flujo 2: Modificar items del panel (confirmar, editar o eliminar dolores o etiquetas)
   * POST /panel/item
   */
  modificarItem(payload: ModificarItemPayload): Promise<RespuestaServicio<{ item_id: string; estado: string }>>;

  /**
   * Flujo 2b: Confirmar el resumen de diagnóstico
   * POST /panel/resumen/confirmar
   */
  confirmarResumen(payload: ConfirmarResumenPayload): Promise<RespuestaServicio<{ etapa: string; confirmado_en: string }>>;

  /**
   * Flujo 4: Omitir propuesta de solución por ahora
   * POST /problema/omitir
   */
  omitirSolucion(payload: OmitirSolucionPayload): Promise<RespuestaServicio<{ registrado: boolean }>>;

  /**
   * Flujo 4: Aceptar o descartar una sugerencia generada por la IA
   * POST /sugerencia/decidir
   */
  decidirSugerencia(payload: DecidirSugerenciaPayload): Promise<RespuestaServicio<{ sugerencia_id: string; nuevo_estado: string }>>;

  /**
   * Flujo 1: Envío de mensaje en la conversación de contextualización
   * (Trigger de Chat del Orquestador)
   */
  enviarMensajeChat(mensaje: string, emprendimientoId: string): Promise<RespuestaServicio<{ respuestaAsistente: MensajeChat }>>;
}
