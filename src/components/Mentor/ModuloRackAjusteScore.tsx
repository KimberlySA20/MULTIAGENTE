import React, { useState } from 'react';
import type { DolorRankingMentor } from '../../types/mentor';
import { Send, Eye, CheckCircle2 } from 'lucide-react';

interface ModuloRackAjusteScoreProps {
  dolores: DolorRankingMentor[];
  onEnviarSugerencia: (dolorId: string, imp: number, sat: number, motivo: string) => Promise<boolean>;
}

export const ModuloRackAjusteScore: React.FC<ModuloRackAjusteScoreProps> = ({
  dolores,
  onEnviarSugerencia,
}) => {
  const [dolorSeleccionado, setDolorSeleccionado] = useState<string>(dolores[0]?.id || '');
  const [importancia, setImportancia] = useState<number>(9);
  const [satisfaccion, setSatisfaccion] = useState<number>(4);
  const [motivo, setMotivo] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<boolean>(false);

  const caracteresMinimos = 20;
  const motivoValido = motivo.trim().length >= caracteresMinimos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoValido || enviando) return;

    setEnviando(true);
    const exito = await onEnviarSugerencia(
      dolorSeleccionado || dolores[0]?.id,
      importancia,
      satisfaccion,
      motivo.trim()
    );
    setEnviando(false);

    if (exito) {
      setMensajeExito(true);
      setMotivo('');
      setTimeout(() => setMensajeExito(false), 5000);
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-wider">
            RACK 2
          </span>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Sugerir ajuste de score
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Modo auditoría mentor
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
        No editás el número directamente: enviás una sugerencia con tu justificación. La IA recalcula, guarda el historial y avisa al emprendedor.
      </p>

      {mensajeExito && (
        <div className="mb-4 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Sugerencia enviada correctamente a la IA y registrada en el historial de auditoría.</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Fila de Campos Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          
          {/* Selector de Dolor */}
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Dolor
            </label>
            <select
              value={dolorSeleccionado}
              onChange={(e) => setDolorSeleccionado(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {dolores.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.dolor}
                </option>
              ))}
            </select>
          </div>

          {/* Importancia Sugerida */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Importancia sugerida
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={importancia}
              onChange={(e) => setImportancia(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Satisfacción Sugerida */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Satisfacción sugerida
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={satisfaccion}
              onChange={(e) => setSatisfaccion(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

        </div>

        {/* Motivo Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Motivo (obligatorio)
            </label>
            <span className={`text-[10px] font-medium ${motivoValido ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              {motivo.length} / mín. {caracteresMinimos} caracteres
            </span>
          </div>
          <textarea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Mencionó que ya usa una hoja de cálculo básica; la satisfacción actual parece algo mayor."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
          />
        </div>

        {/* Botón de Enviar */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={!motivoValido || enviando}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {enviando ? 'Enviando...' : 'Enviar sugerencia a la IA'}
          </button>
        </div>

      </form>

    </article>
  );
};
