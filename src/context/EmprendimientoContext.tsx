import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  EstadoEmprendimiento,
  EstadoNotificacionMentor,
  EtapaEmprendimiento,
  MensajeChat,
} from '../types';
import { HttpEmprendimientoService } from '../services/emprendimientoService';
import { CONFIG } from '../config/constants';

const service = new HttpEmprendimientoService();

/**
 * Estado vacío que se usa cuando el backend aún no está disponible.
 * La app arranca sin errores y se actualiza en cuanto el endpoint responda.
 */
const ESTADO_VACIO: EstadoEmprendimiento = {
  id: CONFIG.EMPRENDIMIENTO_ID,
  nombreEmprendimiento: '',
  etapa: 'resumen_por_confirmar',
  etiquetas: [],
  dolores: [],
  sugerencias: [],
  notaMentor: null,
  estadoNotificacionMentor: 'no_iniciada',
  resumenEstado: {
    confirmado: '',
    queCambio: '',
    esperaMentor: '',
    proximaAccion: '',
  },
};

/** Errores de red/resolución DNS → el backend aún no está conectado */
const esErrorDeConexion = (codigo: string) =>
  ['NETWORK_ERROR', 'ERR_NAME_NOT_RESOLVED', 'ENOTFOUND'].includes(codigo);

interface EmprendimientoContextValue {
  estado: EstadoEmprendimiento | null;
  mensajesChat: MensajeChat[];
  cargando: boolean;
  esperandoRespuestaChat: boolean;
  errorGlobal: { codigo: string; mensaje: string } | null;
  limpiarError: () => void;
  reintentar: () => Promise<void>;

  // Acciones de negocio
  enviarMensaje: (texto: string) => Promise<boolean>;
  omitirSolucion: () => Promise<boolean>;
  confirmarResumen: () => Promise<boolean>;
  agregarEtiqueta: (etiqueta: string) => Promise<boolean>;
  eliminarEtiqueta: (etiqueta: string) => Promise<boolean>;
  editarDolor: (dolorId: string, nuevoNombre: string, etiquetas: string[], motivo?: string) => Promise<boolean>;
  decidirSugerencia: (sugerenciaId: string, decision: 'aceptar' | 'descartar') => Promise<boolean>;
}

const EmprendimientoContext = createContext<EmprendimientoContextValue | null>(null);

export const EmprendimientoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estado, setEstado] = useState<EstadoEmprendimiento | null>(null);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [esperandoRespuestaChat, setEsperandoRespuestaChat] = useState<boolean>(false);
  const [errorGlobal, setErrorGlobal] = useState<{ codigo: string; mensaje: string } | null>(null);

  const cargarEstadoInicial = useCallback(async () => {
    setCargando(true);
    setErrorGlobal(null);
    try {
      const resp = await service.obtenerEstado(CONFIG.EMPRENDIMIENTO_ID);
      if (resp.exito && resp.datos) {
        setEstado(resp.datos);
      } else if (resp.error) {
        if (esErrorDeConexion(resp.error.codigo)) {
          // Backend aún no disponible → arrancar con estado vacío sin mostrar error
          setEstado(ESTADO_VACIO);
        } else {
          // El panel no pudo leer el estado, pero el chat no debe quedar bloqueado:
          // se muestra el error y se arranca con el estado vacío.
          setErrorGlobal(resp.error);
          setEstado(ESTADO_VACIO);
        }
      }
    } catch {
      // Error inesperado → estado vacío silencioso
      setEstado(ESTADO_VACIO);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadoInicial();
  }, [cargarEstadoInicial]);

  // Polling para estado del aviso al mentor
  useEffect(() => {
    if (!estado || cargando) return;
    if (estado.estadoNotificacionMentor !== 'en_progreso') return;

    const intervalId = setInterval(async () => {
      const resp = await service.obtenerEstado(estado.id);
      if (resp.exito && resp.datos) {
        setEstado(resp.datos);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [estado, cargando]);

  const limpiarError = useCallback(() => setErrorGlobal(null), []);

  const reintentar = useCallback(async () => {
    await cargarEstadoInicial();
  }, [cargarEstadoInicial]);

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
        const resp = await service.enviarMensajeChat(texto, estado.id);
        if (resp.exito && resp.datos) {
          setMensajesChat((prev) => [...prev, resp.datos!.respuestaAsistente]);
          // Refrescar estado para reflejar posibles dolores detectados por el agente
          const estadoActualizado = await service.obtenerEstado(estado.id);
          if (estadoActualizado.exito && estadoActualizado.datos) {
            setEstado(estadoActualizado.datos);
          }
          // El subflujo que clasifica los dolores corre en segundo plano (async): puede terminar
          // de guardar unos segundos después de la respuesta del chat, así que se vuelve a leer.
          [5000, 12000].forEach((ms) =>
            setTimeout(async () => {
              const r = await service.obtenerEstado(estado.id);
              if (r.exito && r.datos) setEstado(r.datos);
            }, ms)
          );
          return true;
        } else if (resp.error) {
          setErrorGlobal(resp.error);
        }
      } catch {
        setErrorGlobal({
          codigo: 'CHAT_ERROR',
          mensaje: 'No se pudo enviar el mensaje. Conservamos tu texto para reintentar.',
        });
      } finally {
        setEsperandoRespuestaChat(false);
      }
      return false;
    },
    [estado, esperandoRespuestaChat]
  );

  const omitirSolucion = useCallback(async (): Promise<boolean> => {
    if (!estado) return false;
    setErrorGlobal(null);
    try {
      const resp = await service.omitirSolucion({
        emprendimiento_id: estado.id,
        usuario: 'Emprendedor',
      });
      if (resp.exito) {
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
    } catch {
      setErrorGlobal({ codigo: 'OMITIR_ERROR', mensaje: 'Error al registrar la omisión.' });
    }
    return false;
  }, [estado]);

  const confirmarResumen = useCallback(async (): Promise<boolean> => {
    if (!estado) return false;
    setErrorGlobal(null);
    try {
      const resp = await service.confirmarResumen({
        emprendimiento_id: estado.id,
        usuario: 'Emprendedor',
      });
      if (resp.exito) {
        setEstado((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            etapa: 'resumen_confirmado' as EtapaEmprendimiento,
            estadoNotificacionMentor: 'en_progreso' as EstadoNotificacionMentor,
            fechaConfirmacionResumen: resp.datos?.confirmado_en,
            dolores: prev.dolores.map((d) => ({ ...d, estado: 'confirmado' })),
          };
        });
        return true;
      } else if (resp.error) {
        setErrorGlobal(resp.error);
      }
    } catch {
      setErrorGlobal({ codigo: 'CONFIRMACION_ERROR', mensaje: 'Error al confirmar el resumen.' });
    }
    return false;
  }, [estado]);

  const agregarEtiqueta = useCallback(
    async (etiqueta: string): Promise<boolean> => {
      if (!estado || !etiqueta.trim()) return false;
      const etiquetaFormateada = etiqueta.startsWith('#') ? etiqueta : `#${etiqueta}`;
      if (estado.etiquetas.includes(etiquetaFormateada)) return true;
      setErrorGlobal(null);
      try {
        const resp = await service.modificarItem({
          emprendimiento_id: estado.id,
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
      } catch {
        setErrorGlobal({ codigo: 'TAG_ERROR', mensaje: 'Error al agregar etiqueta.' });
      }
      return false;
    },
    [estado]
  );

  const eliminarEtiqueta = useCallback(
    async (etiqueta: string): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await service.modificarItem({
          emprendimiento_id: estado.id,
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
      } catch {
        setErrorGlobal({ codigo: 'TAG_ERROR', mensaje: 'Error al eliminar etiqueta.' });
      }
      return false;
    },
    [estado]
  );

  const editarDolor = useCallback(
    async (dolorId: string, nuevoNombre: string, etiquetas: string[], motivo?: string): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await service.modificarItem({
          emprendimiento_id: estado.id,
          item_id: dolorId,
          tipo_item: 'dolor',
          accion: 'editar',
          nuevo_valor: { nombre: nuevoNombre, etiquetas },
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
      } catch {
        setErrorGlobal({ codigo: 'DOLOR_ERROR', mensaje: 'Error al editar el dolor.' });
      }
      return false;
    },
    [estado]
  );

  const decidirSugerencia = useCallback(
    async (sugerenciaId: string, decision: 'aceptar' | 'descartar'): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await service.decidirSugerencia({
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
      } catch {
        setErrorGlobal({ codigo: 'SUG_ERROR', mensaje: 'Error al procesar sugerencia.' });
      }
      return false;
    },
    [estado]
  );

  const value: EmprendimientoContextValue = {
    estado,
    mensajesChat,
    cargando,
    esperandoRespuestaChat,
    errorGlobal,
    limpiarError,
    reintentar,
    enviarMensaje,
    omitirSolucion,
    confirmarResumen,
    agregarEtiqueta,
    eliminarEtiqueta,
    editarDolor,
    decidirSugerencia,
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
