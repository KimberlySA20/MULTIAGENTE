import React, { useState } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import { User, History, ChevronDown, ChevronUp } from 'lucide-react';

export const TarjetaMentor: React.FC = () => {
  const { estado } = useEmprendimiento();
  const [mostrarHistorialScore, setMostrarHistorialScore] = useState(false);

  const nota = estado?.notaMentor;

  if (!nota) {
    return (
      <article
        aria-label="Anotación del mentor (solo lectura)"
        className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-colors"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300 flex items-center justify-center text-[13px] font-semibold">
            4
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-[#2563EB]" />
            <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Anotación del mentor
            </h3>
          </div>
        </div>
        <p className="text-[14px] text-[#64748B] dark:text-slate-400 italic">
          Tu mentor todavía no dejó anotaciones.
        </p>
      </article>
    );
  }

  // Traducción estricta de decisiones según Regla de Negocio 7 (PROHIBIDO usar "Aprobado" o "Validado")
  const renderBadgeDecision = () => {
    if (!nota.decision) return null;

    if (nota.decision === 'avanzar_aei') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Recomendación de avanzar a AEI
        </span>
      );
    }
    if (nota.decision === 'nueva_prueba') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Nueva prueba
        </span>
      );
    }
    if (nota.decision === 'reformular') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Reformular
        </span>
      );
    }
    return null;
  };

  // Obtener iniciales del mentor
  const iniciales = (nota.mentorNombre || 'M')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      aria-label="Anotación del mentor (solo lectura)"
      className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-colors"
    >
      {/* Cabecera uniforme */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300 flex items-center justify-center text-[13px] font-semibold">
            4
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-[#2563EB]" />
            <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Anotación del mentor
            </h3>
          </div>
        </div>
        {renderBadgeDecision()}
      </div>

      {/* Avatar circular con iniciales, nombre en semibold y 'hace 2 min' en gris */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-[13px] flex items-center justify-center shadow-2xs">
          {iniciales}
        </div>
        <div>
          <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] block leading-tight">
            {nota.mentorNombre || 'Mentor'}
          </span>
          <span className="text-[12.5px] text-[#64748B] dark:text-slate-400">
            {nota.fechaRelativa}
          </span>
        </div>
      </div>

      {/* Texto de la anotación */}
      <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-[1.55] mb-4">
        Validá esto con <strong>5 clientes</strong> el próximo martes antes de seguir con el diseño técnico.
      </p>

      {/* Bloque claro de 3 líneas si hay ajuste de score (Regla 7) */}
      {nota.ajusteScore && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#4B7F84] dark:text-[#76A8AC]" />
              <span className="text-[13.5px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                Ajuste de puntuación sugerido por mentor (Solo lectura)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMostrarHistorialScore((prev) => !prev)}
              className="text-[12.5px] text-[#4B7F84] dark:text-[#76A8AC] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{mostrarHistorialScore ? 'Ocultar detalle' : 'Ver detalle'}</span>
              {mostrarHistorialScore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[13.5px] text-[#475569] dark:text-slate-300 mb-1">
            <strong>Dolor:</strong> {nota.ajusteScore.dolorNombre}
          </p>
          <p className="text-[13.5px] text-[#475569] dark:text-slate-300 mb-2.5">
            <strong>Motivo:</strong> &ldquo;{nota.ajusteScore.motivoMentor}&rdquo;
          </p>

          {/* Bloque con 3 líneas claras */}
          <div className="space-y-1.5 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-[13px]">
            <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[#64748B] dark:text-slate-400">1. Estimado por la IA:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Score {nota.ajusteScore.estimacionOriginalIA.score} (Imp. {nota.ajusteScore.estimacionOriginalIA.importancia} / Sat. {nota.ajusteScore.estimacionOriginalIA.satisfaccion})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
              <span className="text-amber-800 dark:text-amber-300">2. Sugerido por el mentor:</span>
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                Imp. {nota.ajusteScore.sugerenciaMentor.importancia} / Sat. {nota.ajusteScore.sugerenciaMentor.satisfaccion} (Ajuste cualitativo)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50">
              <span className="text-[#1D4ED8] dark:text-blue-300 font-medium">3. Valor final recalculado:</span>
              <span className="font-bold text-[#1D4ED8] dark:text-blue-200">
                Score {nota.ajusteScore.recalculoFinalIA.score} · {nota.ajusteScore.recalculoFinalIA.nivel}
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
