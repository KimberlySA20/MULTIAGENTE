import React from 'react';
import { EmprendimientoProvider, useEmprendimiento } from '../context/EmprendimientoContext';
import { StepperEtapas } from '../components/StepperEtapas';
import { BannerEstadoEmprendimiento } from '../components/BannerEstadoEmprendimiento';
import { ChatPanel } from '../components/Chat/ChatPanel';
import { TarjetaEtiquetas } from '../components/PanelDiagnostico/TarjetaEtiquetas';
import { TarjetaRanking } from '../components/PanelDiagnostico/TarjetaRanking';
import { TarjetaSugerencia } from '../components/PanelDiagnostico/TarjetaSugerencia';
import { ToastNotification } from '../components/Common/ToastNotification';
import { SkeletonCard } from '../components/Common/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface VistaEmprendedorProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const VistaEmprendedorContenido: React.FC<VistaEmprendedorProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { cargando, errorGlobal, limpiarError, reintentar } = useEmprendimiento();
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Barra superior con Stepper */}
      <div className="relative">
        <StepperEtapas isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        {usuario && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex justify-end -mt-3 mb-2">
            <button
              onClick={cerrarSesion}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión ({usuario.nombreCompleto})
            </button>
          </div>
        )}
      </div>

      {/* Banner contextual de estado */}
      <BannerEstadoEmprendimiento />

      {/* Contenido principal: Grilla de 12 columnas (Chat 5 columnas, Panel 7 columnas) */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
        {cargando ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <SkeletonCard rows={6} />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <SkeletonCard rows={2} />
              <SkeletonCard rows={3} />
              <SkeletonCard rows={2} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Chat (5 columnas en desktop) */}
            <div className="lg:col-span-5 flex flex-col">
              <ChatPanel />
            </div>

            {/* Columna Derecha: Panel de Diagnóstico (7 columnas) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              <TarjetaEtiquetas />
              <TarjetaRanking />
              <TarjetaSugerencia />
            </div>
          </div>
        )}
      </main>

      {/* Notificación no bloqueante de errores */}
      <ToastNotification
        error={errorGlobal}
        onCerrar={limpiarError}
        onReintentar={reintentar}
      />
    </div>
  );
};

export const VistaEmprendedor: React.FC<VistaEmprendedorProps> = (props) => {
  return (
    <EmprendimientoProvider>
      <VistaEmprendedorContenido {...props} />
    </EmprendimientoProvider>
  );
};

export default VistaEmprendedor;
