import React, { useState } from 'react';
import type { Dolor } from '../../types';
import { X, Edit3, AlertCircle } from 'lucide-react';

interface ModalEditarDolorProps {
  dolor: Dolor | null;
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (dolorId: string, nuevoNombre: string, etiquetas: string[], motivo?: string) => Promise<void>;
  procesando: boolean;
}

export const ModalEditarDolor: React.FC<ModalEditarDolorProps> = ({
  dolor,
  abierto,
  onCerrar,
  onGuardar,
  procesando,
}) => {
  if (!abierto || !dolor) return null;

  const [nombre, setNombre] = useState(dolor.nombre);
  const [etiquetasStr, setEtiquetasStr] = useState(dolor.etiquetas.join(', '));
  const [motivo, setMotivo] = useState('');
  const mostrarCampoMotivo = dolor.estado === 'confirmado';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const listaEtiquetas = etiquetasStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    await onGuardar(dolor.id, nombre.trim(), listaEtiquetas, motivo.trim() || undefined);
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-editar-dolor"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onCerrar}
          disabled={procesando}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal de edición"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="titulo-editar-dolor" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Corregir dolor y etiquetas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Las puntuaciones numéricas son estimadas por la IA y solo tu mentor puede ajustarlas.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre o descripción del dolor
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Etiquetas asociadas (separadas por comas)
            </label>
            <input
              type="text"
              value={etiquetasStr}
              onChange={(e) => setEtiquetasStr(e.target.value)}
              placeholder="#Financiero, #FlujoDeCaja"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Campo obligatorio de motivo si ya está acordado/confirmado */}
          {mostrarCampoMotivo && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70">
              <div className="flex items-start gap-2 mb-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Motivo del cambio (requerido por afectar un item acordado)
                </p>
              </div>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explicá por qué se realiza este cambio..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCerrar}
              disabled={procesando}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando || !nombre.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              {procesando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
