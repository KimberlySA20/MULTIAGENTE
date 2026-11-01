import React, { useState, useMemo } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import type { Dolor } from '../../types';
import { FilaDolor } from './FilaDolor';
import { ModalEditarDolor } from './ModalEditarDolor';

import { Flame } from 'lucide-react';

export const TarjetaRanking: React.FC = () => {
  const { estado, editarDolor } = useEmprendimiento();
  const [dolorAEditar, setDolorAEditar] = useState<Dolor | null>(null);
  const [procesandoEdicion, setProcesandoEdicion] = useState(false);

  // Ordenar dolores por score descendente (items sin score van al final)
  const doloresOrdenados = useMemo(() => {
    if (!estado?.dolores) return [];
    return [...estado.dolores].sort((a, b) => {
      const scoreA = a.score ?? -1;
      const scoreB = b.score ?? -1;
      return scoreB - scoreA;
    });
  }, [estado?.dolores]);

  const handleGuardarEdicion = async (
    dolorId: string,
    nuevoNombre: string,
    etiquetas: string[],
    motivo?: string
  ) => {
    setProcesandoEdicion(true);
    await editarDolor(dolorId, nuevoNombre, etiquetas, motivo);
    setProcesandoEdicion(false);
  };

  if (!estado) return null;

  return (
    <>
      <article
        aria-label="Ranking de dolores"
        className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-colors"
      >
        {/* Cabecera uniforme con círculo numérico, icono de fuego y pastilla suave Calculado por la IA */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300 flex items-center justify-center text-[13px] font-semibold">
              2
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                Ranking de dolores
              </h3>
            </div>
          </div>
        </div>

        {/* Subtítulo explicativo */}
        <p className="text-[14px] text-[#475569] dark:text-slate-400 mb-5 leading-[1.55]">
          Estimado a partir de lo que contaste en el chat. Tu mentor puede sugerir ajustes.
        </p>

        {/* Lista de dolores ordenados con separación de 12px entre filas */}
        <div className="space-y-3">
          {doloresOrdenados.length > 0 ? (
            doloresOrdenados.map((dolor, index) => (
              <FilaDolor
                key={dolor.id}
                dolor={dolor}
                posicion={index + 1}
                esPrimero={index === 0}
                onEditar={(d) => setDolorAEditar(d)}
              />
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Aún no se han detectado dolores en la conversación.
            </div>
          )}
        </div>
      </article>

      {/* Modal para corregir nombre y etiquetas */}
      <ModalEditarDolor
        dolor={dolorAEditar}
        abierto={!!dolorAEditar}
        onCerrar={() => setDolorAEditar(null)}
        onGuardar={handleGuardarEdicion}
        procesando={procesandoEdicion}
      />
    </>
  );
};
