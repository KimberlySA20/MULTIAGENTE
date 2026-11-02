import { CONFIG } from '../config/constants';
import type {
  ConfirmarResumenPayload,
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

  // ============================================================
  // ENDPOINTS DEFINIDOS EN LA ESPECIFICACIÓN DEL BACKEND
  // ============================================================

  /**
   * Consulta del estado del emprendimiento para el emprendedor.
   * Endpoint: GET /emprendimiento/:id/diagnostico
   */
  async obtenerEstado(emprendimientoId: string): Promise<RespuestaServicio<EstadoEmprendimiento>> {
    return this.request<EstadoEmprendimiento>(`/emprendimiento/${emprendimientoId}/diagnostico`, {
      method: 'GET',
    });
  }

  /**
   * Flujo 2: Modificar items del panel (confirmar, editar o eliminar)
   * Endpoint: POST /panel/item
   */
  async modificarItem(payload: ModificarItemPayload): Promise<RespuestaServicio<{ item_id: string; estado: string }>> {
    return this.request<{ item_id: string; estado: string }>('/panel/item', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 2b: Confirmar el resumen de diagnóstico
   * Endpoint: POST /panel/resumen/confirmar
   */
  async confirmarResumen(payload: ConfirmarResumenPayload): Promise<RespuestaServicio<{ etapa: string; confirmado_en: string }>> {
    return this.request<{ etapa: string; confirmado_en: string }>('/panel/resumen/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 4: Omitir solución por ahora
   * Endpoint: POST /problema/omitir
   */
  async omitirSolucion(payload: OmitirSolucionPayload): Promise<RespuestaServicio<{ registrado: boolean }>> {
    return this.request<{ registrado: boolean }>('/problema/omitir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 4: Decidir sugerencia de la IA (aceptar o descartar)
   * Endpoint: POST /sugerencia/decidir
   */
  async decidirSugerencia(payload: DecidirSugerenciaPayload): Promise<RespuestaServicio<{ sugerencia_id: string; nuevo_estado: string }>> {
    return this.request<{ sugerencia_id: string; nuevo_estado: string }>('/sugerencia/decidir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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

/**
 * Normaliza la respuesta del Webhook del agente a un MensajeChat.
 */
function extraerRespuestaAgente(data: unknown): MensajeChat | null {
  // n8n / flujos suelen devolver un arreglo con un solo item
  const raiz: any = Array.isArray(data) ? data[0] : data;
  if (!raiz || typeof raiz !== 'object') return null;

  if (raiz.respuestaAsistente && typeof raiz.respuestaAsistente.contenido === 'string') {
    return raiz.respuestaAsistente as MensajeChat;
  }

  const texto = [raiz.respuesta, raiz.output, raiz.text, raiz.message, raiz.contenido].find(
    (v) => typeof v === 'string' && v.trim()
  );
  if (!texto) return null;

  return {
    id: `msg-${Date.now()}`,
    emisor: 'asistente',
    contenido: texto,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
