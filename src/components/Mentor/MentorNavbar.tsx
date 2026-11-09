import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Sun, Moon, Bell, HelpCircle, LogOut } from 'lucide-react';

interface MentorNavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const MentorNavbar: React.FC<MentorNavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white">
                PyME Flow
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Plataforma Mentor
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Metodológico central */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
            Flujo Metodológico:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500 text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Fase 0 · Diagnóstico
            </span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-400 dark:text-slate-500">AEI</span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-400 dark:text-slate-500">MVP</span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-400 dark:text-slate-500">APM</span>
          </div>
        </div>

        {/* Acciones y Perfil */}
        <div className="flex items-center gap-3">
          {/* Badge Auditor */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            Vista: Mentor <span className="font-bold">AUDITOR</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notificaciones */}
          <button
            aria-label="Notificaciones"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
          </button>

          {/* Ayuda */}
          <button
            aria-label="Ayuda metodológica"
            className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Avatar y Cerrar sesión */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {usuario?.avatarUrl ? (
              <img
                src={usuario.avatarUrl}
                alt={usuario.nombreCompleto}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                {usuario?.nombreCompleto?.slice(0, 2).toUpperCase() || 'ME'}
              </div>
            )}
            <button
              onClick={cerrarSesion}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
