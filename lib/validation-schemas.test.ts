/**
 * Property-Based Tests for Validation Schemas
 * Feature: sistema-evaluacion-auditiva
 * 
 * These tests validate the correctness properties of the validation schemas
 * using fast-check for property-based testing with minimum 100 iterations.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  pacienteSchema,
  frecuenciasSchema,
  logoaudiometriaSchema,
  timpanometriaSchema,
  examinadorSchema,
} from './validation-schemas';

/**
 * Property 5: Patient Required Fields Validation
 * 
 * For any patient data object, if any of the fields (apellido, nombre, 
 * fechaNacimiento, sexo) is missing or empty, validation should fail 
 * and prevent report generation.
 * 
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5
 * Feature: sistema-evaluacion-auditiva, Property 5: Patient Required Fields Validation
 */
describe('Property 5: Patient Required Fields Validation', () => {
  it('should fail validation when any required field is missing or empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          apellido: fc.option(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { nil: undefined }),
          nombre: fc.option(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { nil: undefined }),
          fechaNacimiento: fc.option(fc.date({ max: new Date() }).filter(d => !isNaN(d.getTime())), { nil: undefined }),
          sexo: fc.option(fc.constantFrom('masculino', 'femenino', 'otro'), { nil: undefined }),
        }),
        (patientData) => {
          // Check if all required fields are present and non-empty
          const hasAllFields =
            patientData.apellido &&
            patientData.apellido.trim().length > 0 &&
            patientData.nombre &&
            patientData.nombre.trim().length > 0 &&
            patientData.fechaNacimiento &&
            !isNaN(patientData.fechaNacimiento.getTime()) &&
            patientData.sexo;

          const validationResult = pacienteSchema.safeParse(patientData);

          // If all fields are present and valid, validation should succeed
          // Otherwise, validation should fail
          if (hasAllFields) {
            expect(validationResult.success).toBe(true);
          } else {
            expect(validationResult.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when apellido is empty string', () => {
    fc.assert(
      fc.property(
        fc.record({
          apellido: fc.constant(''),
          nombre: fc.string({ minLength: 1 }),
          fechaNacimiento: fc.date({ max: new Date() }),
          sexo: fc.constantFrom('masculino', 'femenino', 'otro'),
        }),
        (patientData) => {
          const validationResult = pacienteSchema.safeParse(patientData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when nombre is empty string', () => {
    fc.assert(
      fc.property(
        fc.record({
          apellido: fc.string({ minLength: 1 }),
          nombre: fc.constant(''),
          fechaNacimiento: fc.date({ max: new Date() }),
          sexo: fc.constantFrom('masculino', 'femenino', 'otro'),
        }),
        (patientData) => {
          const validationResult = pacienteSchema.safeParse(patientData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Audiometry Minimum Frequencies Validation
 * 
 * For any audiometry data, if either ear has fewer than 4 frequencies 
 * with valid values, validation should fail.
 * 
 * Validates: Requirements 3.3, 3.4
 * Feature: sistema-evaluacion-auditiva, Property 7: Audiometry Minimum Frequencies Validation
 */
describe('Property 7: Audiometry Minimum Frequencies Validation', () => {
  it('should fail validation when fewer than 4 frequencies are provided', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        (numFrequencies) => {
          // Generate frequency data with exactly numFrequencies values
          const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
          const selectedFreqs = frequencies.slice(0, numFrequencies);
          
          const frequencyData: Record<string, number | undefined> = {
            '250': undefined,
            '500': undefined,
            '1000': undefined,
            '2000': undefined,
            '4000': undefined,
            '8000': undefined,
          };

          // Fill in the selected frequencies with random values
          selectedFreqs.forEach(freq => {
            frequencyData[freq] = Math.floor(Math.random() * 130) - 10; // -10 to 120 dB
          });

          const validationResult = frecuenciasSchema.safeParse(frequencyData);

          // Should pass only if 4 or more frequencies are provided
          if (numFrequencies >= 4) {
            expect(validationResult.success).toBe(true);
          } else {
            expect(validationResult.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when exactly 4 frequencies are provided', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 })
        ),
        ([f1, f2, f3, f4]) => {
          const frequencyData = {
            '250': f1,
            '500': f2,
            '1000': f3,
            '2000': f4,
            '4000': undefined,
            '8000': undefined,
          };

          const validationResult = frecuenciasSchema.safeParse(frequencyData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when all 6 frequencies are provided', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 }),
          fc.integer({ min: -10, max: 120 })
        ),
        ([f1, f2, f3, f4, f5, f6]) => {
          const frequencyData = {
            '250': f1,
            '500': f2,
            '1000': f3,
            '2000': f4,
            '4000': f5,
            '8000': f6,
          };

          const validationResult = frecuenciasSchema.safeParse(frequencyData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 10: Logoaudiometry Required Fields Validation
 * 
 * For any logoaudiometry data, if any of the four required fields 
 * (SRT OD, SRT OI, SDS OD, SDS OI) is missing, validation should fail.
 * 
 * Validates: Requirements 4.3, 4.4, 4.5, 4.6
 * Feature: sistema-evaluacion-auditiva, Property 10: Logoaudiometry Required Fields Validation
 */
describe('Property 10: Logoaudiometry Required Fields Validation', () => {
  it('should fail validation when any required field is missing', () => {
    fc.assert(
      fc.property(
        fc.record({
          tipo: fc.constant('logoaudiometria' as const),
          srt: fc.record({
            derecho: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
            izquierdo: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          }),
          sds: fc.record({
            derecho: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
            izquierdo: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          }),
        }),
        (logoData) => {
          const hasAllFields =
            logoData.srt.derecho !== undefined &&
            logoData.srt.izquierdo !== undefined &&
            logoData.sds.derecho !== undefined &&
            logoData.sds.izquierdo !== undefined;

          const validationResult = logoaudiometriaSchema.safeParse(logoData);

          if (hasAllFields) {
            expect(validationResult.success).toBe(true);
          } else {
            expect(validationResult.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when all required fields are present', () => {
    fc.assert(
      fc.property(
        fc.record({
          tipo: fc.constant('logoaudiometria' as const),
          srt: fc.record({
            derecho: fc.integer({ min: 0, max: 100 }),
            izquierdo: fc.integer({ min: 0, max: 100 }),
          }),
          sds: fc.record({
            derecho: fc.integer({ min: 0, max: 100 }),
            izquierdo: fc.integer({ min: 0, max: 100 }),
          }),
        }),
        (logoData) => {
          const validationResult = logoaudiometriaSchema.safeParse(logoData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 11: Logoaudiometry SDS Range Validation
 * 
 * For any SDS value, the system should accept values between 0 and 100 
 * inclusive, and reject values outside this range.
 * 
 * Validates: Requirements 4.8
 * Feature: sistema-evaluacion-auditiva, Property 11: Logoaudiometry SDS Range Validation
 */
describe('Property 11: Logoaudiometry SDS Range Validation', () => {
  it('should accept SDS values between 0 and 100 inclusive', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (sdsOD, sdsOI) => {
          const logoData = {
            tipo: 'logoaudiometria' as const,
            srt: {
              derecho: 50,
              izquierdo: 50,
            },
            sds: {
              derecho: sdsOD,
              izquierdo: sdsOI,
            },
          };

          const validationResult = logoaudiometriaSchema.safeParse(logoData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject SDS values outside 0-100 range', () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n < 0 || n > 100),
        (invalidSDS) => {
          const logoData = {
            tipo: 'logoaudiometria' as const,
            srt: {
              derecho: 50,
              izquierdo: 50,
            },
            sds: {
              derecho: invalidSDS,
              izquierdo: 50,
            },
          };

          const validationResult = logoaudiometriaSchema.safeParse(logoData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept boundary values 0 and 100', () => {
    const testCases = [
      { derecho: 0, izquierdo: 0 },
      { derecho: 100, izquierdo: 100 },
      { derecho: 0, izquierdo: 100 },
      { derecho: 100, izquierdo: 0 },
    ];

    testCases.forEach(sds => {
      const logoData = {
        tipo: 'logoaudiometria' as const,
        srt: {
          derecho: 50,
          izquierdo: 50,
        },
        sds,
      };

      const validationResult = logoaudiometriaSchema.safeParse(logoData);
      expect(validationResult.success).toBe(true);
    });
  });
});

/**
 * Property 13: Tympanometry Required Fields Validation
 * 
 * For any tympanometry data, if any of the six required fields 
 * (tipo, presión, cumplimiento for each ear) is missing, validation should fail.
 * 
 * Validates: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
 * Feature: sistema-evaluacion-auditiva, Property 13: Tympanometry Required Fields Validation
 */
describe('Property 13: Tympanometry Required Fields Validation', () => {
  it('should fail validation when any required field is missing', () => {
    fc.assert(
      fc.property(
        fc.record({
          tipo: fc.constant('timpanometria' as const),
          derecho: fc.record({
            tipoCurva: fc.option(fc.constantFrom('A', 'B', 'C', 'As', 'Ad'), { nil: undefined }),
            presionPico: fc.option(fc.integer({ min: -400, max: 200 }), { nil: undefined }),
            cumplimiento: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }), { nil: undefined }),
          }),
          izquierdo: fc.record({
            tipoCurva: fc.option(fc.constantFrom('A', 'B', 'C', 'As', 'Ad'), { nil: undefined }),
            presionPico: fc.option(fc.integer({ min: -400, max: 200 }), { nil: undefined }),
            cumplimiento: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }), { nil: undefined }),
          }),
        }),
        (timpData) => {
          const hasAllFields =
            timpData.derecho.tipoCurva !== undefined &&
            timpData.derecho.presionPico !== undefined &&
            timpData.derecho.cumplimiento !== undefined &&
            timpData.izquierdo.tipoCurva !== undefined &&
            timpData.izquierdo.presionPico !== undefined &&
            timpData.izquierdo.cumplimiento !== undefined;

          const validationResult = timpanometriaSchema.safeParse(timpData);

          if (hasAllFields && timpData.derecho.cumplimiento! > 0 && timpData.izquierdo.cumplimiento! > 0) {
            expect(validationResult.success).toBe(true);
          } else {
            expect(validationResult.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when all required fields are present', () => {
    fc.assert(
      fc.property(
        fc.record({
          tipo: fc.constant('timpanometria' as const),
          derecho: fc.record({
            tipoCurva: fc.constantFrom('A', 'B', 'C', 'As', 'Ad'),
            presionPico: fc.integer({ min: -400, max: 200 }),
            cumplimiento: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }).filter(n => !isNaN(n)),
          }),
          izquierdo: fc.record({
            tipoCurva: fc.constantFrom('A', 'B', 'C', 'As', 'Ad'),
            presionPico: fc.integer({ min: -400, max: 200 }),
            cumplimiento: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }).filter(n => !isNaN(n)),
          }),
        }),
        (timpData) => {
          const validationResult = timpanometriaSchema.safeParse(timpData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when cumplimiento is not positive', () => {
    fc.assert(
      fc.property(
        fc.float({ max: 0 }),
        (invalidCumplimiento) => {
          const timpData = {
            tipo: 'timpanometria' as const,
            derecho: {
              tipoCurva: 'A' as const,
              presionPico: 0,
              cumplimiento: invalidCumplimiento,
            },
            izquierdo: {
              tipoCurva: 'A' as const,
              presionPico: 0,
              cumplimiento: 1.5,
            },
          };

          const validationResult = timpanometriaSchema.safeParse(timpData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 15: Examiner Required Fields Validation
 * 
 * For any examiner data, if either nombre or codigo is missing or empty, 
 * validation should fail.
 * 
 * Validates: Requirements 6.3, 6.4
 * Feature: sistema-evaluacion-auditiva, Property 15: Examiner Required Fields Validation
 */
describe('Property 15: Examiner Required Fields Validation', () => {
  it('should fail validation when any required field is missing or empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          nombre: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          codigo: fc.option(
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 }).map(arr => arr.join('')),
            { nil: undefined }
          ),
        }),
        (examinerData) => {
          const hasAllFields =
            examinerData.nombre &&
            examinerData.nombre.length > 0 &&
            examinerData.codigo &&
            examinerData.codigo.length === 6;

          const validationResult = examinadorSchema.safeParse(examinerData);

          if (hasAllFields) {
            expect(validationResult.success).toBe(true);
          } else {
            expect(validationResult.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when nombre is empty string', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 }).map(arr => arr.join('')),
        (codigo) => {
          const examinerData = {
            nombre: '',
            codigo,
          };

          const validationResult = examinadorSchema.safeParse(examinerData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 16: Examiner Code Format Validation
 * 
 * For any examiner code, the system should accept exactly 6-digit numeric 
 * strings and reject any string that doesn't match this format.
 * 
 * Validates: Requirements 6.5, 6.6
 * Feature: sistema-evaluacion-auditiva, Property 16: Examiner Code Format Validation
 */
describe('Property 16: Examiner Code Format Validation', () => {
  it('should accept only 6-digit numeric strings', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (code) => {
          const is6Digits = /^\d{6}$/.test(code);
          
          const examinerData = {
            nombre: 'Test Examiner',
            codigo: code,
          };

          const validationResult = examinadorSchema.safeParse(examinerData);
          expect(validationResult.success).toBe(is6Digits);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid 6-digit codes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 }).map(arr => arr.join('')),
        (validCode) => {
          const examinerData = {
            nombre: 'Test Examiner',
            codigo: validCode,
          };

          const validationResult = examinadorSchema.safeParse(examinerData);
          expect(validationResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject codes with wrong length', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 10 })
          .map(arr => arr.join(''))
          .filter(s => s.length !== 6),
        (invalidCode) => {
          const examinerData = {
            nombre: 'Test Examiner',
            codigo: invalidCode,
          };

          const validationResult = examinadorSchema.safeParse(examinerData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject codes with non-numeric characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 6, maxLength: 6 }).filter(s => !/^\d{6}$/.test(s)),
        (invalidCode) => {
          const examinerData = {
            nombre: 'Test Examiner',
            codigo: invalidCode,
          };

          const validationResult = examinadorSchema.safeParse(examinerData);
          expect(validationResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
