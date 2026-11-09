import React from 'react';
import type { DolorRankingMentor } from '../../types/mentor';
import { Sparkles, ExternalLink } from 'lucide-react';

interface TablaRankingMentorProps {
  nombreEmprendimiento: string;
  dolores: DolorRankingMentor[];
  onAbrirChat: (dolor: DolorRankingMentor) => void;
}

export const TablaRankingMentor: React.FC<TablaRankingMentorProps> = ({
  nombreEmprendimiento,
  dolores,
  onAbrirChat,
}) => {
  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {nombreEmprendimiento} — Ranking de dolores
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Calculado por la IA
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
        Importancia y satisfacción estimadas a partir de la conversación con el emprendedor.
      </p>

      {/* Tabla Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Dolor</th>
              <th className="pb-3 px-3 font-semibold text-center">Imp.</th>
              <th className="pb-3 px-3 font-semibold text-center">Sat.</th>
              <th className="pb-3 px-3 font-semibold text-center">Score</th>
              <th className="pb-3 px-3 font-semibold text-center">Nivel</th>
              <th className="pb-3 pl-4 font-semibold">Respaldo en el chat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {dolores.map((d, index) => {
              const esAlto = d.nivel === 'Alto';
              return (
                <tr key={d.id || index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Dolor */}
                  <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          esAlto ? 'bg-teal-500' : 'bg-amber-400'
                        }`}
                      />
                      <span>{d.dolor}</span>
                    </div>
                  </td>

                  {/* Imp */}
                  <td className="py-4 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                    {d.importancia}
                  </td>

                  {/* Sat */}
                  <td className="py-4 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                    {d.satisfaccion}
                  </td>

                  {/* Score */}
                  <td className="py-4 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        esAlto
                          ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {d.score}
                    </span>
                  </td>

                  {/* Nivel */}
                  <td className="py-4 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        esAlto
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {d.nivel}
                    </span>
                  </td>

                  {/* Respaldo en el chat */}
                  <td className="py-4 pl-4 text-slate-600 dark:text-slate-400 italic">
                    <div className="flex items-center justify-between gap-3">
                      <span className="line-clamp-1">{d.citaChat}</span>
                      <button
                        onClick={() => onAbrirChat(d)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 shrink-0 hover:underline cursor-pointer"
                      >
                        Ver chat
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </article>
  );
};
