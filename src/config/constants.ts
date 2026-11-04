/**
 * Constantes y configuración global
 */

export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://api.plataforma.local/v1',
  // Poner en "true" cuando el endpoint GET /emprendimiento/:id/diagnostico esté disponible.
  // Con "false" la app arranca con estado vacío sin hacer ninguna llamada HTTP.
  API_READY: import.meta.env.VITE_API_READY === 'true',
  // URL del Webhook del agente (Flujo 1 · chat de contextualización). Si está vacía se usa API_BASE_URL + /chat/mensaje
  WEBHOOK_CHAT_URL: import.meta.env.VITE_WEBHOOK_CHAT_URL || '',
  // true cuando hay una URL de webhook configurada
  WEBHOOK_CHAT_ACTIVO: !!(import.meta.env.VITE_WEBHOOK_CHAT_URL && import.meta.env.VITE_WEBHOOK_CHAT_URL.trim()),
  // Un Webhook por flujo de Visione Flow. Si alguno está vacío, esa acción devuelve
  // un error claro ("flujo no conectado") en vez de intentar llamar a un backend inexistente.
  // Flujo 2 · Panel: confirmar / editar / eliminar un dolor o etiqueta
  WEBHOOK_PANEL_ITEM_URL: import.meta.env.VITE_WEBHOOK_PANEL_ITEM_URL || '',
  // Flujo 2b · Confirmar el resumen del diagnóstico
  WEBHOOK_CONFIRMAR_RESUMEN_URL: import.meta.env.VITE_WEBHOOK_CONFIRMAR_RESUMEN_URL || '',
  // Flujo 4 · Omitir solución (aún no existe el workflow)
  WEBHOOK_OMITIR_URL: import.meta.env.VITE_WEBHOOK_OMITIR_URL || '',
  // Flujo 4 · Aceptar / descartar sugerencia (aún no configurado)
  WEBHOOK_DECIDIR_SUGERENCIA_URL: import.meta.env.VITE_WEBHOOK_DECIDIR_SUGERENCIA_URL || '',
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
