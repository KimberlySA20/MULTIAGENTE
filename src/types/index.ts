/**
 * Tipos TypeScript estrictos para la Vista Emprendedor (Fase 0: Diagnóstico)
 */

export type CategoriaFija =
  | 'Financiero'
  | 'Operación'
  | 'Mercadeo'
  | 'Legal'
  | 'Talento humano'
  | 'Tecnológico';

export const CATEGORIAS_FIJAS: CategoriaFija[] = [
  'Financiero',
  'Operación',
  'Mercadeo',
  'Legal',
  'Talento humano',
  'Tecnológico',
];

export type TipoItemDiagnostico =
  | 'declaracion_emprendedor'
  | 'interpretacion_ia'
  | 'hipotesis'
  | 'evidencia'
  | 'estimacion'
  | 'pendiente';

export type NivelDolor = 'Alto' | 'Medio' | 'Bajo';

export type ConfianzaDolor = 'alta' | 'media' | 'baja';

export type EstadoDolor = 'pendiente' | 'por_confirmar' | 'confirmado' | 'descartado';

export interface Dolor {
  id: string;
  nombre: string;
  importancia: number | null;     // null si la IA aún no lo estima
  satisfaccion: number | null;    // null si la IA aún no lo estima
  score: number | null;           // null si falta importancia o satisfacción
  nivel: NivelDolor | null;       // Alto (>=12), Medio (8-11), Bajo (<8)
  cita: string | null;            // Cita textual del emprendedor o null
  confianza: ConfianzaDolor;      // Si es 'baja', se muestra rotulado como poca información
  estado: EstadoDolor;
  etiquetas: string[];
  tipoItem: TipoItemDiagnostico;
}

export type EstadoSugerencia = 'pendiente' | 'aceptada' | 'descartada';

export interface Sugerencia {
  id: string;
  // Formato: "Creemos que [solución] resolverá [dolor] para [segmento], y lo sabremos porque [indicador] cambiará en [magnitud]."
  hipotesis: string;
  solucionPropuesta: string;
  dolorAsociado: string;
  segmentoObjetivo?: string;
  estado: EstadoSugerencia;
  origen: 'IA';
  fechaCreacion?: string;
}

// Decisiones posibles del mentor según regla 7:
// Aprobar ("Recomendación de avanzar a AEI"), Nueva prueba, Reformular.
// NUNCA "Aprobado" ni "Validado".
export type DecisionMentor = 'avanzar_aei' | 'nueva_prueba' | 'reformular' | null;

export interface EstimacionScore {
  importancia: number;
  satisfaccion: number;
  score: number;
  nivel?: NivelDolor;
}

export interface AjusteScoreMentor {
  dolorId: string;
  dolorNombre: string;
  motivoMentor: string;
  estimacionOriginalIA: EstimacionScore;
  sugerenciaMentor: {
    importancia: number;
    satisfaccion: number;
  };
  recalculoFinalIA: EstimacionScore;
  fecha: string;
}

export interface NotaMentor {
  id: string;
  mentorNombre: string;
  fechaRelativa: string;
  texto: string;
  decision: DecisionMentor;
  ajusteScore?: AjusteScoreMentor | null;
}

export type EtapaEmprendimiento =
  | 'resumen_por_confirmar'
  | 'resumen_confirmado'
  | 'aei'
  | 'mvp'
  | 'apm';

export type EstadoNotificacionMentor =
  | 'no_iniciada'
  | 'en_progreso'   // "Avisando a tu mentor..."
  | 'confirmada'    // "Enviado al mentor"
  | 'fallida';      // "Resumen confirmado, el aviso al mentor está pendiente"

export interface EstadoEmprendimiento {
  id: string;
  nombreEmprendimiento: string;
  etapa: EtapaEmprendimiento;
  etiquetas: string[];
  dolores: Dolor[];
  sugerencias: Sugerencia[];
  notaMentor: NotaMentor | null;
  estadoNotificacionMentor: EstadoNotificacionMentor;
  resumenConfirmadoPor?: string;
  fechaConfirmacionResumen?: string;
  // Campos del banner contextual de estado
  resumenEstado: {
    confirmado: string;
    queCambio: string;
    esperaMentor: string;
    proximaAccion: string;
  };
}

export interface MensajeChat {
  id: string;
  emisor: 'asistente' | 'emprendedor';
  contenido: string;
  timestamp: string;
  ofreceOmitirSolucion?: boolean;
}

export interface RespuestaServicio<T> {
  exito: boolean;
  datos?: T;
  error?: {
    codigo: string;
    mensaje: string;
    detalle?: string;
  };
}

// Payload de Flujo 2: Modificar items del panel (POST /panel/item)
export interface ModificarItemPayload {
  item_id: string;
  tipo_item: 'dolor' | 'etiqueta';
  accion: 'confirmar' | 'editar' | 'eliminar';
  nuevo_valor?: {
    nombre?: string;
    etiquetas?: string[];
  };
  motivo?: string; // Obligatorio si afecta acuerdo o experimento
  usuario: string;
}

// Payload de Flujo 2b: Confirmar el resumen (POST /panel/resumen/confirmar)
export interface ConfirmarResumenPayload {
  emprendimiento_id: string;
  usuario: string;
}

// Payload de Flujo 4: Omitir solución (POST /problema/omitir)
export interface OmitirSolucionPayload {
  emprendimiento_id: string;
  dolor_id?: string;
  usuario: string;
}

// Payload de Flujo 4: Decidir sugerencia (POST /sugerencia/decidir)
export interface DecidirSugerenciaPayload {
  sugerencia_id: string;
  decision: 'aceptar' | 'descartar';
  usuario: string;
}
