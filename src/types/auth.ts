export type RolUsuario = 'emprendedor' | 'mentor';

export interface PerfilUsuario {
  id: string;
  email: string;
  nombreCompleto: string;
  avatarUrl?: string;
  rol: RolUsuario;
  titulo?: string; // ej. 'Mentor Senior' o 'Fundador'
}

export interface AuthState {
  usuario: PerfilUsuario | null;
  cargando: boolean;
  error: string | null;
  autenticado: boolean;
}
