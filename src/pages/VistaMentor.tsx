import React, { useState } from 'react';
import { MentorNavbar } from '../components/Mentor/MentorNavbar';
import { MentorSidebar } from '../components/Mentor/MentorSidebar';
import { PanelListaEmprendimientos } from '../components/Mentor/PanelListaEmprendimientos';
import { TablaRankingMentor } from '../components/Mentor/TablaRankingMentor';
import { TarjetaExplicabilidad } from '../components/Mentor/TarjetaExplicabilidad';
import { ModuloRackAjusteScore } from '../components/Mentor/ModuloRackAjusteScore';
import { ModuloRackDecisionMentor } from '../components/Mentor/ModuloRackDecisionMentor';
import { ModalVerChat } from '../components/Mentor/ModalVerChat';
import type { EmprendimientoResumenMentor, DolorRankingMentor, ExplicabilidadSHAP } from '../types/mentor';
import { Cpu, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface VistaMentorProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const CASOS_MOCK: EmprendimientoResumenMentor[] = [
  {
    id: 'emp-101',
    nombre: 'PyME Flow',
    dolorPrincipal: 'Falta de flujo de caja',
    estadoBadge: 'En revisión',
    score: 15,
    nivelScore: 'Alto',
    cambiosNota: 'Cambios desde tu última revisión: 3',
    progresoFase: 'Fase 0 - Diagnóstico en curso',
    porcentajeListo: 85,
    fichaOperativa: {
      razonSocial: 'PyME Flow Soluciones S.A.',
      sector: 'Fintech / B2B',
      fundador: 'Martín Berardi',
      colaboradores: 14,
      resumenModelo:
        'Empresa de servicios contables migrando hacia SaaS de cobranzas automáticas. Presentan desfasaje crítico en ciclo de caja a 60 días.',
    },
    dolores: [
      {
        id: 'dolor-1',
        dolor: 'Falta de flujo de caja',
        importancia: 9,
        satisfaccion: 3,
        score: 15,
        nivel: 'Alto',
        citaChat: 'No les alcanza para pagar proveedores',
      },
      {
        id: 'dolor-2',
        dolor: 'Falta de visibilidad de ventas',
        importancia: 8,
        satisfaccion: 5,
        score: 11,
        nivel: 'Medio',
        citaChat: 'Lo llevan en un cuaderno, siempre se desajustan',
      },
      {
        id: 'dolor-3',
        dolor: 'Dependencia de un solo proveedor',
        importancia: 8,
        satisfaccion: 7,
        score: 9,
        nivel: 'Medio',
        citaChat: 'Poca información todavía',
      },
    ],
  },
  {
    id: 'emp-102',
    nombre: 'Agro Connect',
    dolorPrincipal: 'Falta de visibilidad de ventas',
    estadoBadge: '',
    score: 11,
    nivelScore: 'Medio',
    cambiosNota: '',
    progresoFase: 'Esperando validación de hipótesis',
    porcentajeListo: 60,
    fichaOperativa: {
      razonSocial: 'Agro Connect Logistics S.R.L.',
      sector: 'Agtech / B2B',
      fundador: 'Valeria Gómez',
      colaboradores: 6,
      resumenModelo:
        'Conexión entre pequeños productores hortícolas y restaurantes urbanos con tracking de frescura.',
    },
    dolores: [
      {
        id: 'dolor-agro-1',
        dolor: 'Falta de visibilidad de ventas',
        importancia: 8,
        satisfaccion: 5,
        score: 11,
        nivel: 'Medio',
        citaChat: 'Faltan canales digitales para el productor directo',
      },
      {
        id: 'dolor-agro-2',
        dolor: 'Retraso logístico en cosecha',
        importancia: 7,
        satisfaccion: 4,
        score: 10,
        nivel: 'Medio',
        citaChat: 'Se pierde el 15% por falta de transporte en frío',
      },
    ],
  },
  {
    id: 'emp-103',
    nombre: 'Taller Local',
    dolorPrincipal: 'Dependencia de un solo proveedor',
    estadoBadge: '',
    score: 9,
    nivelScore: 'Medio',
    cambiosNota: '1 nueva evidencia cargada',
    progresoFase: 'Fase 0 - Diagnóstico en curso',
    porcentajeListo: 40,
    fichaOperativa: {
      razonSocial: 'Taller Mecánico El Progreso',
      sector: 'Servicios / Automotriz',
      fundador: 'Roberto Quiroga',
      colaboradores: 4,
      resumenModelo:
        'Red de talleres de mantenimiento preventivo para flotas comerciales ligeras.',
    },
    dolores: [
      {
        id: 'dolor-taller-1',
        dolor: 'Dependencia de un solo proveedor',
        importancia: 8,
        satisfaccion: 7,
        score: 9,
        nivel: 'Medio',
        citaChat: 'No encontramos repuestos alternativos',
      },
      {
        id: 'dolor-taller-2',
        dolor: 'Gestión manual de inventario',
        importancia: 6,
        satisfaccion: 5,
        score: 7,
        nivel: 'Bajo',
        citaChat: 'Hacemos recuento a mano los domingos',
      },
    ],
  },
];

const EXPLICABILIDAD_MOCK: ExplicabilidadSHAP = {
  formula: 'Fórmula oportunidad = imp + (imp - sat)',
  dolorPrincipal: 'Falta de flujo de caja',
  descripcion:
    'El modelo prioriza "Falta de flujo de caja" sobre todo por su baja satisfacción actual (3/10) frente a una alta importancia (9/10), lo que genera el mayor puntaje de oportunidad del portafolio (Score 15).',
  impactoImportancia: '+0.1',
  brechaSatisfaccion: '+0.9',
  confianzaModelo: 94.2,
};

export const VistaMentor: React.FC<VistaMentorProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { usuario } = useAuth();
  const [seccionSidebar, setSeccionSidebar] = useState<string>('diagnostico');
  const [casoSeleccionadoId, setCasoSeleccionadoId] = useState<string>('emp-101');
  const [dolorParaChat, setDolorParaChat] = useState<DolorRankingMentor | null>(null);

  const casoActivo = CASOS_MOCK.find((c) => c.id === casoSeleccionadoId) || CASOS_MOCK[0];

  const handleEnviarSugerencia = async (
    dolorId: string,
    imp: number,
    sat: number,
    motivo: string
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase && usuario?.id) {
        // Extraer id numérico si existe o usar 1 por defecto
        const idNumerico = parseInt(casoActivo.id.replace(/\D/g, ''), 10) || 1;
        const { error } = await supabase.from('ajustes_score_mentor').insert({
          emprendimiento_id: idNumerico,
          mentor_id: usuario.id,
          dolor_id: dolorId,
          importancia_sugerida: imp,
          satisfaccion_sugerida: sat,
          motivo,
        });

        if (error) {
          console.warn('[VistaMentor] Error guardando ajuste en Supabase:', error.message);
        }
      }
      return true;
    } catch (err) {
      console.error('[VistaMentor] Error enviando sugerencia:', err);
      return false;
    }
  };

  const handleRegistrarDecision = async (
    instruccion: string,
    decision: 'avanzar_aei' | 'nueva_prueba' | 'reformular'
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && supabase && usuario?.id) {
        const idNumerico = parseInt(casoActivo.id.replace(/\D/g, ''), 10) || 1;
        const { error } = await supabase.from('decisiones_mentor').insert({
          emprendimiento_id: idNumerico,
          mentor_id: usuario.id,
          instruccion_metodologica: instruccion,
          decision,
        });

        if (error) {
          console.warn('[VistaMentor] Error guardando decisión en Supabase:', error.message);
        }
      }
      return true;
    } catch (err) {
      console.error('[VistaMentor] Error registrando decisión:', err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Barra Superior con Stepper Metodológico */}
      <MentorNavbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Contenedor con Sidebar + Contenido */}
      <div className="flex-1 max-w-[1536px] w-full mx-auto flex">
        
        {/* Sidebar */}
        <MentorSidebar
          seccionActiva={seccionSidebar}
          setSeccionActiva={setSeccionSidebar}
        />

        {/* Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* Cabecera Principal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>Diagnóstico Operativo</span>
                <span>›</span>
                <span>Supervisión Técnica</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Panel de Validación & Ranking de Dolores
              </h1>
            </div>

            {/* Badges de Algoritmo y Sync */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                IA Algoritmo: <span className="font-semibold">NLP-SHAP v2.4</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
                <RefreshCw className="w-3 h-3 text-slate-400" />
                Último sync: Hace 12 min
              </span>
            </div>
          </div>

          {/* Grid de 2 Columnas: Izquierda (Casos 4 cols) y Derecha (Supervisión 8 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Emprendimientos Asignados + Ficha Operativa */}
            <div className="lg:col-span-4">
              <PanelListaEmprendimientos
                casos={CASOS_MOCK}
                casoSeleccionadoId={casoActivo.id}
                onSeleccionarCaso={setCasoSeleccionadoId}
              />
            </div>

            {/* Columna Derecha: Ranking + Explicabilidad + RACK 2 + RACK 4 */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tabla de Ranking de Dolores */}
              <TablaRankingMentor
                nombreEmprendimiento={casoActivo.nombre}
                dolores={casoActivo.dolores}
                onAbrirChat={(dolor) => setDolorParaChat(dolor)}
              />

              {/* Tarjeta de Explicabilidad SHAP/LIME */}
              <TarjetaExplicabilidad explicabilidad={EXPLICABILIDAD_MOCK} />

              {/* RACK 2: Sugerir Ajuste de Score */}
              <ModuloRackAjusteScore
                dolores={casoActivo.dolores}
                onEnviarSugerencia={handleEnviarSugerencia}
              />

              {/* RACK 4: Comentario y Decisión del Mentor */}
              <ModuloRackDecisionMentor
                onRegistrarDecision={handleRegistrarDecision}
              />

            </div>

          </div>

        </main>

      </div>

      {/* Modal / Drawer para consultar el respaldo en el chat */}
      <ModalVerChat
        dolor={dolorParaChat}
        nombreEmprendimiento={casoActivo.nombre}
        onCerrar={() => setDolorParaChat(null)}
      />

    </div>
  );
};

export default VistaMentor;
