import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  EstadoEmprendimiento,
  EstadoNotificacionMentor,
  EtapaEmprendimiento,
  MensajeChat,
} from '../types';
import type { PerfilUsuario } from '../types/auth';
import { HttpEmprendimientoService } from '../services/emprendimientoService';
import { CONFIG } from '../config/constants';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const service = new HttpEmprendimientoService();

function crearEstadoInicialVacio(empId: string, usuario: PerfilUsuario | null): EstadoEmprendimiento {
  const nombreCorto = usuario?.nombreCompleto?.split(' ')[0] || 'Emprendedor';
  return {
    id: empId,
    nombreEmprendimiento: `Emprendimiento de ${nombreCorto}`,
    etapa: 'resumen_por_confirmar',
    etiquetas: [],
    dolores: [],
    sugerencias: [],
    notaMentor: null,
    estadoNotificacionMentor: 'no_iniciada',
    resumenEstado: {
      confirmado: 'Borrador en curso',
      queCambio: 'Comenzá a conversar con el asistente en el chat para iniciar tu diagnóstico.',
      esperaMentor: 'Pendiente: se avisará al mentor automáticamente al confirmar el resumen.',
      proximaAccion: 'Contale a la IA sobre tu negocio para identificar los dolores principales.',
    },
  };
}

/**
 * Busca si el usuario ya tiene un emprendimiento en Supabase; si no tiene,
 * le crea uno nuevo asociado a su cuenta para que su diagnóstico arranque limpio.
 */
async function resolverEmprendimientoId(usuario: PerfilUsuario | null): Promise<string> {
  if (!usuario) return CONFIG.EMPRENDIMIENTO_ID;

  if (isSupabaseConfigured && supabase && usuario.id) {
    try {
      // 1. Buscar si ya existe un emprendimiento asignado a este emprendedor
      const { data: existente } = await supabase
        .from('emprendimientos')
        .select('id, nombre')
        .eq('emprendedor_id', usuario.id)
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existente?.id) {
        return String(existente.id);
      }

      // 2. Si no tiene, registrar un nuevo emprendimiento para este usuario
      const nombreInicial = `Emprendimiento de ${usuario.nombreCompleto?.split(' ')[0] || 'Emprendedor'}`;
      const { data: nuevo, error: errInsert } = await supabase
        .from('emprendimientos')
        .insert({
          emprendedor_id: usuario.id,
          nombre: nombreInicial,
          fase_actual: 'fase_0',
          estado_revision: 'En diagnóstico',
        })
        .select('id')
        .maybeSingle();

      if (nuevo?.id) {
        return String(nuevo.id);
      }
      if (errInsert) {
        console.warn('[EmprendimientoContext] Aviso al registrar en Supabase:', errInsert.message);
      }
    } catch (err) {
      console.warn('[EmprendimientoContext] Error conectando con Supabase:', err);
    }
  }

  // Fallback si no está Supabase
  return usuario.id || CONFIG.EMPRENDIMIENTO_ID;
}

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
  const { usuario } = useAuth();
  const [estado, setEstado] = useState<EstadoEmprendimiento | null>(null);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [esperandoRespuestaChat, setEsperandoRespuestaChat] = useState<boolean>(false);
  const [errorGlobal, setErrorGlobal] = useState<{ codigo: string; mensaje: string } | null>(null);

  const cargarEstadoInicial = useCallback(async () => {
    setCargando(true);
    setErrorGlobal(null);
    try {
      const empId = await resolverEmprendimientoId(usuario);
      const resp = await service.obtenerEstado(empId);

      if (resp.exito && resp.datos) {
        // Si el webhook devolvió datos existentes para este ID
        setEstado(resp.datos);
      } else {
        // Si es un emprendimiento nuevo o el webhook no tiene dolores aún, arrancar 100% limpio
        setEstado(crearEstadoInicialVacio(empId, usuario));
      }
    } catch {
      const fallbackId = usuario?.id || CONFIG.EMPRENDIMIENTO_ID;
      setEstado(crearEstadoInicialVacio(fallbackId, usuario));
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarEstadoInicial();
  }, [cargarEstadoInicial]);

  // Recuperar historial del chat para este emprendimiento al cargar
  useEffect(() => {
    if (!estado?.id) return;
    const clave = `chat_historial_${estado.id}`;
    const guardados = localStorage.getItem(clave);
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMensajesChat(parsed);
        }
      } catch (e) {
        console.warn('Error leyendo historial de chat:', e);
      }
    }
  }, [estado?.id]);

  // Guardar mensajes automáticamente en localStorage cada vez que se envía o recibe uno
  useEffect(() => {
    if (!estado?.id || mensajesChat.length === 0) return;
    const clave = `chat_historial_${estado.id}`;
    localStorage.setItem(clave, JSON.stringify(mensajesChat));
  }, [mensajesChat, estado?.id]);

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
        usuario: usuario?.nombreCompleto || 'Emprendedor',
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
  }, [estado, usuario]);

  const confirmarResumen = useCallback(async (): Promise<boolean> => {
    if (!estado) return false;
    setErrorGlobal(null);
    try {
      const resp = await service.confirmarResumen({
        emprendimiento_id: estado.id,
        usuario: usuario?.nombreCompleto || 'Emprendedor',
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
  }, [estado, usuario]);

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
          usuario: usuario?.nombreCompleto || 'Emprendedor',
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
    [estado, usuario]
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
          usuario: usuario?.nombreCompleto || 'Emprendedor',
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
    [estado, usuario]
  );

  const editarDolor = useCallback(
    async (
      dolorId: string,
      nuevoNombre: string,
      etiquetas: string[],
      motivo?: string
    ): Promise<boolean> => {
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
          usuario: usuario?.nombreCompleto || 'Emprendedor',
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
        setErrorGlobal({ codigo: 'DOLOR_ERROR', mensaje: 'Error al modificar el dolor.' });
      }
      return false;
    },
    [estado, usuario]
  );

  const decidirSugerencia = useCallback(
    async (sugerenciaId: string, decision: 'aceptar' | 'descartar'): Promise<boolean> => {
      if (!estado) return false;
      setErrorGlobal(null);
      try {
        const resp = await service.decidirSugerencia({
          sugerencia_id: sugerenciaId,
          decision,
          usuario: usuario?.nombreCompleto || 'Emprendedor',
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
        setErrorGlobal({ codigo: 'SUGERENCIA_ERROR', mensaje: 'Error al registrar la decisión.' });
      }
      return false;
    },
    [estado, usuario]
  );

  return (
    <EmprendimientoContext.Provider
      value={{
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
      }}
    >
      {children}
    </EmprendimientoContext.Provider>
  );
};

export const useEmprendimiento = () => {
  const context = useContext(EmprendimientoContext);
  if (!context) {
    throw new Error('useEmprendimiento debe usarse dentro de un EmprendimientoProvider');
  }
  return context;
};
