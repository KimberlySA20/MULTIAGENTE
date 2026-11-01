/**
 * Constantes y configuración global
 */

export const CONFIG = {
  // En modo demo usa mocks interactivos en memoria
  IS_DEMO_DEFAULT: import.meta.env.VITE_DEMO_MODE !== 'false',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://api.plataforma.local/v1',
  DEMO_LATENCY_MS: 600,
  SLOW_LATENCY_MS: 2400,
};

export const ETAPAS_STEPPER = [
  { id: 'fase_0', numero: 1, nombre: 'Fase 0 · Diagnóstico', activa: true },
  { id: 'aei', numero: 2, nombre: 'AEI', activa: false },
  { id: 'mvp', numero: 3, nombre: 'MVP', activa: false },
  { id: 'apm', numero: 4, nombre: 'APM', activa: false },
] as const;

export const CATEGORIAS_COLORES: Record<string, string> = {
  Financiero: 'bg-blue-600 text-white',
  Operación: 'bg-blue-600 text-white',
  Mercadeo: 'bg-blue-600 text-white',
  Legal: 'bg-blue-600 text-white',
  'Talento humano': 'bg-blue-600 text-white',
  Tecnológico: 'bg-blue-600 text-white',
};
