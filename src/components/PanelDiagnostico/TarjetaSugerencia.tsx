import React, { useState } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import { Sparkles, Check, X } from 'lucide-react';

export const TarjetaSugerencia: React.FC = () => {
  const { estado, decidirSugerencia } = useEmprendimiento();
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  if (!estado) return null;

  const sugerencias = estado.sugerencias || [];

  const handleDecidir = async (id: string, decision: 'aceptar' | 'descartar') => {
    setProcesandoId(id);
    await decidirSugerencia(id, decision);
    setProcesandoId(null);
  };

  if (sugerencias.length === 0) {
    return (
      <article
        aria-label="Sugerencia de la IA"
        className="bg-[#FFFBEB] dark:bg-amber-950/20 border border-[#FDE68A] dark:border-amber-800/60 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] text-center"
      >
        <p className="text-[14px] text-amber-800 dark:text-amber-300">No hay sugerencias de la IA pendientes en este momento.</p>
      </article>
    );
  }

  return (
    <div className="space-y-4">
      {sugerencias.map((sug) => {
        const esPendiente = sug.estado === 'pendiente';

        return (
          <article
            key={sug.id}
            aria-label="Sugerencia de la IA"
            className="bg-[#FFFBEB] dark:bg-[#2A2110] border border-[#FDE68A] dark:border-[#5C4A1A] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-colors"
          >
            {/* Encabezado: círculo numérico 3 + icono de destello + Sugerencia de la IA + Insignia No comprobada */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center text-[13px] font-semibold">
                  3
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#FEF3C7]">
                    Sugerencia de la IA
                  </h3>
                </div>
              </div>

              {/* Insignia No comprobada o Estado */}
              {esPendiente ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-100 dark:bg-[#3D2E14] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-[#785C1F]">
                  No comprobada
                </span>
              ) : sug.estado === 'aceptada' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Aceptada</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                  <span>Descartada</span>
                </span>
              )}
            </div>

            {/* Hipótesis Lean como blockquote limpio con barra vertical en tono Tertiary #FFC043 */}
            <blockquote className="border-l-4 border-[#FFC043] pl-4 py-1 mb-4 text-[14.5px] text-amber-950 dark:text-[#FEF3C7] leading-[1.6]">
              Creemos que <strong>hacer preventas o anticipos antes de desarrollar software</strong> resolverá <strong>la falta de flujo de caja</strong> para <strong>PyMEs comerciales</strong>, y lo sabremos porque <strong>el 30% de los clientes potenciales</strong> aceptará anticipar <strong>el 50% de la orden</strong>.
            </blockquote>

            {/* Texto de la propuesta */}
            <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-[1.55] mb-5">
              Evaluá hacer <strong>preventas o anticipos</strong> antes de desarrollar software. Esto permitiría comprobar la demanda real con riesgo mínimo.
            </p>

            {/* Acciones: Aceptar y Descartar con foco en Executive Precision */}
            {esPendiente ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecidir(sug.id, 'aceptar')}
                  disabled={procesandoId === sug.id}
                  className="h-[40px] px-5 rounded-[10px] bg-[#78350F] hover:bg-[#5E2B0C] active:scale-98 text-white font-medium text-[14px] shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#FFC043]"
                >
                  <Check className="w-4 h-4" />
                  <span>Aceptar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecidir(sug.id, 'descartar')}
                  disabled={procesandoId === sug.id}
                  className="h-[40px] px-5 rounded-[10px] border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-[14px] shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
                >
                  <X className="w-4 h-4" />
                  <span>Descartar</span>
                </button>
              </div>
            ) : (
              <p className="text-[13px] text-[#64748B] dark:text-slate-400 italic">
                Decisión registrada. Se sincroniza con el diagnóstico consolidado.
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
};
