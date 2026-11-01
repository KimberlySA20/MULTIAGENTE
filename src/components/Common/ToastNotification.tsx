import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ToastNotificationProps {
  error: { codigo: string; mensaje: string } | null;
  onCerrar: () => void;
  onReintentar?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  error,
  onCerrar,
  onReintentar,
}) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 left-5 z-50 max-w-md w-[calc(100%-2.5rem)] bg-rose-50 dark:bg-rose-950/90 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 p-4 rounded-[16px] shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200"
    >
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs sm:text-sm">
        <p className="font-semibold text-rose-950 dark:text-rose-100">
          Aviso del sistema ({error.codigo})
        </p>
        <p className="mt-0.5 text-rose-800 dark:text-rose-300 leading-snug">
          {error.mensaje}
        </p>
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reintentar acción</span>
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onCerrar}
        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 transition-colors"
        aria-label="Cerrar notificación de error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
