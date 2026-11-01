import React, { useState } from 'react';
import { useEmprendimiento } from '../../context/EmprendimientoContext';
import { CATEGORIAS_FIJAS } from '../../types';
import { DialogoConfirmarResumen } from './DialogoConfirmarResumen';
import { Tag, Plus, X, Check, Clock, AlertTriangle } from 'lucide-react';

export const TarjetaEtiquetas: React.FC = () => {
  const {
    estado,
    confirmarResumen,
    agregarEtiqueta,
    eliminarEtiqueta,
  } = useEmprendimiento();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesandoConfirmacion, setProcesandoConfirmacion] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [etiquetaLibre, setEtiquetaLibre] = useState('');

  if (!estado) return null;

  const { etapa, etiquetas, estadoNotificacionMentor } = estado;
  const puedeConfirmar = etapa === 'resumen_por_confirmar';

  const handleConfirmar = async () => {
    setProcesandoConfirmacion(true);
    const exito = await confirmarResumen();
    setProcesandoConfirmacion(false);
    if (exito) {
      setModalAbierto(false);
    }
  };

  const handleAgregarEtiquetaLibre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!etiquetaLibre.trim()) return;
    agregarEtiqueta(etiquetaLibre.trim());
    setEtiquetaLibre('');
    setMostrarSelector(false);
  };

  const handleSeleccionarCategoria = (cat: string) => {
    agregarEtiqueta(`#${cat}`);
    setMostrarSelector(false);
  };

  return (
    <>
      <article
        aria-label="Categorización y etiquetas"
        className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-colors"
      >
        {/* Cabecera uniforme con círculo numérico e icono */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300 flex items-center justify-center text-[13px] font-semibold">
            1
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4.5 h-4.5 text-[#4B7F84] dark:text-[#76A8AC]" />
            <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Categorización y etiquetas
            </h3>
          </div>
        </div>

        {/* Chips de etiquetas suaves armonizadas (#E8F2F2 / #2D5357) según Stitch y botón + Agregar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {etiquetas.map((etq) => (
            <span
              key={etq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13.5px] font-medium bg-[#EBF4F5] dark:bg-[#4B7F84]/20 text-[#2D5357] dark:text-[#B4DFE2] border border-[#CBDDE0] dark:border-[#4B7F84]/40 shadow-2xs group"
            >
              <span>{etq}</span>
              <button
                type="button"
                onClick={() => eliminarEtiqueta(etq)}
                className="hover:bg-[#D5EAEB] dark:hover:bg-[#4B7F84]/40 rounded-full p-0.5 text-[#2D5357] dark:text-[#B4DFE2] transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
                aria-label={`Eliminar etiqueta ${etq}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {/* Botón chip punteado + Agregar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMostrarSelector((prev) => !prev)}
              className="h-[34px] inline-flex items-center gap-1.5 px-3.5 rounded-full text-[13.5px] font-medium border border-dashed border-[#CBD5E1] dark:border-slate-600 text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
              aria-expanded={mostrarSelector}
              aria-label="Agregar nueva etiqueta o categoría"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>+ Agregar</span>
            </button>

            {/* Menú desplegable */}
            {mostrarSelector && (
              <div className="absolute left-0 mt-2 z-20 w-72 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-lg p-3.5 text-xs animate-in fade-in duration-150">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Categorías principales:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {CATEGORIAS_FIJAS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSeleccionarCategoria(cat)}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-[#EBF4F5] dark:hover:bg-[#4B7F84]/30 text-slate-700 dark:text-slate-200 hover:text-[#2D5357] dark:hover:text-[#B4DFE2] text-[12px] font-medium transition-colors"
                    >
                      #{cat}
                    </button>
                  ))}
                </div>

                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  O escribí una etiqueta libre:
                </p>
                <form onSubmit={handleAgregarEtiquetaLibre} className="flex gap-2">
                  <input
                    type="text"
                    value={etiquetaLibre}
                    onChange={(e) => setEtiquetaLibre(e.target.value)}
                    placeholder="Ej. #FlujoDeCaja"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#4B7F84] hover:bg-[#3D686C] text-white font-medium text-xs cursor-pointer"
                  >
                    OK
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Texto explicativo */}
        <p className="text-[14px] text-[#475569] dark:text-slate-400 leading-[1.55] mb-5">
          Revisá lo que la IA entendió. Confirmar significa que el resumen refleja lo que dijiste, no que las hipótesis estén comprobadas.
        </p>

        {/* Botón primario Confirmar resumen: ancho completo, altura 44px, radio 10px con verde petróleo Stitch */}
        <div className="space-y-2">
          {puedeConfirmar ? (
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="w-full h-[44px] rounded-[10px] bg-[#4B7F84] hover:bg-[#3D686C] active:scale-99 text-white font-semibold text-[15px] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#4B7F84] focus:ring-offset-2"
            >
              Confirmar resumen
            </button>
          ) : (
            <div className="w-full">
              {/* Estado confirmado: fondo verde claro con icono de check y texto verde oscuro */}
              <div className="w-full h-[44px] rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-semibold text-[15px] flex items-center justify-center gap-2 select-none shadow-2xs">
                <Check className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                <span>Resumen confirmado</span>
              </div>

              {/* Línea de estado con icono debajo */}
              <div className="mt-2.5 flex items-center justify-center">
                {estadoNotificacionMentor === 'en_progreso' && (
                  <span className="text-[13px] text-[#4B7F84] dark:text-[#76A8AC] inline-flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Avisando a tu mentor...</span>
                  </span>
                )}

                {estadoNotificacionMentor === 'confirmada' && (
                  <span className="text-[13px] text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enviado al mentor</span>
                  </span>
                )}

                {estadoNotificacionMentor === 'fallida' && (
                  <span className="text-[13px] text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Resumen confirmado, el aviso al mentor está pendiente</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Diálogo modal de confirmación */}
      <DialogoConfirmarResumen
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onConfirmar={handleConfirmar}
        procesando={procesandoConfirmacion}
      />
    </>
  );
};
