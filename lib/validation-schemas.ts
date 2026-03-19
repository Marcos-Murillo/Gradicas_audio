// Zod validation schemas for the Sistema de Evaluación Auditiva Profesional

import { z } from 'zod';

/**
 * Schema para validar datos del paciente
 * Valida: Requirements 2.2-2.5
 */
export const pacienteSchema = z.object({
  apellido: z.string().min(1, 'Apellido es requerido'),
  nombre: z.string().min(1, 'Nombre es requerido'),
  fechaNacimiento: z.date({
    required_error: 'Fecha de nacimiento es requerida',
  }).refine(date => date <= new Date(), {
    message: 'La fecha no puede ser futura',
  }),
  sexo: z.enum(['masculino', 'femenino', 'otro'], {
    required_error: 'Sexo es requerido',
  }),
});

/**
 * Schema para validar frecuencias de audiometría tonal
 * Requiere al menos 4 frecuencias completadas
 * Valida: Requirements 3.3-3.4
 */
export const frecuenciasSchema = z.object({
  '250': z.number().optional(),
  '500': z.number().optional(),
  '1000': z.number().optional(),
  '2000': z.number().optional(),
  '4000': z.number().optional(),
  '8000': z.number().optional(),
}).refine(
  (data) => {
    const completedCount = Object.values(data).filter(v => v !== undefined).length;
    return completedCount >= 4;
  },
  { message: 'Se requieren al menos 4 frecuencias completadas' }
);

/**
 * Schema para validar datos de audiometría tonal
 * Valida: Requirements 3.1-3.6
 */
export const audiometriaTonalSchema = z.object({
  tipo: z.literal('tonal'),
  oido_derecho: frecuenciasSchema,
  oido_izquierdo: frecuenciasSchema,
});

/**
 * Schema para validar datos de logoaudiometría
 * Valida: Requirements 4.1-4.8
 */
export const logoaudiometriaSchema = z.object({
  tipo: z.literal('logoaudiometria'),
  srt: z.object({
    derecho: z.number({ required_error: 'SRT OD es requerido' }),
    izquierdo: z.number({ required_error: 'SRT OI es requerido' }),
  }),
  sds: z.object({
    derecho: z.number({ required_error: 'SDS OD es requerido' })
      .min(0, 'SDS debe ser entre 0 y 100')
      .max(100, 'SDS debe ser entre 0 y 100'),
    izquierdo: z.number({ required_error: 'SDS OI es requerido' })
      .min(0, 'SDS debe ser entre 0 y 100')
      .max(100, 'SDS debe ser entre 0 y 100'),
  }),
});

/**
 * Schema para validar datos de timpanometría
 * Valida: Requirements 5.1-5.11
 */
export const timpanometriaSchema = z.object({
  tipo: z.literal('timpanometria'),
  derecho: z.object({
    tipoCurva: z.enum(['A', 'B', 'C', 'As', 'Ad'], {
      required_error: 'Tipo de curva OD es requerido',
    }),
    presionPico: z.number({ required_error: 'Presión pico OD es requerida' }),
    cumplimiento: z.number({ required_error: 'Cumplimiento OD es requerido' })
      .positive('Cumplimiento debe ser positivo'),
  }),
  izquierdo: z.object({
    tipoCurva: z.enum(['A', 'B', 'C', 'As', 'Ad'], {
      required_error: 'Tipo de curva OI es requerido',
    }),
    presionPico: z.number({ required_error: 'Presión pico OI es requerida' }),
    cumplimiento: z.number({ required_error: 'Cumplimiento OI es requerido' })
      .positive('Cumplimiento debe ser positivo'),
  }),
});

/**
 * Schema para validar datos del examinador
 * Valida: Requirements 6.1-6.6
 */
export const examinadorSchema = z.object({
  nombre: z.string().min(1, 'Nombre del examinador es requerido'),
  codigo: z.string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo dígitos'),
});

/**
 * Schema para validar evaluación auditiva completa
 * Valida: Requirements 7.1-7.2
 */
export const evaluacionAuditivaSchema = z.object({
  id: z.string().optional(),
  paciente: pacienteSchema,
  pruebas: z.array(
    z.discriminatedUnion('tipo', [
      audiometriaTonalSchema,
      logoaudiometriaSchema,
      timpanometriaSchema,
    ])
  ).min(1, 'Se requiere al menos una prueba')
   .max(3, 'Máximo 3 pruebas permitidas'),
  examinador: examinadorSchema,
  fechaExamen: z.date(),
});
