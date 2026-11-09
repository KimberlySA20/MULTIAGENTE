import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { PerfilUsuario, RolUsuario } from '../types/auth';

interface AuthContextValue {
  usuario: PerfilUsuario | null;
  cargando: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
  iniciarSesionConGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  iniciarModoDemo: (rol: RolUsuario) => void;
  limpiarError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USUARIOS_DEMO: Record<RolUsuario, PerfilUsuario> = {
  mentor: {
    id: 'usr-mentor-01',
    email: 'carlos.mendez@pymeflow.org',
    nombreCompleto: 'Dr. Carlos Mendez',
    rol: 'mentor',
    titulo: 'Mentor Senior',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  emprendedor: {
    id: 'usr-emp-01',
    email: 'martin.berardi@pymeflow.org',
    nombreCompleto: 'Martín Berardi',
    rol: 'emprendedor',
    titulo: 'Fundador · PyME Flow Soluciones S.A.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(() => {
    const sesionGuardada = localStorage.getItem('pyme_auth_user');
    if (sesionGuardada) {
      try {
        return JSON.parse(sesionGuardada) as PerfilUsuario;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar usuario con localStorage
  const guardarUsuario = (u: PerfilUsuario | null) => {
    setUsuario(u);
    if (u) {
      localStorage.setItem('pyme_auth_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('pyme_auth_user');
    }
  };

  const cargarPerfil = useCallback(async (userId: string, email?: string) => {
    if (!supabase) return;
    try {
      const { data, error: profileError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !data) {
        // Si aún no existe fila en perfiles, inferir rol o asignar emprendedor por defecto
        const nuevoPerfil: PerfilUsuario = {
          id: userId,
          email: email || '',
          nombreCompleto: email?.split('@')[0] || 'Usuario',
          rol: 'emprendedor',
          titulo: 'Emprendedor',
        };
        guardarUsuario(nuevoPerfil);
        return;
      }

      const perfil: PerfilUsuario = {
        id: data.id,
        email: data.email,
        nombreCompleto: data.nombre_completo || data.email,
        avatarUrl: data.avatar_url,
        rol: data.rol as RolUsuario,
        titulo: data.titulo || (data.rol === 'mentor' ? 'Mentor' : 'Fundador'),
      };
      guardarUsuario(perfil);
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
    }
  }, []);

  // Carga inicial y listener de sesión de Supabase
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      setCargando(false);
      return;
    }

    const obtenerSesion = async () => {
      try {
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          await cargarPerfil(session.user.id, session.user.email);
        }
      } catch (err: any) {
        console.error('Error al verificar sesión de Supabase:', err);
      } finally {
        setCargando(false);
      }
    };

    obtenerSesion();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await cargarPerfil(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        guardarUsuario(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  const iniciarSesionConGoogle = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      setError(
        'Supabase no está configurado en .env (faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY). Podés usar el Acceso Rápido Demo abajo para probar las vistas.'
      );
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google.');
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error cerrando sesión en Supabase:', err);
    } finally {
      guardarUsuario(null);
    }
  }, []);

  const iniciarModoDemo = useCallback((rol: RolUsuario) => {
    guardarUsuario(USUARIOS_DEMO[rol]);
    setError(null);
  }, []);

  const limpiarError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        error,
        isSupabaseConfigured,
        iniciarSesionConGoogle,
        cerrarSesion,
        iniciarModoDemo,
        limpiarError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
