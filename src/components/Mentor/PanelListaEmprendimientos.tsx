import React from 'react';
import type { EmprendimientoResumenMentor } from '../../types/mentor';
import { SlidersHorizontal, Plus, User } from 'lucide-react';

interface PanelListaEmprendimientosProps {
  casos: EmprendimientoResumenMentor[];
  casoSeleccionadoId: string;
  onSeleccionarCaso: (id: string) => void;
}

export const PanelListaEmprendimientos: React.FC<PanelListaEmprendimientosProps> = ({
  casos,
  casoSeleccionadoId,
  onSeleccionarCaso,
}) => {
  const casoActivo = casos.find((c) => c.id === casoSeleccionadoId) || casos[0];

  return (
    <div className="space-y-6">
      
      {/* Contenedor de Casos Asignados */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Emprendimientos asignados
            </h3>
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center">
              {casos.length}
            </span>
          </div>
          <button
            aria-label="Filtrar emprendimientos"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Casos */}
        <div className="space-y-3">
          {casos.map((caso) => {
            const esSeleccionado = caso.id === casoSeleccionadoId;
            const esAlto = caso.nivelScore === 'Alto';

            return (
              <div
                key={caso.id}
                onClick={() => onSeleccionarCaso(caso.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  esSeleccionado
                    ? 'border-teal-500/80 bg-teal-50/40 dark:bg-teal-950/30 dark:border-teal-500/60 shadow-xs ring-1 ring-teal-500/30'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Primera línea: Título y Badges */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {caso.nombre}
                    </span>
                    {caso.estadoBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {caso.estadoBadge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                      esAlto
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    Score {caso.score} · {caso.nivelScore}
                  </span>
                </div>

                {/* Subtítulo: Dolor clave */}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2 line-clamp-1">
                  {caso.dolorPrincipal}
                </p>

                {/* Actividad y estado */}
                {caso.cambiosNota && (
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    {caso.cambiosNota}
                  </p>
                )}

                {/* Progreso */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{caso.progresoFase}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {caso.porcentajeListo}% listo
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Asignar Caso */}
        <button
          className="mt-4 w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Asignar nuevo caso a tutela
        </button>
      </section>

      {/* FICHA OPERATIVA */}
      {casoActivo?.fichaOperativa && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Ficha Operativa
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Sector: {casoActivo.fichaOperativa.sector}
            </span>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
              {casoActivo.fichaOperativa.razonSocial.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {casoActivo.fichaOperativa.razonSocial}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <User className="w-3 h-3" />
                Fundador: {casoActivo.fichaOperativa.fundador} · {casoActivo.fichaOperativa.colaboradores} colaboradores
              </p>
            </div>
          </div>

          <blockquote className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
            {casoActivo.fichaOperativa.resumenModelo}
          </blockquote>
        </section>
      )}

    </div>
  );
};
