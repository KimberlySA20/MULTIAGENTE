import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  EstadoEmprendimiento,
  EstadoNotificacionMentor,
  EtapaEmprendimiento,
  MensajeChat,
  NotaMentor,
} from '../types';
import type { IEmprendimientoService } from '../services/api.types';
import {
  type DemoSimulationConfig,
  HttpEmprendimientoService,
  MockEmprendimientoService,
} from '../services/emprendimientoService';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_ESTADO_EMPRENDIMIENTO,
  INITIAL_NOTA_MENTOR,
  NOTA_MENTOR_CON_AJUSTE,
} from '../mocks/initialData';
import { CONFIG } from '../config/constants';

interface EmprendimientoContextValue {
  estado: EstadoEmprendimiento | null;
  mensajesChat: MensajeChat[];
  cargando: boolean;
  esperandoRespuestaChat: boolean;
  errorGlobal: { codigo: string; mensaje: string } | null;
  limpiarError: () => void;
  reintentar: () => Promise<void>;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  simConfig: DemoSimulationConfig;
  actualizarSimConfig: (config: Partial<DemoSimulationConfig>) => void;

  // Acciones de negocio
  enviarMensaje: (texto: string) => Promise<boolean>;
  omitirSolucion: () => Promise<boolean>;
  confirmarResumen: () => Promise<boolean>;
  agregarEtiqueta: (etiqueta: string) => Promise<boolean>;
  eliminarEtiqueta: (etiqueta: string) => Promise<boolean>;
  editarDolor: (dolorId: string, nuevoNombre: string, etiquetas: string[], motivo?: string) => Promise<boolean>;
  decidirSugerencia: (sugerenciaId: string, decision: 'aceptar' | 'descartar') => Promise<boolean>;

  // Herramientas del Panel de Control Demo
  forzarEtapa: (etapa: EtapaEmprendimiento) => void;
  forzarAvisoMentor: (estado: EstadoNotificacionMentor) => void;
  forzarVarianteMentor: (variante: 'sin_nota' | 'nota_normal' | 'con_ajuste_score') => void;
  resetDemoData: () => void;
}

const EmprendimientoContext = createContext<EmprendimientoContextValue | null>(null);

const mockServiceInstance = new MockEmprendimientoService();
const httpServiceInstance = new HttpEmprendimientoService();

export const EmprendimientoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(CONFIG.IS_DEMO_DEFAULT);
  const [estado, setEstado] = useState<EstadoEmprendimiento | null>(null);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>(INITIAL_CHAT_MESSAGES);
  const [cargando, setCargando] = useState<boolean>(true);
  const [esperandoRespuestaChat, setEsperandoRespuestaChat] = useState<boolean>(false);
  const [errorGlobal, setErrorGlobal] = useState<{ codigo: string; mensaje: string } | null>(null);
  const [simConfig, setSimConfigState] = useState<DemoSimulationConfig>(mockServiceInstance.getSimConfig());

  // Proveedor de servicio activo según isDemoMode
  const activeService: IEmprendimientoService = useMemo(() => {
    return isDemoMode ? mockServiceInstance : httpServiceInstance;
  }, [isDemoMode]);

  const cargarEstadoInicial = useCallback(async () => {
    setCargando(true);
    setErrorGlobal(null);
    try {
      const resp = await activeService.obtenerEstado('emp-101');
      if (resp.exito && resp.datos) {
        setEstado(resp.datos);
      } else if (resp.error) {
        setErrorGlobal(resp.error);
      }
    } catch (e: any) {
      setErrorGlobal({
        codigo: 'UNKNOWN_ERROR',
        mensaje: 'Ocurrió un error inesperado al cargar el estado.',
      });
    } finally {
      setCargando(false);
    }
  }, [activeService]);

  useEffect(() => {
    cargarEstadoInicial();
  }, [cargarEstadoInicial]);

  // Hook de sincronización periódica configurable (polling bajo demanda)
  useEffect(() => {
    if (!estado || cargando) return;
    // Solo cuando hay un aviso al mentor en progreso revisamos periódicamente
    let intervalId: any = null;
    if (estado.estadoNotificacionMentor === 'en_progreso') {
      intervalId = setInterval(async () => {
        const resp = await activeService.obtenerEstado(estado.id);
        if (resp.exito && resp.datos) {
          setEstado(resp.datos);
        }
      }, 1500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [estado, activeService, cargando]);

  const limpiarError = useCallback(() => {
    setErrorGlobal(null);
  }, []);

  const reintentar = useCallback(async () => {
    await cargarEstadoInicial();
  }, [cargarEstadoInicial]);

  const actualizarSimConfig = useCallback((newConfig: Partial<DemoSimulationConfig>) => {
    mockServiceInstance.updateSimConfig(newConfig);
    setSimConfigState(mockServiceInstance.getSimConfig());
  }, []);

  const enviarMensaje = useCallback(
    async (texto: string): Promise<boolean> => {
      if (!texto.trim() || esperandoRespuestaChat || !estado) return false;

      const mensajeUsuario: MensajeChat = {
        id: `msg-user-${Date.now()}`,
        emisor: 'emprendedor',
        contenido: texto.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMensajesChat((prev) => [...prev, mensajeUsuario]);
      setEsperandoRespuestaChat(true);
      setErrorGlobal(null);

      try {
        const resp = await activeService.enviarMensajeChat(texto, estado.id);
        if (resp.exito && resp.datos) {
          setMensajesChat((prev) => [...prev, resp.datos!.respuestaAsistente]);
          // Refrescar estado para reflejar posibles dolores detectados
          const estadoActualizado = await activeService.obtenerEstado(estado.id);
          if (estadoActualizado.exito && estadoActualizado.datos) {
            setEstado(estadoActualizado.datos);
          }
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
          return false;
        }
      } catch (err: any) {
        setErrorGlobal({
          codigo: 'CHAT_ERROR',
          mensaje: 'No se pudo enviar el mensaje. Conservamos tu texto para reintentar.',
        });
        return false;
      } finally {
        setEsperandoRespuestaChat(false);
      }
      return false;
    },
    [activeService, estado, esperandoRespuestaChat]
  );

  const omitirSolucion = useCallback(async (): Promise<boolean> => {
    if (!estado) return false;
    setErrorGlobal(null);
    try {
      const resp = await activeService.omitirSolucion({
        emprendimiento_id: estado.id,
        usuario: 'Emprendedor',
      });
      if (resp.exito) {
        // Continuar la conversación con un mensaje del asistente
        const mensajeAsistente: MensajeChat = {
          id: `msg-omit-${Date.now()}`,
          emisor: 'asistente',
          contenido: 'Perfecto, dejamos la solución pendiente por ahora. Sigamos con el diagnóstico.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMensajesChat((prev) => [...prev, mensajeAsistente]);
        return true;
      } else if (resp.error) {
        setErrorGlobal(resp.error);
      }
    } catch (e: any) {
      setErrorGlobal({
        codigo: 'OMITIR_ERROR',
        mensaje: 'Error al registrar la omisión.',
      });
    }
    return false;
  }, [activeService, estado]);

  const confirmarResumen = useCallback(async (): Promise<boolean> => {
    if (!estado) return false;
    setErrorGlobal(null);
    try {
      const resp = await activeService.confirmarResumen({
        emprendimiento_id: estado.id,
        usuario: 'Emprendedor',
      });
      if (resp.exito) {
        // Actualizar estado local inmediatamente a resumen_confirmado
        setEstado((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            etapa: 'resumen_confirmado',
            estadoNotificacionMentor: 'en_progreso',
            fechaConfirmacionResumen: resp.datos?.confirmado_en,
            dolores: prev.dolores.map((d) => ({ ...d, estado: 'confirmado' })),
          };
        });
        return true;
      } else if (resp.error) {
        setErrorGlobal(resp.error);
      }
    } catch (e: any) {
      setErrorGlobal({
        codigo: 'CONFIRMACION_ERROR',
        mensaje: 'Error al confirmar el resumen.',
      });
    }
    return false;
  }, [activeService, estado]);

  const agregarEtiqueta = useCallback(
    async (etiqueta: string): Promise<boolean> => {
      if (!estado || !etiqueta.trim()) return false;
      const etiquetaFormateada = etiqueta.startsWith('#') ? etiqueta : `#${etiqueta}`;
      if (estado.etiquetas.includes(etiquetaFormateada)) return true;

      setErrorGlobal(null);
      try {
        const resp = await activeService.modificarItem({
          item_id: 'etiquetas',
          tipo_item: 'etiqueta',
          accion: 'editar',
          nuevo_valor: { nombre: etiquetaFormateada },
          usuario: 'Emprendedor',
        });
        if (resp.exito) {
          setEstado((prev) =>
            prev ? { ...prev, etiquetas: [...prev.etiquetas, etiquetaFormateada] } : null
          );
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
        }
      } catch (e) {
        setErrorGlobal({ codigo: 'TAG_ERROR', mensaje: 'Error al agregar etiqueta.' });
      }
      return false;
    },
    [activeService, estado]
  );

  const eliminarEtiqueta = useCallback(
    async (etiqueta: string): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await activeService.modificarItem({
          item_id: 'etiquetas',
          tipo_item: 'etiqueta',
          accion: 'eliminar',
          nuevo_valor: { nombre: etiqueta },
          usuario: 'Emprendedor',
        });
        if (resp.exito) {
          setEstado((prev) =>
            prev ? { ...prev, etiquetas: prev.etiquetas.filter((e) => e !== etiqueta) } : null
          );
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
        }
      } catch (e) {
        setErrorGlobal({ codigo: 'TAG_ERROR', mensaje: 'Error al eliminar etiqueta.' });
      }
      return false;
    },
    [activeService, estado]
  );

  const editarDolor = useCallback(
    async (dolorId: string, nuevoNombre: string, etiquetas: string[], motivo?: string): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await activeService.modificarItem({
          item_id: dolorId,
          tipo_item: 'dolor',
          accion: 'editar',
          nuevo_valor: {
            nombre: nuevoNombre,
            etiquetas,
          },
          motivo,
          usuario: 'Emprendedor',
        });
        if (resp.exito) {
          setEstado((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              dolores: prev.dolores.map((d) =>
                d.id === dolorId ? { ...d, nombre: nuevoNombre, etiquetas } : d
              ),
            };
          });
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
        }
      } catch (e) {
        setErrorGlobal({ codigo: 'DOLOR_ERROR', mensaje: 'Error al editar el dolor.' });
      }
      return false;
    },
    [activeService, estado]
  );

  const decidirSugerencia = useCallback(
    async (sugerenciaId: string, decision: 'aceptar' | 'descartar'): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await activeService.decidirSugerencia({
          sugerencia_id: sugerenciaId,
          decision,
          usuario: 'Emprendedor',
        });
        if (resp.exito) {
          setEstado((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              sugerencias: prev.sugerencias.map((s) =>
                s.id === sugerenciaId
                  ? { ...s, estado: decision === 'aceptar' ? 'aceptada' : 'descartada' }
                  : s
              ),
            };
          });
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
        }
      } catch (e) {
        setErrorGlobal({ codigo: 'SUG_ERROR', mensaje: 'Error al procesar sugerencia.' });
      }
      return false;
    },
    [activeService, estado]
  );

  // Forzar estados de demo
  const forzarEtapa = useCallback((etapa: EtapaEmprendimiento) => {
    setEstado((prev) => (prev ? { ...prev, etapa } : null));
    mockServiceInstance.setEstadoDirecto({ etapa });
  }, []);

  const forzarAvisoMentor = useCallback((estadoNotif: EstadoNotificacionMentor) => {
    setEstado((prev) => (prev ? { ...prev, estadoNotificacionMentor: estadoNotif } : null));
    mockServiceInstance.setEstadoDirecto({ estadoNotificacionMentor: estadoNotif });
  }, []);

  const forzarVarianteMentor = useCallback((variante: 'sin_nota' | 'nota_normal' | 'con_ajuste_score') => {
    let nota: NotaMentor | null = null;
    if (variante === 'nota_normal') {
      nota = INITIAL_NOTA_MENTOR;
    } else if (variante === 'con_ajuste_score') {
      nota = NOTA_MENTOR_CON_AJUSTE;
    }
    setEstado((prev) => (prev ? { ...prev, notaMentor: nota } : null));
    mockServiceInstance.setEstadoDirecto({ notaMentor: nota });
  }, []);

  const resetDemoData = useCallback(() => {
    mockServiceInstance.resetData();
    setEstado(JSON.parse(JSON.stringify(INITIAL_ESTADO_EMPRENDIMIENTO)));
    setMensajesChat(JSON.parse(JSON.stringify(INITIAL_CHAT_MESSAGES)));
    setErrorGlobal(null);
    setSimConfigState(mockServiceInstance.getSimConfig());
  }, []);

  const value = {
    estado,
    mensajesChat,
    cargando,
    esperandoRespuestaChat,
    errorGlobal,
    limpiarError,
    reintentar,
    isDemoMode,
    setIsDemoMode,
    simConfig,
    actualizarSimConfig,
    enviarMensaje,
    omitirSolucion,
    confirmarResumen,
    agregarEtiqueta,
    eliminarEtiqueta,
    editarDolor,
    decidirSugerencia,
    forzarEtapa,
    forzarAvisoMentor,
    forzarVarianteMentor,
    resetDemoData,
  };

  return <EmprendimientoContext.Provider value={value}>{children}</EmprendimientoContext.Provider>;
};

export const useEmprendimiento = () => {
  const context = useContext(EmprendimientoContext);
  if (!context) {
    throw new Error('useEmprendimiento debe usarse dentro de un EmprendimientoProvider');
  }
  return context;
};
