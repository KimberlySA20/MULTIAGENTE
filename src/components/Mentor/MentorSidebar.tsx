import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck2,
  GitFork,
  BarChart3,
  CalendarCheck2,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MentorSidebarProps {
  seccionActiva: string;
  setSeccionActiva: (s: string) => void;
}

export const MentorSidebar: React.FC<MentorSidebarProps> = ({ seccionActiva, setSeccionActiva }) => {
  const { usuario } = useAuth();

  const navItems = [
    { id: 'diagnostico', nombre: 'Diagnóstico', icono: FileCheck2 },
    { id: 'hoja_ruta', nombre: 'Hoja de Ruta', icono: GitFork },
    { id: 'metricas_aei', nombre: 'Métricas & AEI', icono: BarChart3 },
    { id: 'sesiones', nombre: 'Sesiones de Mentoría', icono: CalendarCheck2 },
    { id: 'cartera', nombre: 'Cartera PyMEx', icono: Briefcase },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors">
      
      {/* Entorno Activo */}
      <div className="mb-6 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Entorno
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          DEMO
        </span>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icono = item.icono;
          const esActivo = seccionActiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSeccionActiva(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                esActivo
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/50 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icono className={`w-4.5 h-4.5 ${esActivo ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                <span>{item.nombre}</span>
              </div>
              {esActivo && <ChevronRight className="w-4 h-4 text-teal-500" />}
            </button>
          );
        })}
      </nav>

      {/* Pie del Sidebar: Mentor Activo */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto flex items-center gap-3">
        {usuario?.avatarUrl ? (
          <img
            src={usuario.avatarUrl}
            alt={usuario.nombreCompleto}
            className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center">
            {usuario?.nombreCompleto?.slice(0, 2).toUpperCase() || 'CM'}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {usuario?.nombreCompleto || 'Dr. Carlos Mendez'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {usuario?.titulo || 'Mentor Senior'}
          </p>
        </div>
      </div>

    </aside>
  );
};
