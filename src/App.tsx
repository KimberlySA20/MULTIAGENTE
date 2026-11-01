import React, { useState, useEffect } from 'react';
import { EmprendimientoProvider, useEmprendimiento } from './context/EmprendimientoContext';
import { StepperEtapas } from './components/StepperEtapas';
import { BannerEstadoEmprendimiento } from './components/BannerEstadoEmprendimiento';
import { ChatPanel } from './components/Chat/ChatPanel';
import { TarjetaEtiquetas } from './components/PanelDiagnostico/TarjetaEtiquetas';
import { TarjetaRanking } from './components/PanelDiagnostico/TarjetaRanking';
import { TarjetaSugerencia } from './components/PanelDiagnostico/TarjetaSugerencia';
import { PanelControlDemo } from './components/Demo/PanelControlDemo';
import { ToastNotification } from './components/Common/ToastNotification';
import { SkeletonCard } from './components/Common/SkeletonCard';

const VistaEmprendedorContenido: React.FC = () => {
  const { cargando, errorGlobal, limpiarError, reintentar } = useEmprendimiento();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const guardado = localStorage.getItem('theme');
    if (guardado) return guardado === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Sincronizar clase dark en el elemento raíz para soporte completo de tema oscuro
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Barra superior con Stepper */}
      <StepperEtapas isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Columna Izquierda: Chat (5 columnas en desktop, uniforme con la altura total del panel derecho) */}
            <div className="lg:col-span-5 h-full flex flex-col">
              <ChatPanel />
            </div>

            {/* Columna Derecha: Panel de Diagnóstico (7 columnas, altura natural con gap de 24px) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              {/* Tarjeta 1: Categorización y etiquetas */}
              <TarjetaEtiquetas />

              {/* Tarjeta 2: Ranking de dolores (tarjeta principal) */}
              <TarjetaRanking />

              {/* Tarjeta 3: Sugerencia de la IA */}
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

      {/* Panel de control para modo de demostración y pruebas */}
      <PanelControlDemo />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EmprendimientoProvider>
      <VistaEmprendedorContenido />
    </EmprendimientoProvider>
  );
};

export default App;
