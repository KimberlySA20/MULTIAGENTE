import React from 'react';
import type { MensajeChat } from '../../types';

interface MensajeBurbujaProps {
  mensaje: MensajeChat;
  onOmitirSolucion?: () => void;
  deshabilitado?: boolean;
}

import { Bot } from 'lucide-react';

export const MensajeBurbuja: React.FC<MensajeBurbujaProps> = ({
  mensaje,
  onOmitirSolucion,
  deshabilitado = false,
}) => {
  const esAsistente = mensaje.emisor === 'asistente';

  return (
    <div className={`flex w-full mb-3.5 ${esAsistente ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-end gap-2 max-w-[82%] sm:max-w-[80%] ${esAsistente ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar pequeño del asistente */}
        {esAsistente && (
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mb-5 shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
        )}

        <div className={`flex flex-col ${esAsistente ? 'items-start' : 'items-end'}`}>
          {/* Burbuja de mensaje */}
          <div
            className={`px-4 py-3 rounded-[16px] text-[15px] leading-[1.55] transition-colors shadow-2xs ${
              esAsistente
                ? 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F1F5F9] rounded-bl-[4px]'
                : 'bg-[#4B7F84] text-white rounded-br-[4px] font-normal'
            }`}
          >
            <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
          </div>

          {/* Botón secundario "Omitir solución por ahora" con altura 40px y fondo blanco */}
          {esAsistente && mensaje.ofreceOmitirSolucion && onOmitirSolucion && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={onOmitirSolucion}
                disabled={deshabilitado}
                className="h-[40px] px-4 rounded-xl text-[13.5px] font-medium border border-[#CBD5E1] dark:border-slate-600 text-[#475569] dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer inline-flex items-center"
                aria-label="Omitir propuesta de solución por ahora"
              >
                Omitir solución por ahora
              </button>
            </div>
          )}

          {/* Hora en microtexto gris */}
          <span className="text-[12.5px] text-[#64748B] dark:text-slate-400 mt-1 px-1">
            {mensaje.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};
