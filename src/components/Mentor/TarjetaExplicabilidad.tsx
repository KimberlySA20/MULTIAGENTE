import React from 'react';
import type { ExplicabilidadSHAP } from '../../types/mentor';
import { Compass, ShieldCheck } from 'lucide-react';

interface TarjetaExplicabilidadProps {
  explicabilidad: ExplicabilidadSHAP;
}

export const TarjetaExplicabilidad: React.FC<TarjetaExplicabilidadProps> = ({ explicabilidad }) => {
  return (
    <article className="bg-teal-50/50 dark:bg-slate-900/80 border border-teal-200/80 dark:border-teal-900/60 rounded-2xl p-5 shadow-xs transition-colors">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Compass className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-teal-950 dark:text-teal-200">
            Explicabilidad (SHAP/LIME)
          </h4>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
          {explicabilidad.formula || 'Fórmula oportunidad = imp + (imp - sat)'}
        </span>
      </div>

      {/* Texto Explicativo */}
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
        {explicabilidad.descripcion}
      </p>

      {/* Indicadores Visuales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-teal-200/60 dark:border-slate-800 text-xs">
        
        {/* Importancia */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <span>Importancia</span>
            <span className="text-teal-700 dark:text-teal-400 font-bold">{explicabilidad.impactoImportancia}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 dark:bg-teal-400 h-full rounded-full w-[65%]" />
          </div>
        </div>

        {/* Brecha de Satisfacción */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <span>Brecha de satisfacción</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">{explicabilidad.brechaSatisfaccion}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[85%]" />
          </div>
        </div>

        {/* Confianza */}
        <div className="flex items-center gap-2 sm:justify-end text-slate-700 dark:text-slate-300 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Confianza del modelo: {explicabilidad.confianzaModelo}%</span>
        </div>

      </div>

    </article>
  );
};
