import React from 'react';
import { useEmprendimiento } from '../context/EmprendimientoContext';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export const BannerEstadoEmprendimiento: React.FC = () => {
  const { estado } = useEmprendimiento();

  if (!estado) return null;

  const { resumenEstado, etapa, estadoNotificacionMentor } = estado;
  const esConfirmado = etapa === 'resumen_confirmado';

  // Texto dinámico para "Revisión del mentor"
  const getTextoRevisionMentor = () => {
    if (estadoNotificacionMentor === 'confirmada') {
      return 'Aviso enviado al mentor por WhatsApp (Flujo 5a). Esperando sus anotaciones.';
    }
    if (estadoNotificacionMentor === 'en_progreso') {
      return 'Avisando a tu mentor por WhatsApp...';
    }
    if (estadoNotificacionMentor === 'fallida') {
      return 'Resumen confirmado, pero el aviso al mentor está pendiente de envío.';
    }
    if (esConfirmado) {
      return 'Resumen confirmado. Notificación al mentor en cola.';
    }
    return 'Pendiente: se avisará al mentor automáticamente al confirmar el resumen.';
  };

  // Texto dinámico para "Próxima acción"
  const getTextoProximaAccion = () => {
    if (esConfirmado) {
      if (estadoNotificacionMentor === 'confirmada') {
        return 'Esperá las observaciones y decisiones de tu mentor en el panel.';
      }
      if (estadoNotificacionMentor === 'fallida') {
        return 'Reintentá el aviso al mentor o consultá con soporte técnico.';
      }
      return 'Esperá la notificación de confirmación del mentor.';
    }
    return 'Revisá los dolores identificados y confirmá el resumen si refleja lo conversado.';
  };

  const textoConfirmado = esConfirmado
    ? 'Resumen completo confirmado'
    : resumenEstado.confirmado;

  const textoQueCambio = esConfirmado
    ? 'Etapa actualizada a resumen_confirmado (disparó Flujo 5a).'
    : resumenEstado.queCambio;

  const textoRevision = getTextoRevisionMentor();
  const textoProximaAccion = getTextoProximaAccion();

  return (
    <section
      aria-label="Resumen del estado actual del emprendimiento"
      className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-3 pb-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tarjeta 1: CONFIRMADO */}
        <div className="bg-[#F2F7F7] dark:bg-slate-900/90 border border-[#4B7F84]/20 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-colors">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#4B7F84] dark:text-[#76A8AC] flex items-center justify-center shrink-0 shadow-2xs border border-[#4B7F84]/20 dark:border-slate-700/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4B7F84] dark:text-[#76A8AC]">
              CONFIRMADO
            </span>
            <p
              className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5"
              title={textoConfirmado}
            >
              {textoConfirmado}
            </p>
          </div>
        </div>

        {/* Tarjeta 2: ÚLTIMO CAMBIO */}
        <div className="bg-[#F2F7F7] dark:bg-slate-900/90 border border-[#4B7F84]/20 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-colors">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#4B7F84] dark:text-[#76A8AC] flex items-center justify-center shrink-0 shadow-2xs border border-[#4B7F84]/20 dark:border-slate-700/60">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4B7F84] dark:text-[#76A8AC]">
              ÚLTIMO CAMBIO
            </span>
            <p
              className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5"
              title={textoQueCambio}
            >
              {textoQueCambio}
            </p>
          </div>
        </div>

        {/* Tarjeta 3: REVISIÓN DEL MENTOR */}
        <div className="bg-[#F2F7F7] dark:bg-slate-900/90 border border-[#4B7F84]/20 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-colors">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#4B7F84] dark:text-[#76A8AC] flex items-center justify-center shrink-0 shadow-2xs border border-[#4B7F84]/20 dark:border-slate-700/60">
            {/* Ícono de mentor */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4B7F84] dark:text-[#76A8AC]">
              REVISIÓN DEL MENTOR
            </span>
            <p
              className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5"
              title={textoRevision}
            >
              {textoRevision}
            </p>
          </div>
        </div>

        {/* Tarjeta 4: PRÓXIMA ACCIÓN con fondo suave y botón en #4B7F84 con flecha blanca */}
        <div className="bg-[#EBF5F6] dark:bg-[#4B7F84]/20 border border-[#4B7F84]/35 dark:border-[#4B7F84]/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#4B7F84] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2D5357] dark:text-[#B4DFE2]">
              PRÓXIMA ACCIÓN
            </span>
            <p
              className="text-[13px] font-medium text-[#1A373A] dark:text-slate-100 truncate mt-0.5"
              title={textoProximaAccion}
            >
              {textoProximaAccion}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
