import React, { useState, useRef, useEffect } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import { MensajeBurbuja } from './MensajeBurbuja';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { CONFIG } from '../../config/constants';

export const ChatPanel: React.FC = () => {
  const {
    mensajesChat,
    esperandoRespuestaChat,
    enviarMensaje,
    omitirSolucion,
  } = useEmprendimiento();

  const [inputTexto, setInputTexto] = useState('');
  const [omitirProcesando, setOmitirProcesando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final del historial de mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajesChat, esperandoRespuestaChat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTexto.trim() || esperandoRespuestaChat) return;

    const textoAEnviar = inputTexto;
    const exito = await enviarMensaje(textoAEnviar);
    if (exito) {
      setInputTexto('');
      inputRef.current?.focus();
    }
  };

  const handleOmitir = async () => {
    setOmitirProcesando(true);
    await omitirSolucion();
    setOmitirProcesando(false);
  };

  return (
    <section
      aria-label="Panel de conversación con el asistente de IA"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] flex flex-col w-full h-[520px] lg:h-full transition-colors overflow-hidden"
    >
      {/* Cabecera del Chat con icono y título semibold 18px */}
      {/* Cabecera del Chat con icono, título y badge de estado según modo demo */}
      <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4B7F84]/15 dark:bg-[#4B7F84]/25 text-[#4B7F84] dark:text-[#76A8AC] flex items-center justify-center">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            Chat con el asistente
          </h2>
        </div>
        {CONFIG.WEBHOOK_CHAT_ACTIVO ? (
          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300">
            Demo
          </span>
        )}
      </div>

      {/* Historial con scroll interno anclado arriba */}
      <div
        ref={scrollRef}
        aria-live="polite"
        aria-atomic="false"
        className="flex-1 overflow-y-auto p-6 space-y-1.5"
      >
        {mensajesChat.map((msg) => (
          <MensajeBurbuja
            key={msg.id}
            mensaje={msg}
            onOmitirSolucion={handleOmitir}
            deshabilitado={esperandoRespuestaChat || omitirProcesando}
          />
        ))}

        {/* Indicador de escritura animado */}
        {esperandoRespuestaChat && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-fit rounded-bl-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
            <span className="text-[12.5px] ml-1.5 text-slate-500 dark:text-slate-400">El asistente está escribiendo...</span>
          </div>
        )}
      </div>

      {/* Formulario de entrada de texto fijo abajo con línea divisoria */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="mensaje-chat-input" className="sr-only">
            Escribí tu mensaje para el asistente
          </label>
          <input
            id="mensaje-chat-input"
            ref={inputRef}
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            disabled={esperandoRespuestaChat}
            placeholder="Escribí tu mensaje..."
            className="flex-1 h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 text-[15px] focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!inputTexto.trim() || esperandoRespuestaChat}
            className="h-[44px] px-5 rounded-xl bg-[#4B7F84] hover:bg-[#3D686C] active:scale-98 text-white font-medium text-[15px] inline-flex items-center gap-2 shadow-xs hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4B7F84] transition-all cursor-pointer"
          >
            {esperandoRespuestaChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Enviar</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
