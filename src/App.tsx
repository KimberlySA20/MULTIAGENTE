import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { RutaProtegida } from './components/Auth/RutaProtegida';
import { VistaEmprendedor } from './pages/VistaEmprendedor';
import { VistaMentor } from './pages/VistaMentor';

const RedireccionInicial: React.FC = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={usuario.rol === 'mentor' ? '/mentor' : '/diagnostico'} replace />;
};

export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const guardado = localStorage.getItem('theme');
    if (guardado) return guardado === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
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
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta Raíz con Redirección según Rol */}
          <Route path="/" element={<RedireccionInicial />} />

          {/* Login con Google */}
          <Route
            path="/login"
            element={<Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          />

          {/* Vista del Emprendedor (Existente e intacta) */}
          <Route
            path="/diagnostico"
            element={
              <RutaProtegida rolEsperado="emprendedor">
                <VistaEmprendedor isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </RutaProtegida>
            }
          />

          {/* Vista del Mentor (Nueva) */}
          <Route
            path="/mentor"
            element={
              <RutaProtegida rolEsperado="mentor">
                <VistaMentor isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </RutaProtegida>
            }
          />

          {/* Comodín para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
