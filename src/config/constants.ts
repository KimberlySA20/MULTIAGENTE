/**
 * Constantes y configuración global
 */

export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://api.plataforma.local/v1',
  // URL del Webhook del agente (Flujo 1 · chat de contextualización). Si está vacía se usa API_BASE_URL + /chat/mensaje
  WEBHOOK_CHAT_URL: import.meta.env.VITE_WEBHOOK_CHAT_URL || '',
  // true cuando hay una URL de webhook configurada
  WEBHOOK_CHAT_ACTIVO: !!(import.meta.env.VITE_WEBHOOK_CHAT_URL && import.meta.env.VITE_WEBHOOK_CHAT_URL.trim()),
  WEBHOOK_TIMEOUT_MS: 60000,
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
