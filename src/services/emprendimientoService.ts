import { CONFIG } from '../config/constants';
import type {
  ConfirmarResumenPayload,
  Dolor,
  DecidirSugerenciaPayload,
  EstadoEmprendimiento,
  MensajeChat,
  ModificarItemPayload,
  OmitirSolucionPayload,
  RespuestaServicio,
} from '../types';
import type { IEmprendimientoService } from './api.types';

/**
 * Implementación HTTP Real: Llamadas a la API backend / Webhooks del agente
 */
export class HttpEmprendimientoService implements IEmprendimientoService {
  private baseUrl: string;

  constructor(baseUrl: string = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<RespuestaServicio<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          exito: false,
          error: {
            codigo: response.status.toString(),
            mensaje: errorData.message || `Error del servidor (${response.status})`,
            detalle: errorData.detail,
          },
        };
      }

      const datos = await response.json();
      return { exito: true, datos };
    } catch (err: any) {
      return {
        exito: false,
        error: {
          codigo: 'NETWORK_ERROR',
          mensaje: 'No se pudo conectar con el servidor. Verificá tu conexión.',
          detalle: err.message,
        },
      };
    }
  }

  /**
   * POST a un Webhook de Visione Flow (cada flujo tiene su propia URL).
   * Si la URL no está configurada devuelve un error claro en vez de llamar a la nada.
   */
  private async postWebhook<T>(url: string, nombreVariable: string, body: unknown): Promise<RespuestaServicio<T>> {
    if (!url) {
      return {
        exito: false,
        error: {
          codigo: 'WEBHOOK_NO_CONFIGURADO',
          mensaje: 'Esta acción todavía no está conectada a su flujo.',
          detalle: `Falta definir ${nombreVariable} en el .env`,
        },
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.WEBHOOK_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const cuerpo = await response.text().catch(() => '');
        console.error(`[Webhook ${nombreVariable}] ${response.status} ${response.statusText}`, cuerpo);
        return {
          exito: false,
          error: {
            codigo: response.status.toString(),
            mensaje: `El flujo no pudo procesar la acción (${response.status}). Intentá de nuevo.`,
            detalle: cuerpo.slice(0, 500),
          },
        };
      }

      // Los flujos suelen responder con un arreglo de un item o anidar el resultado en "data"
      const json = await response.json().catch(() => null);
      const raiz: any = Array.isArray(json) ? json[0] : json;

      // Un flujo puede responder 200 pero avisar que algo falló
      if (raiz && (raiz.exito === false || raiz.success === false)) {
        const msg = [raiz.mensaje, raiz.message, raiz.error].find((v) => typeof v === 'string' && v.trim());
        return {
          exito: false,
          error: {
            codigo: 'FLUJO_RECHAZO',
            mensaje: msg || 'El flujo no pudo completar la acción.',
            detalle: JSON.stringify(raiz).slice(0, 500),
          },
        };
      }

      const datos = (raiz?.data && typeof raiz.data === 'object' ? raiz.data : raiz) ?? {};
      return { exito: true, datos: datos as T };
    } catch (err: any) {
      const timeout = err?.name === 'AbortError';
      return {
        exito: false,
        error: {
          codigo: timeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          mensaje: timeout
            ? 'El flujo tardó demasiado en responder. Intentá de nuevo.'
            : 'No se pudo conectar con el flujo. Verificá tu conexión.',
          detalle: err?.message,
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================================
  // ENDPOINTS / WEBHOOKS
  // ============================================================

  /**
   * Consulta del estado del emprendimiento para el emprendedor.
   * Endpoint: GET /emprendimiento/:id/diagnostico
   */
  async obtenerEstado(emprendimientoId: string): Promise<RespuestaServicio<EstadoEmprendimiento>> {
    // Flujo 2c: el estado se lee desde Supabase a través de un flujo de Visione Flow
    if (CONFIG.WEBHOOK_ESTADO_URL) {
      const resp = await this.postWebhook<unknown>(
        CONFIG.WEBHOOK_ESTADO_URL,
        'VITE_WEBHOOK_ESTADO_URL',
        { message: String(emprendimientoId), emprendimiento_id: emprendimientoId }
      );
      if (!resp.exito) return { exito: false, error: resp.error };

      const estado = normalizarEstado(resp.datos, emprendimientoId);
      if (!estado) {
        console.error('[Webhook estado] Respuesta con formato no reconocido:', resp.datos);
        return {
          exito: false,
          error: {
            codigo: 'ESTADO_INVALIDO',
            mensaje: 'El flujo del estado respondió en un formato que no se pudo leer.',
            detalle: JSON.stringify(resp.datos).slice(0, 500),
          },
        };
      }
      return { exito: true, datos: estado };
    }

    return this.request<EstadoEmprendimiento>(`/emprendimiento/${emprendimientoId}/diagnostico`, {
      method: 'GET',
    });
  }

  /**
   * Flujo 2: Modificar items del panel (confirmar, editar o eliminar)
   * Webhook: VITE_WEBHOOK_PANEL_ITEM_URL
   */
  async modificarItem(payload: ModificarItemPayload): Promise<RespuestaServicio<{ item_id: string; estado: string }>> {
    return this.postWebhook<{ item_id: string; estado: string }>(
      CONFIG.WEBHOOK_PANEL_ITEM_URL,
      'VITE_WEBHOOK_PANEL_ITEM_URL',
      payload
    );
  }

  /**
   * Flujo 2b: Confirmar el resumen de diagnóstico
   * Webhook: VITE_WEBHOOK_CONFIRMAR_RESUMEN_URL
   */
  async confirmarResumen(payload: ConfirmarResumenPayload): Promise<RespuestaServicio<{ etapa: string; confirmado_en: string }>> {
    return this.postWebhook<{ etapa: string; confirmado_en: string }>(
      CONFIG.WEBHOOK_CONFIRMAR_RESUMEN_URL,
      'VITE_WEBHOOK_CONFIRMAR_RESUMEN_URL',
      payload
    );
  }

  /**
   * Flujo 4: Omitir solución por ahora
   * Webhook: VITE_WEBHOOK_OMITIR_URL (el workflow aún no existe)
   */
  async omitirSolucion(payload: OmitirSolucionPayload): Promise<RespuestaServicio<{ registrado: boolean }>> {
    return this.postWebhook<{ registrado: boolean }>(
      CONFIG.WEBHOOK_OMITIR_URL,
      'VITE_WEBHOOK_OMITIR_URL',
      payload
    );
  }

  /**
   * Flujo 4: Decidir sugerencia de la IA (aceptar o descartar)
   * Webhook: VITE_WEBHOOK_DECIDIR_SUGERENCIA_URL (aún no configurado)
   */
  async decidirSugerencia(payload: DecidirSugerenciaPayload): Promise<RespuestaServicio<{ sugerencia_id: string; nuevo_estado: string }>> {
    return this.postWebhook<{ sugerencia_id: string; nuevo_estado: string }>(
      CONFIG.WEBHOOK_DECIDIR_SUGERENCIA_URL,
      'VITE_WEBHOOK_DECIDIR_SUGERENCIA_URL',
      payload
    );
  }

  /**
   * Flujo 1: Envío de mensaje al agente por Webhook.
   * Si VITE_WEBHOOK_CHAT_URL está definida, se llama directo al Webhook del agente;
   * si no, cae al endpoint POST /chat/mensaje del backend.
   *
   * Body enviado:    { message, emprendimiento_id, session_id }
   * Respuesta (acepta varias formas, según cómo responda el nodo "Respond to Webhook"):
   *   { respuesta | output | text | message | contenido: string }  o  { respuestaAsistente: MensajeChat }
   */
  async enviarMensajeChat(mensaje: string, emprendimientoId: string): Promise<RespuestaServicio<{ respuestaAsistente: MensajeChat }>> {
    const webhookUrl = CONFIG.WEBHOOK_CHAT_URL;
    if (!webhookUrl) {
      return this.request<{ respuestaAsistente: MensajeChat }>('/chat/mensaje', {
        method: 'POST',
        body: JSON.stringify({ mensaje, emprendimiento_id: emprendimientoId }),
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.WEBHOOK_TIMEOUT_MS);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // El webhook de Visione Flow valida el campo "message" (en inglés)
        body: JSON.stringify({
          message: mensaje,
          emprendimiento_id: emprendimientoId,
          session_id: emprendimientoId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Leemos el cuerpo para poder diagnosticar por qué el webhook rechazó la petición
        const cuerpo = await response.text().catch(() => '');
        console.error(`[Webhook chat] ${response.status} ${response.statusText}`, cuerpo);
        return {
          exito: false,
          error: {
            codigo: response.status.toString(),
            mensaje: `El agente no pudo responder (${response.status}). Intentá de nuevo.`,
            detalle: cuerpo.slice(0, 500),
          },
        };
      }

      const data = await response.json().catch(() => null);
      const respuesta = extraerRespuestaAgente(data);
      if (!respuesta) {
        console.error('[Webhook chat] Respuesta con formato no reconocido:', data);
        return {
          exito: false,
          error: {
            codigo: 'RESPUESTA_INVALIDA',
            mensaje: 'El agente respondió en un formato que no se pudo leer.',
            detalle: JSON.stringify(data),
          },
        };
      }
      return { exito: true, datos: { respuestaAsistente: respuesta } };
    } catch (err: any) {
      const timeout = err?.name === 'AbortError';
      return {
        exito: false,
        error: {
          codigo: timeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          mensaje: timeout
            ? 'El agente tardó demasiado en responder. Intentá de nuevo.'
            : 'No se pudo conectar con el agente. Verificá tu conexión.',
          detalle: err?.message,
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/** Campos donde el flujo puede devolver el texto de la respuesta (en orden de prioridad) */
const CAMPOS_TEXTO = [
  'respuesta', 'response', 'reply', 'output', 'text', 'message', 'content', 'contenido', 'answer', 'result',
];
/** Contenedores donde el flujo puede anidar la respuesta */
const CAMPOS_ANIDADOS = ['data', 'result', 'output', 'response', 'body', 'json'];

/**
 * Busca el texto de la respuesta del agente, aunque venga anidado
 * (por ejemplo { success, data: { response: "..." } }).
 */
function buscarTexto(valor: unknown, profundidad = 0): string | null {
  if (typeof valor === 'string') return valor.trim() ? valor : null;
  if (!valor || typeof valor !== 'object' || profundidad > 4) return null;
  if (Array.isArray(valor)) return buscarTexto(valor[0], profundidad + 1);

  const obj = valor as Record<string, unknown>;
  for (const campo of CAMPOS_TEXTO) {
    const encontrado = buscarTexto(obj[campo], profundidad + 1);
    if (encontrado) return encontrado;
  }
  for (const campo of CAMPOS_ANIDADOS) {
    const encontrado = buscarTexto(obj[campo], profundidad + 1);
    if (encontrado) return encontrado;
  }
  return null;
}

/**
 * Normaliza la respuesta del Webhook del agente a un MensajeChat.
 */
function extraerRespuestaAgente(data: unknown): MensajeChat | null {
  // n8n / flujos suelen devolver un arreglo con un solo item
  const raiz: any = Array.isArray(data) ? data[0] : data;

  // Si ya viene como MensajeChat completo, se respeta tal cual
  if (raiz && typeof raiz === 'object' && typeof raiz.respuestaAsistente?.contenido === 'string') {
    return raiz.respuestaAsistente as MensajeChat;
  }

  const texto = buscarTexto(raiz);
  if (!texto) return null;

  return {
    id: `msg-${Date.now()}`,
    emisor: 'asistente',
    contenido: texto,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Busca, aunque venga anidado (por ejemplo { data: { data: {...} } } según cómo responda
 * el nodo Salida del flujo), el objeto que contiene el estado del emprendimiento.
 */
function buscarEstado(valor: unknown, profundidad = 0): Record<string, any> | null {
  if (!valor || typeof valor !== 'object' || profundidad > 4) return null;
  if (Array.isArray(valor)) return buscarEstado(valor[0], profundidad + 1);
  const obj = valor as Record<string, any>;
  if (Array.isArray(obj.dolores) || Array.isArray(obj.etiquetas)) return obj;
  for (const campo of CAMPOS_ANIDADOS) {
    const encontrado = buscarEstado(obj[campo], profundidad + 1);
    if (encontrado) return encontrado;
  }
  return null;
}

const numeroONull = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/**
 * Convierte lo que devuelve el flujo del estado en un EstadoEmprendimiento completo.
 * Solo rellena estructuras vacías (arreglos, textos); nunca inventa dolores ni etiquetas.
 */
function normalizarEstado(datos: unknown, emprendimientoId: string): EstadoEmprendimiento | null {
  const raw = buscarEstado(datos);
  if (!raw) return null;

  const dolores: Dolor[] = (Array.isArray(raw.dolores) ? raw.dolores : []).map((d: any) => ({
    id: String(d.id),
    nombre: String(d.nombre ?? d.dolor ?? ''),
    importancia: numeroONull(d.importancia),
    satisfaccion: numeroONull(d.satisfaccion),
    score: numeroONull(d.score),
    nivel: d.nivel === 'Alto' || d.nivel === 'Medio' || d.nivel === 'Bajo' ? d.nivel : null,
    cita: typeof d.cita === 'string' && d.cita.trim() ? d.cita : null,
    confianza: d.confianza === 'alta' || d.confianza === 'media' || d.confianza === 'baja' ? d.confianza : 'media',
    estado: d.estado ?? 'por_confirmar',
    etiquetas: Array.isArray(d.etiquetas) ? d.etiquetas.map(String) : [],
    tipoItem: d.tipoItem ?? 'estimacion',
  }));

  const resumen = raw.resumenEstado ?? {};
  return {
    id: String(raw.id ?? emprendimientoId),
    nombreEmprendimiento: String(raw.nombreEmprendimiento ?? ''),
    etapa: raw.etapa ?? 'resumen_por_confirmar',
    etiquetas: Array.isArray(raw.etiquetas) ? raw.etiquetas.map(String) : [],
    dolores,
    sugerencias: Array.isArray(raw.sugerencias) ? raw.sugerencias : [],
    notaMentor: raw.notaMentor ?? null,
    estadoNotificacionMentor: raw.estadoNotificacionMentor ?? 'no_iniciada',
    resumenConfirmadoPor: raw.resumenConfirmadoPor,
    fechaConfirmacionResumen: raw.fechaConfirmacionResumen,
    resumenEstado: {
      confirmado: String(resumen.confirmado ?? ''),
      queCambio: String(resumen.queCambio ?? ''),
      esperaMentor: String(resumen.esperaMentor ?? ''),
      proximaAccion: String(resumen.proximaAccion ?? ''),
    },
  };
}
