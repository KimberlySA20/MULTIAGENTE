import React, { useState } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import {
  Sliders,
  X,
  RotateCcw,
  Wifi,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const PanelControlDemo: React.FC = () => {
  const {
    isDemoMode,
    setIsDemoMode,
    simConfig,
    actualizarSimConfig,
    forzarEtapa,
    forzarAvisoMentor,
    forzarVarianteMentor,
    resetDemoData,
    estado,
  } = useEmprendimiento();

  const [panelAbierto, setPanelAbierto] = useState(false);

  // Solo se muestra si el modo demo está activo o disponible para activar
  return (
    <aside
      aria-label="Panel de control para pruebas de demostración"
      className="fixed bottom-4 right-4 z-40"
    >
      {!panelAbierto ? (
        <button
          type="button"
          onClick={() => setPanelAbierto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700 dark:border-blue-500"
          title="Abrir panel de control de pruebas y simulación"
        >
          <Sliders className="w-4 h-4 text-amber-400 dark:text-amber-300" />
          <span>Panel Demo & QA</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-4 w-80 sm:w-96 text-xs max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
          {/* Cabecera del Panel de Control */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-100">
                Panel de Control Demo (QA)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setPanelAbierto(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Cerrar panel de control demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Permite forzar condiciones de red, etapas del flujo y variantes de datos sin necesidad de backend real.
          </p>

          <div className="space-y-4">
            {/* Interruptor maestro de Modo Demo */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Modo Demostración activo
              </span>
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.value === 'true' || e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Simulación de condiciones de Red y Errores */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Simulación de Red & Errores
              </span>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Latencia lenta (2.5s)</span>
                </span>
                <input
                  type="checkbox"
                  checked={simConfig.latenciaLenta}
                  onChange={(e) => actualizarSimConfig({ latenciaLenta: e.target.checked })}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-rose-500" />
                  <span>Forzar Error de Red</span>
                </span>
                <input
                  type="checkbox"
                  checked={simConfig.simularErrorRed}
                  onChange={(e) => actualizarSimConfig({ simularErrorRed: e.target.checked })}
                  className="rounded text-rose-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Forzar Error de Permisos (403)</span>
                </span>
                <input
                  type="checkbox"
                  checked={simConfig.simularErrorPermiso}
                  onChange={(e) => actualizarSimConfig({ simularErrorPermiso: e.target.checked })}
                  className="rounded text-amber-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Alternar Etapa del Emprendimiento (Flujo 2b) */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Etapa del Emprendimiento
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => forzarEtapa('resumen_por_confirmar')}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                    estado?.etapa === 'resumen_por_confirmar'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  resumen_por_confirmar
                </button>
                <button
                  type="button"
                  onClick={() => forzarEtapa('resumen_confirmado')}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                    estado?.etapa === 'resumen_confirmado'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  resumen_confirmado
                </button>
              </div>
            </div>

            {/* Estado del Aviso al Mentor (Flujo 5a) */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Aviso al Mentor (Flujo 5a)
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => forzarAvisoMentor('en_progreso')}
                  className="px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Avisando...
                </button>
                <button
                  type="button"
                  onClick={() => forzarAvisoMentor('confirmada')}
                  className="px-1.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium cursor-pointer"
                >
                  Enviado
                </button>
                <button
                  type="button"
                  onClick={() => forzarAvisoMentor('fallida')}
                  className="px-1.5 py-1 rounded bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-[10px] text-amber-800 dark:text-amber-300 font-medium cursor-pointer"
                >
                  Pendiente/Fallo
                </button>
              </div>
            </div>

            {/* Variantes de Anotación del Mentor */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Anotaciones del Mentor
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => forzarVarianteMentor('sin_nota')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  1. Sin anotaciones aún
                </button>
                <button
                  type="button"
                  onClick={() => forzarVarianteMentor('nota_normal')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  2. Anotación simple (mockup)
                </button>
                <button
                  type="button"
                  onClick={() => forzarVarianteMentor('con_ajuste_score')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                >
                  3. Con propuesta de ajuste de score
                </button>
              </div>
            </div>

            {/* Botón de reinicio general */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={resetDemoData}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer datos originales del demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
