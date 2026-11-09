export type NivelScore = 'Alto' | 'Medio' | 'Bajo';

export interface DolorRankingMentor {
  id: string;
  dolor: string;
  importancia: number;
  satisfaccion: number;
  score: number;
  nivel: NivelScore;
  citaChat: string;
  chatMessageId?: string;
}

export interface FichaOperativa {
  razonSocial: string;
  sector: string;
  fundador: string;
  colaboradores: number;
  resumenModelo: string;
}

export interface EmprendimientoResumenMentor {
  id: string;
  nombre: string;
  dolorPrincipal: string;
  estadoBadge: string;
  score: number;
  nivelScore: NivelScore;
  cambiosNota?: string;
  progresoFase: string;
  porcentajeListo: number;
  fichaOperativa: FichaOperativa;
  dolores: DolorRankingMentor[];
}

export interface ExplicabilidadSHAP {
  formula: string;
  dolorPrincipal: string;
  descripcion: string;
  impactoImportancia: string;
  brechaSatisfaccion: string;
  confianzaModelo: number;
}

export interface AjusteScoreSugerido {
  dolorId: string;
  importanciaSugerida: number;
  satisfaccionSugerida: number;
  motivo: string;
}

export interface DecisionMentorAccion {
  emprendimientoId: string;
  instruccionMetodologica: string;
  decision: 'avanzar_aei' | 'nueva_prueba' | 'reformular';
}
