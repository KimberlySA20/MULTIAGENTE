import { CONFIG } from '../config/constants';
import { INITIAL_CHAT_MESSAGES, INITIAL_ESTADO_EMPRENDIMIENTO } from '../mocks/initialData';
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

export interface DemoSimulationConfig {
  simularErrorRed: boolean;
  simularErrorPermiso: boolean;
  latenciaLenta: boolean;
  fallaAvisoMentor: boolean;
}

/**
 * Implementación MOCK: Datos reactivos en memoria con simulación de demoras y fallos controlables
 */
export class MockEmprendimientoService implements IEmprendimientoService {
  private estado: EstadoEmprendimiento;
  private chatHistory: MensajeChat[];
  private simConfig: DemoSimulationConfig = {
    simularErrorRed: false,
    simularErrorPermiso: false,
    latenciaLenta: false,
    fallaAvisoMentor: false,
  };

  constructor() {
    this.estado = JSON.parse(JSON.stringify(INITIAL_ESTADO_EMPRENDIMIENTO));
    this.chatHistory = JSON.parse(JSON.stringify(INITIAL_CHAT_MESSAGES));
  }

  public updateSimConfig(config: Partial<DemoSimulationConfig>) {
    this.simConfig = { ...this.simConfig, ...config };
  }

  public getSimConfig(): DemoSimulationConfig {
    return { ...this.simConfig };
  }

  public resetData() {
    this.estado = JSON.parse(JSON.stringify(INITIAL_ESTADO_EMPRENDIMIENTO));
    this.chatHistory = JSON.parse(JSON.stringify(INITIAL_CHAT_MESSAGES));
  }

  public setEstadoDirecto(nuevoEstado: Partial<EstadoEmprendimiento>) {
    this.estado = { ...this.estado, ...nuevoEstado };
  }

  private async esperar() {
    const ms = this.simConfig.latenciaLenta ? CONFIG.SLOW_LATENCY_MS : CONFIG.DEMO_LATENCY_MS;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private verificarErroresSimulados<T>(): RespuestaServicio<T> | null {
    if (this.simConfig.simularErrorRed) {
      return {
        exito: false,
        error: {
          codigo: 'NETWORK_ERROR',
          mensaje: 'Error de conexión con el servidor. Revisá tu conexión a internet.',
        },
      };
    }
    if (this.simConfig.simularErrorPermiso) {
      return {
        exito: false,
        error: {
          codigo: 'FORBIDDEN',
          mensaje: 'No tenés permisos para realizar esta acción en este emprendimiento.',
        },
      };
    }
    return null;
  }

  async obtenerEstado(_id: string): Promise<RespuestaServicio<EstadoEmprendimiento>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<EstadoEmprendimiento>();
    if (errorSim) return errorSim;

    return {
      exito: true,
      datos: JSON.parse(JSON.stringify(this.estado)),
    };
  }

  async modificarItem(payload: ModificarItemPayload): Promise<RespuestaServicio<{ item_id: string; estado: string }>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<{ item_id: string; estado: string }>();
    if (errorSim) return errorSim;

    if (payload.tipo_item === 'etiqueta') {
      if (payload.accion === 'eliminar' && payload.nuevo_valor?.nombre) {
        this.estado.etiquetas = this.estado.etiquetas.filter((e) => e !== payload.nuevo_valor?.nombre);
      } else if (payload.accion === 'editar' && payload.nuevo_valor?.nombre) {
        if (!this.estado.etiquetas.includes(payload.nuevo_valor.nombre)) {
          this.estado.etiquetas.push(payload.nuevo_valor.nombre);
        }
      }
    } else if (payload.tipo_item === 'dolor') {
      const dolor = this.estado.dolores.find((d) => d.id === payload.item_id);
      if (dolor) {
        if (payload.accion === 'editar') {
          if (payload.nuevo_valor?.nombre) dolor.nombre = payload.nuevo_valor.nombre;
          if (payload.nuevo_valor?.etiquetas) dolor.etiquetas = payload.nuevo_valor.etiquetas;
        } else if (payload.accion === 'confirmar') {
          dolor.estado = 'confirmado';
        } else if (payload.accion === 'eliminar') {
          this.estado.dolores = this.estado.dolores.filter((d) => d.id !== payload.item_id);
        }
      }
    }

    return {
      exito: true,
      datos: { item_id: payload.item_id, estado: 'actualizado' },
    };
  }

  async confirmarResumen(payload: ConfirmarResumenPayload): Promise<RespuestaServicio<{ etapa: string; confirmado_en: string }>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<{ etapa: string; confirmado_en: string }>();
    if (errorSim) return errorSim;

    // Regla de negocio 3.1: Al confirmar, la etapa cambia a 'resumen_confirmado'
    this.estado.etapa = 'resumen_confirmado';
    this.estado.resumenConfirmadoPor = payload.usuario;
    this.estado.fechaConfirmacionResumen = new Date().toISOString();
    this.estado.dolores.forEach((d) => {
      d.estado = 'confirmado';
    });

    // Iniciar aviso al mentor en progreso (Flujo 5a)
    this.estado.estadoNotificacionMentor = 'en_progreso';

    // Simular que Flujo 5a concluye después de 2 segundos en background
    setTimeout(() => {
      if (this.simConfig.fallaAvisoMentor) {
        this.estado.estadoNotificacionMentor = 'fallida';
      } else {
        this.estado.estadoNotificacionMentor = 'confirmada';
      }
    }, 2500);

    return {
      exito: true,
      datos: {
        etapa: 'resumen_confirmado',
        confirmado_en: this.estado.fechaConfirmacionResumen,
      },
    };
  }

  async omitirSolucion(_payload: OmitirSolucionPayload): Promise<RespuestaServicio<{ registrado: boolean }>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<{ registrado: boolean }>();
    if (errorSim) return errorSim;

    // Regla 6: la interfaz SOLO envía la acción al backend (POST /problema/omitir) y continúa.
    // La interfaz NO inventa sugerencias por su cuenta.
    return {
      exito: true,
      datos: { registrado: true },
    };
  }

  async decidirSugerencia(payload: DecidirSugerenciaPayload): Promise<RespuestaServicio<{ sugerencia_id: string; nuevo_estado: string }>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<{ sugerencia_id: string; nuevo_estado: string }>();
    if (errorSim) return errorSim;

    const sug = this.estado.sugerencias.find((s) => s.id === payload.sugerencia_id);
    if (sug) {
      sug.estado = payload.decision === 'aceptar' ? 'aceptada' : 'descartada';
    }

    return {
      exito: true,
      datos: {
        sugerencia_id: payload.sugerencia_id,
        nuevo_estado: payload.decision === 'aceptar' ? 'aceptada' : 'descartada',
      },
    };
  }

  async enviarMensajeChat(_mensaje: string, _emprendimientoId: string): Promise<RespuestaServicio<{ respuestaAsistente: MensajeChat }>> {
    await this.esperar();
    const errorSim = this.verificarErroresSimulados<{ respuestaAsistente: MensajeChat }>();
    if (errorSim) return errorSim;

    // Generar respuesta del asistente simulando el Flujo 1
    const respuestasSimuladas: string[] = [
      'Entendido. ¿Cuál es el mayor cuello de botella operativo que tenés hoy?',
      'Anotado. ¿Cómo afectaría a tus clientes si este problema no se resuelve en los próximos 3 meses?',
      'Perfecto, lo integré a tu diagnóstico. ¿Hay algún otro dolor importante en la operación diaria?',
    ];
    const index = Math.floor(Math.random() * respuestasSimuladas.length);
    const contenido = respuestasSimuladas[index];

    const nuevaRespuesta: MensajeChat = {
      id: `msg-${Date.now()}`,
      emisor: 'asistente',
      contenido,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.chatHistory.push(nuevaRespuesta);

    return {
      exito: true,
      datos: { respuestaAsistente: nuevaRespuesta },
    };
  }
}

/**
 * Implementación HTTP Real: Llamadas a la API backend
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
      return {
        exito: true,
        datos,
      };
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
   * Flujo 2: Modificar items del panel (confirmar, editar o eliminar)
   * Endpoint oficial definido: POST /panel/item
   */
  async modificarItem(payload: ModificarItemPayload): Promise<RespuestaServicio<{ item_id: string; estado: string }>> {
    return this.request<{ item_id: string; estado: string }>('/panel/item', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 2b: Confirmar el resumen de diagnóstico
   * Endpoint oficial definido: POST /panel/resumen/confirmar
   */
  async confirmarResumen(payload: ConfirmarResumenPayload): Promise<RespuestaServicio<{ etapa: string; confirmado_en: string }>> {
    return this.request<{ etapa: string; confirmado_en: string }>('/panel/resumen/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 4: Omitir solución por ahora
   * Endpoint oficial definido: POST /problema/omitir
   */
  async omitirSolucion(payload: OmitirSolucionPayload): Promise<RespuestaServicio<{ registrado: boolean }>> {
    return this.request<{ registrado: boolean }>('/problema/omitir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Flujo 4: Decidir sugerencia de la IA (aceptar o descartar)
   * Endpoint oficial definido: POST /sugerencia/decidir
   */
  async decidirSugerencia(payload: DecidirSugerenciaPayload): Promise<RespuestaServicio<{ sugerencia_id: string; nuevo_estado: string }>> {
    return this.request<{ sugerencia_id: string; nuevo_estado: string }>('/sugerencia/decidir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ============================================================
  // CONTRATOS PROVISIONALES (PENDIENTES DE CONFIRMAR CON BACKEND)
  // No inventados: marcados como propuestas aisladas en la capa de servicios
  // ============================================================

  /**
   * PROPUESTA PROVISIONAL: Consulta del estado del emprendimiento para el emprendedor.
   * Pendiente de confirmar: hoy solo existe GET /mentor/emprendimiento/:id para el mentor.
   */
  async obtenerEstado(emprendimientoId: string): Promise<RespuestaServicio<EstadoEmprendimiento>> {
    return this.request<EstadoEmprendimiento>(`/emprendimiento/${emprendimientoId}/diagnostico`, {
      method: 'GET',
    });
  }

  /**
   * PROPUESTA PROVISIONAL: Envío de mensaje en la conversación de contextualización.
   * Pendiente de confirmar: el Flujo 1 usa un Chat Trigger sin URL REST definida aún.
   */
  async enviarMensajeChat(mensaje: string, emprendimientoId: string): Promise<RespuestaServicio<{ respuestaAsistente: MensajeChat }>> {
    return this.request<{ respuestaAsistente: MensajeChat }>('/chat/mensaje', {
      method: 'POST',
      body: JSON.stringify({ mensaje, emprendimiento_id: emprendimientoId }),
    });
  }
}
