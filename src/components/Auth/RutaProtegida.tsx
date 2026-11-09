import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { RolUsuario } from '../../types/auth';

interface RutaProtegidaProps {
  children: React.ReactNode;
  rolEsperado?: RolUsuario;
}

export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ children, rolEsperado }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolEsperado && usuario.rol !== rolEsperado) {
    return <Navigate to={usuario.rol === 'mentor' ? '/mentor' : '/diagnostico'} replace />;
  }

  return <>{children}</>;
};
