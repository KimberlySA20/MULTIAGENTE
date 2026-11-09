import React from 'react';
import type { DolorRankingMentor } from '../../types/mentor';
import { X, MessageSquare, Bot, User, Quote } from 'lucide-react';

interface ModalVerChatProps {
  dolor: DolorRankingMentor | null;
  nombreEmprendimiento: string;
  onCerrar: () => void;
}

export const ModalVerChat: React.FC<ModalVerChatProps> = ({
  dolor,
  nombreEmprendimiento,
  onCerrar,
}) => {
  if (!dolor) return null;

  // Mensajes de contexto representativos del caso
  const mensajesContexto = [
    {
      emisor: 'asistente',
      hora: '10:14 AM',
      texto: `Hola, bienvenido a la Fase 0 de diagnóstico. Contame sobre los mayores desafíos que enfrentás en el día a día operativo con ${nombreEmprendimiento}.`,
    },
    {
      emisor: 'emprendedor',
      hora: '10:16 AM',
      texto: `El mayor problema que tenemos ahora mismo es que los clientes nos pagan a 60 y 90 días. ${dolor.citaChat}. Eso nos frena todo el crecimiento.`,
    },
    {
      emisor: 'asistente',
      hora: '10:17 AM',
      texto: `Entendido. Esto genera un desfase de caja severo. ¿Han probado implementar factoring, descuentos por pronto pago o recordatorios automáticos?`,
    },
    {
      emisor: 'emprendedor',
      hora: '10:19 AM',
      texto: `Intentamos enviar emails manuales pero se nos pasan las fechas porque todo lo llevamos desordenado. Nos consume muchísimo tiempo de seguimiento.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      
      {/* Tarjeta / Modal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Respaldo en el Chat
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {nombreEmprendimiento} · Auditoría de evidencia
              </p>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cita Textual Destacada */}
        <div className="px-5 pt-4">
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs">
            <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-semibold mb-1">
              <Quote className="w-3.5 h-3.5" />
              <span>Evidencia extraída para: "{dolor.dolor}"</span>
            </div>
            <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {dolor.citaChat}
            </p>
          </div>
        </div>

        {/* Historial de la conversación */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <span className="block text-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Fragmento de la sesión de diagnóstico
          </span>

          {mensajesContexto.map((msg, idx) => {
            const esAsistente = msg.emisor === 'asistente';
            const contieneCita = msg.texto.includes(dolor.citaChat);

            return (
              <div
                key={idx}
                className={`flex gap-3 ${esAsistente ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    esAsistente ? 'bg-teal-600' : 'bg-slate-700'
                  }`}
                >
                  {esAsistente ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                    esAsistente
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                      : contieneCita
                      ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs ring-2 ring-teal-400/50'
                      : 'bg-slate-800 dark:bg-slate-700 text-white rounded-tr-xs'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1 text-[10px] opacity-75">
                    <span className="font-semibold">{esAsistente ? 'Asistente IA' : 'Emprendedor'}</span>
                    <span>{msg.hora}</span>
                  </div>
                  <p>{msg.texto}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie con botón de cierre */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cerrar visualizador
          </button>
        </div>

      </div>

    </div>
  );
};
