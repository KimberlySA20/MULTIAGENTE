import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface DialogoConfirmarResumenProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => Promise<void>;
  procesando: boolean;
}

export const DialogoConfirmarResumen: React.FC<DialogoConfirmarResumenProps> = ({
  abierto,
  onCerrar,
  onConfirmar,
  procesando,
}) => {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-dialogo-confirmar"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          disabled={procesando}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar ventana de confirmación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado e ícono */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 id="titulo-dialogo-confirmar" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Confirmar resumen del diagnóstico
          </h3>
        </div>

        {/* Explicación obligatoria según Regla de Negocio 3.1 */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed space-y-1.5">
              <p className="font-semibold">¿Qué significa esta acción?</p>
              <p>
                Confirmar el resumen significa <strong>únicamente que la plataforma entendió lo que dijiste</strong> durante la conversación.
              </p>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                <strong>No significa</strong> que una hipótesis esté comprobada ni validada con el mercado.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Al confirmar, la etapa avanzará y se generará una notificación para que tu mentor revise los dolores y te deje anotaciones de orientación.
        </p>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Revisar más
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm disabled:opacity-60 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            {procesando ? (
              <span>Confirmando...</span>
            ) : (
              <span>Sí, confirmar resumen</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
