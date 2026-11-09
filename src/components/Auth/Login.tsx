import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, UserCheck, ArrowRight, Sun, Moon, AlertCircle } from 'lucide-react';

interface LoginProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Login: React.FC<LoginProps> = ({ isDarkMode, toggleDarkMode }) => {
  const {
    usuario,
    cargando,
    error,
    iniciarSesionConGoogle,
    iniciarModoDemo,
    limpiarError,
  } = useAuth();

  const [iniciandoOAuth, setIniciandoOAuth] = useState(false);

  // Redirección si ya está autenticado
  if (!cargando && usuario) {
    return <Navigate to={usuario.rol === 'mentor' ? '/mentor' : '/diagnostico'} replace />;
  }

  const handleGoogleLogin = async () => {
    setIniciandoOAuth(true);
    await iniciarSesionConGoogle();
    setIniciandoOAuth(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors relative selection:bg-teal-500 selection:text-white">
      {/* Botón superior de Dark Mode */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">PyME Flow</span>
            <span className="text-[12px] block text-slate-500 dark:text-slate-400 font-medium">Plataforma Multiagente</span>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </header>

      {/* Contenedor central */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acceso Seguro
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Ingresá con tu cuenta de Google. El sistema detectará automáticamente si sos Emprendedor o Mentor.
            </p>
          </div>

          {/* Notificación de Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                <button
                  onClick={limpiarError}
                  className="mt-2 underline font-semibold text-amber-800 dark:text-amber-300 hover:opacity-80 block"
                >
                  Descartar aviso
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal: Continuar con Google */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={iniciandoOAuth}
              className="w-full flex items-center justify-center gap-3.5 px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{iniciandoOAuth ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>
          </div>

          {/* Separador con leyenda */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium tracking-wider">
                Entornos de Prueba
              </span>
            </div>
          </div>

          {/* Acceso Rápido Demo (útil si aún no configuran las credenciales en .env) */}
          <div className="space-y-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
              ¿Querés probar las vistas directamente sin configurar Supabase?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => iniciarModoDemo('mentor')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Rol Mentor
              </button>
              <button
                onClick={() => iniciarModoDemo('emprendedor')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-semibold text-xs hover:bg-teal-100/60 dark:hover:bg-teal-900/40 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Rol Emprendedor
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Al ingresar aceptás las normas metodológicas de la incubadora y confidencialidad de datos.
          </p>
        </div>
      </main>
    </div>
  );
};
