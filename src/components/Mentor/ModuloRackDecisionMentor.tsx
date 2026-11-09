import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, AlertTriangle, Check } from 'lucide-react';

interface ModuloRackDecisionMentorProps {
  onRegistrarDecision: (instruccion: string, decision: 'avanzar_aei' | 'nueva_prueba' | 'reformular') => Promise<boolean>;
}

export const ModuloRackDecisionMentor: React.FC<ModuloRackDecisionMentorProps> = ({
  onRegistrarDecision,
}) => {
  const [instruccion, setInstruccion] = useState<string>('');
  const [procesando, setProcesando] = useState<boolean>(false);
  const [decisionGuardada, setDecisionGuardada] = useState<string | null>(null);

  const handleDecision = async (tipo: 'avanzar_aei' | 'nueva_prueba' | 'reformular') => {
    if (procesando) return;
    setProcesando(true);
    const exito = await onRegistrarDecision(instruccion.trim(), tipo);
    setProcesando(false);

    if (exito) {
      setDecisionGuardada(tipo);
      setTimeout(() => setDecisionGuardada(null), 5000);
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-wider">
            RACK 4
          </span>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Comentario y decisión del mentor
          </h3>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          Hito de validación
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
        Registrá tus observaciones y definí la continuidad metodológica hacia la siguiente fase.
      </p>

      {/* Feedback de decisión */}
      {decisionGuardada && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Decisión y recomendación metodológica registradas. El emprendedor ya puede visualizarlas en su panel.</span>
        </div>
      )}

      {/* Textarea Instrucción */}
      <div className="mb-5">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Instrucción metodológica para el fundador
        </label>
        <textarea
          rows={3}
          value={instruccion}
          onChange={(e) => setInstruccion(e.target.value)}
          placeholder="Validá esto con 5 clientes el próximo martes antes de seguir con el diseño técnico."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Opción 1: Recomendar avance a AEI */}
        <button
          type="button"
          disabled={procesando}
          onClick={() => handleDecision('avanzar_aei')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Aprobar avance a AEI
        </button>

        {/* Opción 2: Solicitar nueva prueba */}
        <button
          type="button"
          disabled={procesando}
          onClick={() => handleDecision('nueva_prueba')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Solicitar nueva prueba
        </button>

        {/* Opción 3: Reformular el enfoque */}
        <button
          type="button"
          disabled={procesando}
          onClick={() => handleDecision('reformular')}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold text-xs transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Reformular el enfoque
        </button>

      </div>

    </article>
  );
};
