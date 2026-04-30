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
 * Frecuencias con flag de "sin respuesta" por frecuencia
 */
export interface FrecuenciasAudiometryConSR extends Partial<FrecuenciasAudiometry> {
  sinRespuesta?: Partial<Record<keyof FrecuenciasAudiometry, boolean>>;
}

/**
 * Datos de audiometría tonal para ambos oídos
 * Incluye vía aérea, vía ósea y condiciones enmascaradas según norma ASHA 1990
 */
export interface DatosAudiometriaTonal {
  tipo: 'tonal';
  // Vía aérea sin enmascarar (O = OD, X = OI)
  oido_derecho: Partial<FrecuenciasAudiometry>;
  oido_izquierdo: Partial<FrecuenciasAudiometry>;
  // Vía aérea enmascarada (△ = OD, □ = OI)
  oido_derecho_enmascarado?: Partial<FrecuenciasAudiometry>;
  oido_izquierdo_enmascarado?: Partial<FrecuenciasAudiometry>;
  // Vía ósea sin enmascarar (< = OD, > = OI)
  oseo_derecho?: Partial<FrecuenciasAudiometry>;
  oseo_izquierdo?: Partial<FrecuenciasAudiometry>;
  // Vía ósea enmascarada ([ = OD, ] = OI)
  oseo_derecho_enmascarado?: Partial<FrecuenciasAudiometry>;
  oseo_izquierdo_enmascarado?: Partial<FrecuenciasAudiometry>;
  // Sin respuesta por frecuencia (flecha diagonal)
  sin_respuesta_derecho?: Partial<Record<keyof FrecuenciasAudiometry, boolean>>;
  sin_respuesta_izquierdo?: Partial<Record<keyof FrecuenciasAudiometry, boolean>>;
}

/**
 * Punto de logoaudiometría: nivel en dB y cantidad de palabras correctas (sobre 10)
 */
export interface PuntoLogoaudiometria {
  db: number;
  correctas: number;  // 0-10, el porcentaje se calcula como (correctas/10)*100
}

/**
 * Datos de logoaudiometría (reconocimiento verbal)
 * El SDS se calcula automáticamente como el máximo porcentaje alcanzado.
 * El SRT se calcula como el dB donde se alcanza el 50% de reconocimiento.
 */
export interface DatosLogoaudiometria {
  tipo: 'logoaudiometria';
  puntos: {
    derecho: PuntoLogoaudiometria[];
    izquierdo: PuntoLogoaudiometria[];
  };
}

/**
 * Frecuencias estándar para reflejos acústicos
 */
export type FrecuenciaReflejo = '500' | '1000' | '2000' | '4000';

/**
 * Umbral de reflejo acústico para una frecuencia.
 * null = No Response (NR)
 */
export type UmbralReflejo = number | null;

/**
 * Reflejos acústicos ipsilaterales y contralaterales por oído sonda
 * Ipsilateral: estímulo y sonda en el mismo oído
 * Contralateral: estímulo en el oído opuesto, sonda en este oído
 */
export interface ReflejosOido {
  ipsilateral: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>;
  contralateral: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>;
}

/**
 * Datos de timpanometría para ambos oídos, incluyendo reflejos acústicos
 */
export interface DatosTimpanometria {
  tipo: 'timpanometria';
  derecho: {
    tipoCurva: TipoCurvaTimpanometrica;
    presionPico: number;  // en decapascales (daPa)
    cumplimiento: number;  // en mililitros (ml)
    volumenCanalExterno?: number; // ml, opcional
  };
  izquierdo: {
    tipoCurva: TipoCurvaTimpanometrica;
    presionPico: number;
    cumplimiento: number;
    volumenCanalExterno?: number;
  };
  // Reflejos acústicos (opcional)
  reflejos?: {
    derecho: ReflejosOido;  // sonda en OD
    izquierdo: ReflejosOido; // sonda en OI
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
