/**
 * Property-Based Tests for Firebase Service
 * Feature: sistema-evaluacion-auditiva
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for property-based testing.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fc from "fast-check"
import { FirestoreService } from "./firebase-service"
import type {
  EvaluacionAuditiva,
  DatosAudiometriaTonal,
  DatosLogoaudiometria,
  DatosTimpanometria,
  Sexo,
  TipoCurvaTimpanometrica,
} from "@/types/evaluation"

// Custom arbitraries for generating valid test data

/**
 * Generates valid audiometry data with at least 4 frequencies per ear
 */
function generateAudiometriaTonal(): fc.Arbitrary<DatosAudiometriaTonal> {
  const frequencies = fc
    .record({
      "250": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
      "500": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
      "1000": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
      "2000": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
      "4000": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
      "8000": fc.option(fc.integer({ min: -10, max: 120 }), { nil: undefined }),
    })
    .filter((f) => {
      const count = Object.values(f).filter((v) => v !== undefined).length
      return count >= 4
    })

  return fc.record({
    tipo: fc.constant("tonal" as const),
    oido_derecho: frequencies,
    oido_izquierdo: frequencies,
  })
}

/**
 * Generates valid logoaudiometry data
 */
function generateLogoaudiometria(): fc.Arbitrary<DatosLogoaudiometria> {
  return fc.record({
    tipo: fc.constant("logoaudiometria" as const),
    srt: fc.record({
      derecho: fc.integer({ min: 0, max: 100 }),
      izquierdo: fc.integer({ min: 0, max: 100 }),
    }),
    sds: fc.record({
      derecho: fc.integer({ min: 0, max: 100 }),
      izquierdo: fc.integer({ min: 0, max: 100 }),
    }),
  })
}

/**
 * Generates valid tympanometry data
 */
function generateTimpanometria(): fc.Arbitrary<DatosTimpanometria> {
  const timpData = fc.record({
    tipoCurva: fc.constantFrom<TipoCurvaTimpanometrica>(
      "A",
      "B",
      "C",
      "As",
      "Ad"
    ),
    presionPico: fc.integer({ min: -400, max: 200 }),
    cumplimiento: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0), noNaN: true }),
  })

  return fc.record({
    tipo: fc.constant("timpanometria" as const),
    derecho: timpData,
    izquierdo: timpData,
  })
}

/**
 * Generates a valid complete evaluation
 */
function generateValidEvaluation(): fc.Arbitrary<EvaluacionAuditiva> {
  return fc.record({
    paciente: fc.record({
      apellido: fc.string({ minLength: 1, maxLength: 50 }),
      nombre: fc.string({ minLength: 1, maxLength: 50 }),
      fechaNacimiento: fc.date({ max: new Date() }),
      sexo: fc.constantFrom<Sexo>("masculino", "femenino", "otro"),
    }),
    pruebas: fc
      .array(
        fc.oneof(
          generateAudiometriaTonal(),
          generateLogoaudiometria(),
          generateTimpanometria()
        ),
        { minLength: 1, maxLength: 3 }
      )
      .map((pruebas) => {
        // Ensure no duplicate test types
        const seen = new Set<string>()
        return pruebas.filter((prueba) => {
          if (seen.has(prueba.tipo)) return false
          seen.add(prueba.tipo)
          return true
        })
      })
      .filter((pruebas) => pruebas.length > 0),
    examinador: fc.record({
      nombre: fc.string({ minLength: 1, maxLength: 50 }),
      codigo: fc
        .array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 })
        .map((digits) => digits.join("")),
    }),
    fechaExamen: fc.date(),
  })
}

describe("Firebase Service Property-Based Tests", () => {
  let service: FirestoreService
  const createdIds: string[] = []

  beforeAll(() => {
    service = new FirestoreService()
  })

  afterAll(async () => {
    // Clean up all created evaluations
    for (const id of createdIds) {
      try {
        await service.deleteEvaluation(id)
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  /**
   * Property 36: Firebase Save Round Trip
   * Validates: Requirements 13.1-13.8
   * 
   * For any valid evaluation, saving it to Firebase and then retrieving it
   * should return an evaluation with equivalent data.
   */
  describe("Property 36: Firebase Save Round Trip", () => {
    it("should retrieve equivalent data after saving", async () => {
      await fc.assert(
        fc.asyncProperty(generateValidEvaluation(), async (evaluation) => {
          // Save the evaluation
          const id = await service.saveEvaluation(evaluation)
          createdIds.push(id)

          // Retrieve the evaluation
          const retrieved = await service.getEvaluation(id)

          // Verify the data is equivalent
          expect(retrieved).not.toBeNull()
          expect(retrieved!.id).toBe(id)

          // Check patient data
          expect(retrieved!.paciente.apellido).toBe(evaluation.paciente.apellido)
          expect(retrieved!.paciente.nombre).toBe(evaluation.paciente.nombre)
          expect(retrieved!.paciente.sexo).toBe(evaluation.paciente.sexo)
          
          // Dates may differ slightly in precision, so check they represent the same day
          expect(retrieved!.paciente.fechaNacimiento.toDateString()).toBe(
            evaluation.paciente.fechaNacimiento.toDateString()
          )
          expect(retrieved!.fechaExamen.toDateString()).toBe(
            evaluation.fechaExamen.toDateString()
          )

          // Check examiner data
          expect(retrieved!.examinador.nombre).toBe(evaluation.examinador.nombre)
          expect(retrieved!.examinador.codigo).toBe(evaluation.examinador.codigo)

          // Check pruebas
          expect(retrieved!.pruebas).toHaveLength(evaluation.pruebas.length)
          expect(retrieved!.pruebas).toEqual(evaluation.pruebas)
        }),
        { numRuns: 20, timeout: 60000 } // Reduced runs for Firebase operations
      )
    }, 120000) // 2 minute timeout for property test
  })

  /**
   * Property 37: Firebase Unique ID Assignment
   * Validates: Requirements 13.6
   * 
   * For any two evaluations saved to Firebase, they should receive
   * different unique IDs.
   */
  describe("Property 37: Firebase Unique ID Assignment", () => {
    it("should assign different IDs to different evaluations", async () => {
      await fc.assert(
        fc.asyncProperty(
          generateValidEvaluation(),
          generateValidEvaluation(),
          async (eval1, eval2) => {
            const id1 = await service.saveEvaluation(eval1)
            const id2 = await service.saveEvaluation(eval2)

            createdIds.push(id1, id2)

            expect(id1).not.toBe(id2)
          }
        ),
        { numRuns: 10, timeout: 60000 }
      )
    }, 120000)
  })

  /**
   * Property 43: Search Case Insensitivity
   * Validates: Requirements 15.7
   * 
   * For any search query, the search should return the same results
   * regardless of whether the query uses uppercase or lowercase letters.
   */
  describe("Property 43: Search Case Insensitivity", () => {
    it("should return same results regardless of query case", async () => {
      // First, create some test evaluations
      const testEvaluations = await fc.sample(generateValidEvaluation(), 5)
      const testIds: string[] = []

      for (const evaluation of testEvaluations) {
        const id = await service.saveEvaluation(evaluation)
        testIds.push(id)
        createdIds.push(id)
      }

      // Now test case insensitivity
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 10 }),
          async (query) => {
            const lowerResults = await service.searchEvaluations(
              query.toLowerCase()
            )
            const upperResults = await service.searchEvaluations(
              query.toUpperCase()
            )
            const mixedResults = await service.searchEvaluations(query)

            // All three searches should return the same IDs
            const lowerIds = lowerResults.map((e) => e.id).sort()
            const upperIds = upperResults.map((e) => e.id).sort()
            const mixedIds = mixedResults.map((e) => e.id).sort()

            expect(lowerIds).toEqual(upperIds)
            expect(lowerIds).toEqual(mixedIds)
          }
        ),
        { numRuns: 10, timeout: 60000 }
      )
    }, 120000)
  })

  /**
   * Property 42: Search Filters Results
   * Validates: Requirements 15.2, 15.3, 15.4, 15.5
   * 
   * For any search query and list of evaluations, the filtered results
   * should only include evaluations where the query appears in either
   * apellido or nombre.
   */
  describe("Property 42: Search Filters Results", () => {
    it("should only return evaluations matching the query", async () => {
      // Create test evaluations with known names
      const testEval1 = await fc.sample(generateValidEvaluation(), 1)
      testEval1[0].paciente.apellido = "TestApellido"
      testEval1[0].paciente.nombre = "TestNombre"

      const testEval2 = await fc.sample(generateValidEvaluation(), 1)
      testEval2[0].paciente.apellido = "OtroApellido"
      testEval2[0].paciente.nombre = "OtroNombre"

      const id1 = await service.saveEvaluation(testEval1[0])
      const id2 = await service.saveEvaluation(testEval2[0])
      createdIds.push(id1, id2)

      // Search for "Test" should only return first evaluation
      const results = await service.searchEvaluations("Test")

      expect(results.length).toBeGreaterThan(0)
      const hasTestEval = results.some((e) => e.id === id1)
      expect(hasTestEval).toBe(true)

      // All results should contain "test" in apellido or nombre
      for (const result of results) {
        const matchesApellido = result.paciente.apellido
          .toLowerCase()
          .includes("test")
        const matchesNombre = result.paciente.nombre.toLowerCase().includes("test")
        expect(matchesApellido || matchesNombre).toBe(true)
      }
    }, 60000)
  })
})
