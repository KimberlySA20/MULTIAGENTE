import type { EstadoEmprendimiento, MensajeChat, NotaMentor } from '../types';

export const INITIAL_CHAT_MESSAGES: MensajeChat[] = [
  {
    id: 'msg-1',
    emisor: 'asistente',
    contenido: '¡Hola! Contame tu idea de negocio y qué problema buscás resolver.',
    timestamp: '10:00',
  },
  {
    id: 'msg-2',
    emisor: 'emprendedor',
    contenido: 'Quiero una app para PyMEs, pero sufren por falta de flujo de caja.',
    timestamp: '10:01',
  },
  {
    id: 'msg-3',
    emisor: 'asistente',
    contenido: 'Entendido. ¿Qué les pasa en el día a día cuando el flujo de caja falla?',
    timestamp: '10:02',
  },
  {
    id: 'msg-4',
    emisor: 'emprendedor',
    contenido: 'No les alcanza para pagar proveedores y lo llevan en un cuaderno, siempre se desajustan.',
    timestamp: '10:03',
  },
  {
    id: 'msg-5',
    emisor: 'asistente',
    contenido: 'Lo registré como dolor. ¿Tenés alguna propuesta inicial de solución?',
    timestamp: '10:04',
    ofreceOmitirSolucion: true,
  },
  {
    id: 'msg-6',
    emisor: 'asistente',
    contenido: 'Sin problema. Te dejé 1 alternativa para validar en el panel.',
    timestamp: '10:05',
  },
];

export const INITIAL_NOTA_MENTOR: NotaMentor = {
  id: 'nota-1',
  mentorNombre: 'Mentor',
  fechaRelativa: 'hace 2 min',
  texto: 'Validá esto con 5 clientes el próximo martes antes de seguir con el diseño técnico.',
  decision: null, // Sin decisión precipitada para preservar la regla de negocio
  ajusteScore: null,
};

export const NOTA_MENTOR_CON_AJUSTE: NotaMentor = {
  id: 'nota-2',
  mentorNombre: 'Rodrigo (Mentor Senior)',
  fechaRelativa: 'hace 5 min',
  texto: 'Considero que el dolor de proveedores es más urgente en PyMEs manufactureras que lo estimado inicialmente.',
  decision: 'nueva_prueba', // Se muestra como "Nueva prueba" (nunca "Aprobado" ni "Validado")
  ajusteScore: {
    dolorId: 'dolor-3',
    dolorNombre: 'Dependencia de un solo proveedor',
    motivoMentor: 'El riesgo de quiebre por falta de materia prima es crítico según las entrevistas.',
    estimacionOriginalIA: {
      importancia: 8,
      satisfaccion: 7,
      score: 9,
      nivel: 'Medio',
    },
    sugerenciaMentor: {
      importancia: 9,
      satisfaccion: 4,
    },
    recalculoFinalIA: {
      importancia: 9,
      satisfaccion: 4,
      score: 14,
      nivel: 'Alto',
    },
    fecha: '2026-10-30 18:30',
  },
};

export const INITIAL_ESTADO_EMPRENDIMIENTO: EstadoEmprendimiento = {
  id: 'emp-101',
  nombreEmprendimiento: 'FinanPyME Costa Rica',
  etapa: 'resumen_por_confirmar',
  etiquetas: ['#Financiero', '#FlujoDeCaja', '#Operación'],
  dolores: [
    {
      id: 'dolor-1',
      nombre: 'Falta de flujo de caja',
      importancia: 9,
      satisfaccion: 3,
      score: 15,
      nivel: 'Alto',
      cita: 'No les alcanza para pagar proveedores',
      confianza: 'alta',
      estado: 'por_confirmar',
      etiquetas: ['#Financiero', '#FlujoDeCaja'],
      tipoItem: 'interpretacion_ia',
    },
    {
      id: 'dolor-2',
      nombre: 'Falta de visibilidad de ventas',
      importancia: 8,
      satisfaccion: 5,
      score: 11,
      nivel: 'Medio',
      cita: 'No tienen registro automatizado de ventas diarias',
      confianza: 'alta',
      estado: 'por_confirmar',
      etiquetas: ['#Operación'],
      tipoItem: 'interpretacion_ia',
    },
    {
      id: 'dolor-3',
      nombre: 'Dependencia de un solo proveedor',
      importancia: 8,
      satisfaccion: 7,
      score: 9,
      nivel: 'Medio',
      cita: null,
      confianza: 'baja', // Confianza baja: muestra texto sustituto "Estimado por la IA, con poca información todavía"
      estado: 'por_confirmar',
      etiquetas: ['#Operación'],
      tipoItem: 'estimacion',
    },
  ],
  sugerencias: [
    {
      id: 'sug-1',
      hipotesis:
        'Creemos que hacer preventas o anticipos antes de desarrollar software resolverá la falta de flujo de caja para PyMEs comerciales, y lo sabremos porque el 30% de los clientes potenciales aceptará anticipar el 50% de la orden.',
      solucionPropuesta:
        'Evaluá hacer preventas o anticipos antes de desarrollar software. Esto permitiría comprobar la demanda real con riesgo mínimo.',
      dolorAsociado: 'Falta de flujo de caja',
      segmentoObjetivo: 'PyMEs comerciales',
      estado: 'pendiente',
      origen: 'IA',
    },
  ],
  notaMentor: INITIAL_NOTA_MENTOR,
  estadoNotificacionMentor: 'no_iniciada',
  resumenEstado: {
    confirmado: '3 dolores detectados y 3 etiquetas asociadas.',
    queCambio: 'Se agregó la categorización financiera y la sugerencia de preventas.',
    esperaMentor: 'Esperando tu confirmación del resumen para avisar a tu mentor.',
    proximaAccion: 'Revisá los dolores y confirmá el resumen si refleja lo que conversaste.',
  },
};
