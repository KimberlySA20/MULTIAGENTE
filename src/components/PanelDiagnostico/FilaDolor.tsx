import React from 'react';
import type { Dolor } from '../../types';
import { Edit2, AlertCircle } from 'lucide-react';

interface FilaDolorProps {
  dolor: Dolor;
  posicion: number;
  esPrimero: boolean;
  onEditar: (dolor: Dolor) => void;
}

export const FilaDolor: React.FC<FilaDolorProps> = ({
  dolor,
  posicion,
  esPrimero,
  onEditar,
}) => {
  const tienePuntuacion = dolor.score !== null && dolor.importancia !== null && dolor.satisfaccion !== null;

  // Pastilla de nivel suave con alto contraste AA en modo claro y oscuro
  const renderNivelBadge = () => {
    if (!dolor.nivel) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300">
          Pendiente
        </span>
      );
    }
    if (dolor.nivel === 'Alto') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-700">
          Alto
        </span>
      );
    }
    if (dolor.nivel === 'Medio') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
          Medio
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-200 border border-slate-200 dark:border-slate-700">
        Bajo
      </span>
    );
  };

  // Porcentaje para la barra horizontal fina de solo lectura sobre 20
  const porcentajeScore = dolor.score ? Math.min(Math.round((dolor.score / 20) * 100), 100) : 0;

  return (
    <div
      className={`group relative rounded-[14px] p-4 transition-all duration-150 ${
        esPrimero
          ? 'border-2 border-[#4B7F84]/50 bg-[#4B7F84]/5 dark:bg-[#4B7F84]/15 shadow-xs'
          : 'border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* A la izquierda: número de posición en círculo */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
            esPrimero
              ? 'bg-[#4B7F84] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300'
          }`}
        >
          {posicion}
        </div>

        {/* En el centro: nombre del dolor (16px semibold), cita y etiquetas */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] leading-snug truncate">
              {dolor.nombre}
            </h4>

            {/* Lápiz solo visible en hover o foco con tooltip */}
            <button
              type="button"
              onClick={() => onEditar(dolor)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-slate-400 hover:text-[#4B7F84] dark:hover:text-[#76A8AC] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
              title="Corregir texto y etiquetas"
              aria-label={`Corregir texto y etiquetas del dolor ${dolor.nombre}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini datos en gris con 13.5px */}
          <div className="text-[13.5px] text-[#64748B] dark:text-slate-400 font-normal mt-0.5">
            {tienePuntuacion ? (
              <span>Importancia {dolor.importancia} · Satisfacción {dolor.satisfaccion}</span>
            ) : (
              <span className="italic">Pendiente de evaluación</span>
            )}
          </div>

          {/* Cita en cursiva (14px, gris secundario) o advertencia de poca información */}
          <div className="mt-1 text-[14px]">
            {dolor.confianza === 'baja' || !dolor.cita ? (
              <div className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[13.5px] italic">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Estimado por la IA, con poca información todavía</span>
              </div>
            ) : (
              <p className="italic text-[#475569] dark:text-slate-300 leading-normal">
                &ldquo;{dolor.cita}&rdquo;
              </p>
            )}
          </div>

          {/* Etiquetas como chips pequeños suaves */}
          {dolor.etiquetas && dolor.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {dolor.etiquetas.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[12px] font-medium bg-[#EBF4F5] dark:bg-[#4B7F84]/20 text-[#2D5357] dark:text-[#B4DFE2] border border-[#CBDDE0] dark:border-[#4B7F84]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* A la derecha: Score en grande (22px bold) con pastilla de nivel y barra fina */}
        <div className="flex flex-col items-end shrink-0 pl-2">
          {tienePuntuacion ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight leading-none">
                  {dolor.score}
                </span>
                <span className="text-[12px] text-[#64748B] dark:text-slate-400 font-medium">
                  /20
                </span>
              </div>
              <div className="mt-1">
                {renderNivelBadge()}
              </div>

              {/* Barra horizontal fina de solo lectura sobre 20 (6px de grosor, pista visible) */}
              <div
                className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden shadow-inner"
                title={`Score: ${dolor.score}/20 (Estimado por la IA)`}
                aria-hidden="true"
              >
                <div
                  className="h-full bg-[#4B7F84] dark:bg-[#76A8AC] rounded-full transition-all duration-300"
                  style={{ width: `${porcentajeScore}%` }}
                />
              </div>
            </>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Pendiente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
