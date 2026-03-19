// Core type definitions for the Sistema de Evaluación Auditiva Profesional

/**
 * Tipos de pruebas audiológicas disponibles
 */
export type TipoPrueba = 'tonal' | 'logoaudiometria' | 'timpanometria';

/**
 * Opciones de sexo del paciente
 */
export type Sexo = 'masculino' | 'femenino' | 'otro';

/**
 * Identificador de oído
 */
export type Oido = 'derecho' | 'izquierdo';

/**
 * Tipos de curva timpanométrica
 */
export type TipoCurvaTimpanometrica = 'A' | 'B' | 'C' | 'As' | 'Ad';

/**
 * Información demográfica del paciente
 */
export interface Paciente {
  apellido: string;
  nombre: string;
  fechaNacimiento: Date;
  sexo: Sexo;
}

/**
 * Frecuencias estándar para audiometría tonal (en Hz)
 * Valores en decibeles (dB)
 */
export interface FrecuenciasAudiometry {
  '250': number;
  '500': number;
  '1000': number;
  '2000': number;
  '4000': number;
  '8000': number;
}

/**
 * Datos de audiometría tonal para ambos oídos
 */
export interface DatosAudiometriaTonal {
  tipo: 'tonal';
  oido_derecho: Partial<FrecuenciasAudiometry>;
  oido_izquierdo: Partial<FrecuenciasAudiometry>;
}

/**
 * Datos de logoaudiometría (reconocimiento verbal)
 */
export interface DatosLogoaudiometria {
  tipo: 'logoaudiometria';
  srt: {
    derecho: number;  // Speech Reception Threshold en dB
    izquierdo: number;
  };
  sds: {
    derecho: number;  // Speech Discrimination Score en %
    izquierdo: number;
  };
}

/**
 * Datos de timpanometría para ambos oídos
 */
export interface DatosTimpanometria {
  tipo: 'timpanometria';
  derecho: {
    tipoCurva: TipoCurvaTimpanometrica;
    presionPico: number;  // en decapascales (daPa)
    cumplimiento: number;  // en mililitros (ml)
  };
  izquierdo: {
    tipoCurva: TipoCurvaTimpanometrica;
    presionPico: number;  // en decapascales (daPa)
    cumplimiento: number;  // en mililitros (ml)
  };
}

/**
 * Union type para todos los tipos de pruebas
 */
export type DatosPrueba = DatosAudiometriaTonal | DatosLogoaudiometria | DatosTimpanometria;

/**
 * Información del profesional que realiza la evaluación
 */
export interface Examinador {
  nombre: string;
  codigo: string;  // Código profesional de 6 dígitos
}

/**
 * Evaluación auditiva completa
 */
export interface EvaluacionAuditiva {
  id?: string;
  paciente: Paciente;
  pruebas: DatosPrueba[];
  examinador: Examinador;
  fechaExamen: Date;
}
