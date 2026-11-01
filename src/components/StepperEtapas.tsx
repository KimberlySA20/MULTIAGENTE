import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface StepperEtapasProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const StepperEtapas: React.FC<StepperEtapasProps> = ({ isDarkMode, toggleDarkMode }) => {

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Lado izquierdo: Isotipo con paleta Executive Precision */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4B7F84] text-[#10D8E4] flex items-center justify-center shadow-xs">
            {/* Ícono de gráfica ascendente */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h1 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
            Plataforma Emprendedores
          </h1>
        </div>

        {/* Lado derecho: Rótulo Vista: Emprendedor, toggle sol/luna y botón avatar redondo */}
        <div className="flex items-center gap-3.5 text-xs sm:text-sm">

          {/* Rótulo de vista del usuario */}
          <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13.5px]">
            Vista: <span className="text-slate-700 dark:text-slate-200 font-medium">Emprendedor</span>
          </div>

          {/* Selector accesible de tema claro/oscuro con interruptor visual */}
          <button
            onClick={toggleDarkMode}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={`Alternar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
                <span className="text-[12px] font-medium hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#4B7F84]" />
                <span className="text-[12px] font-medium hidden sm:inline">Oscuro</span>
              </>
            )}
          </button>

          {/* Avatar circular en tono Secondary #4B7F84 de Executive Precision */}
          <div
            className="w-8 h-8 rounded-full bg-[#4B7F84] hover:bg-[#3D686C] text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
            title="Perfil del emprendedor"
            aria-label="Perfil de usuario"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
