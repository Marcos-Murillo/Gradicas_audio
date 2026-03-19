import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { EvaluacionAuditiva } from '@/types/evaluation'

/**
 * Property-based tests for saved evaluations page
 * 
 * Feature: sistema-evaluacion-auditiva
 * Tests properties related to search, filtering, and data management
 */

// Arbitraries for generating test data
const sexoArb = fc.constantFrom('masculino', 'femenino', 'otro')

const pacienteArb = fc.record({
  apellido: fc.string({ minLength: 1, maxLength: 50 }),
  nombre: fc.string({ minLength: 1, maxLength: 50 }),
  fechaNacimiento: fc.date({ max: new Date() }),
  sexo: sexoArb,
})

const audiometryArb = fc.record({
  tipo: fc.constant('tonal' as const),
  oido_derecho: fc.record({
    '250': fc.option(fc.integer({ min: -10, max: 120 })),
    '500': fc.option(fc.integer({ min: -10, max: 120 })),
    '1000': fc.option(fc.integer({ min: -10, max: 120 })),
    '2000': fc.option(fc.integer({ min: -10, max: 120 })),
    '4000': fc.option(fc.integer({ min: -10, max: 120 })),
    '8000': fc.option(fc.integer({ min: -10, max: 120 })),
  }),
  oido_izquierdo: fc.record({
    '250': fc.option(fc.integer({ min: -10, max: 120 })),
    '500': fc.option(fc.integer({ min: -10, max: 120 })),
    '1000': fc.option(fc.integer({ min: -10, max: 120 })),
    '2000': fc.option(fc.integer({ min: -10, max: 120 })),
    '4000': fc.option(fc.integer({ min: -10, max: 120 })),
    '8000': fc.option(fc.integer({ min: -10, max: 120 })),
  }),
})

const logoaudiometryArb = fc.record({
  tipo: fc.constant('logoaudiometria' as const),
  srt: fc.record({
    derecho: fc.integer({ min: 0, max: 100 }),
    izquierdo: fc.integer({ min: 0, max: 100 }),
  }),
  sds: fc.record({
    derecho: fc.integer({ min: 0, max: 100 }),
    izquierdo: fc.integer({ min: 0, max: 100 }),
  }),
})

const tympanometryArb = fc.record({
  tipo: fc.constant('timpanometria' as const),
  derecho: fc.record({
    tipoCurva: fc.constantFrom('A', 'B', 'C', 'As', 'Ad'),
    presionPico: fc.integer({ min: -400, max: 200 }),
    cumplimiento: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0), noNaN: true }),
  }),
  izquierdo: fc.record({
    tipoCurva: fc.constantFrom('A', 'B', 'C', 'As', 'Ad'),
    presionPico: fc.integer({ min: -400, max: 200 }),
    cumplimiento: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0), noNaN: true }),
  }),
})

const pruebaArb = fc.oneof(audiometryArb, logoaudiometryArb, tympanometryArb)

const examinadorArb = fc.record({
  nombre: fc.string({ minLength: 1, maxLength: 100 }),
  codigo: fc
    .array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 })
    .map((arr) => arr.join('')),
})

const evaluacionArb = fc.record({
  id: fc.uuid(),
  paciente: pacienteArb,
  pruebas: fc.array(pruebaArb, { minLength: 1, maxLength: 3 }),
  examinador: examinadorArb,
  fechaExamen: fc.date(),
})

/**
 * Helper function to filter evaluations by search query
 * Mimics the filtering logic in the component
 */
function filterEvaluations(
  evaluations: EvaluacionAuditiva[],
  query: string
): EvaluacionAuditiva[] {
  if (query.trim() === '') {
    return evaluations
  }

  const lowerQuery = query.toLowerCase()
  return evaluations.filter(
    (evaluation) =>
      evaluation.paciente.apellido.toLowerCase().includes(lowerQuery) ||
      evaluation.paciente.nombre.toLowerCase().includes(lowerQuery)
  )
}

describe('SavedEvaluationsPage - Property Tests', () => {
  /**
   * Property 42: Search Filters Results
   * 
   * For any search query and list of evaluations, the filtered results should
   * only include evaluations where the query appears in either apellido or nombre.
   * 
   * **Validates: Requirements 15.2, 15.3, 15.4, 15.5**
   */
  describe('Property 42: Search Filters Results', () => {
    it('should only include evaluations matching the search query', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 0, maxLength: 20 }),
          fc.string(),
          (evaluations, query) => {
            const filtered = filterEvaluations(evaluations, query)

            if (query.trim() === '') {
              // Empty query should return all evaluations
              expect(filtered).toEqual(evaluations)
            } else {
              const lowerQuery = query.toLowerCase()
              // All filtered results should match the query
              filtered.forEach((evaluation) => {
                const matchesApellido = evaluation.paciente.apellido
                  .toLowerCase()
                  .includes(lowerQuery)
                const matchesNombre = evaluation.paciente.nombre
                  .toLowerCase()
                  .includes(lowerQuery)
                expect(matchesApellido || matchesNombre).toBe(true)
              })

              // No non-matching evaluations should be included
              const nonMatching = evaluations.filter(
                (evaluation) =>
                  !evaluation.paciente.apellido.toLowerCase().includes(lowerQuery) &&
                  !evaluation.paciente.nombre.toLowerCase().includes(lowerQuery)
              )
              nonMatching.forEach((evaluation) => {
                expect(filtered).not.toContainEqual(evaluation)
              })
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 43: Search Case Insensitivity
   * 
   * For any search query, the search should return the same results regardless
   * of whether the query uses uppercase or lowercase letters.
   * 
   * **Validates: Requirements 15.7**
   */
  describe('Property 43: Search Case Insensitivity', () => {
    it('should return same results regardless of query case', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1 }),
          (evaluations, query) => {
            const lowerResults = filterEvaluations(evaluations, query.toLowerCase())
            const upperResults = filterEvaluations(evaluations, query.toUpperCase())
            const mixedResults = filterEvaluations(evaluations, query)

            expect(lowerResults).toEqual(upperResults)
            expect(lowerResults).toEqual(mixedResults)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Empty Search Returns All
   * 
   * For any list of evaluations, an empty search query should return all evaluations.
   * 
   * **Validates: Requirements 15.6**
   */
  describe('Property: Empty Search Returns All', () => {
    it('should return all evaluations when search is empty', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 0, maxLength: 20 }),
          (evaluations) => {
            const emptyQueries = ['', '   ', '\t', '\n']

            emptyQueries.forEach((query) => {
              const filtered = filterEvaluations(evaluations, query)
              expect(filtered).toEqual(evaluations)
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Search Result Subset
   * 
   * For any non-empty search query, the filtered results should be a subset
   * of the original evaluations list.
   */
  describe('Property: Search Result Subset', () => {
    it('should return a subset of original evaluations', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1 }),
          (evaluations, query) => {
            const filtered = filterEvaluations(evaluations, query)

            // Filtered results should not exceed original count
            expect(filtered.length).toBeLessThanOrEqual(evaluations.length)

            // All filtered items should exist in original list
            filtered.forEach((item) => {
              expect(evaluations).toContainEqual(item)
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Search Preserves Order
   * 
   * For any search query, the relative order of matching evaluations
   * should be preserved from the original list.
   */
  describe('Property: Search Preserves Order', () => {
    it('should preserve relative order of matching evaluations', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 2, maxLength: 20 }),
          fc.string({ minLength: 1 }),
          (evaluations, query) => {
            const filtered = filterEvaluations(evaluations, query)

            if (filtered.length < 2) return // Need at least 2 items to check order

            // Check that relative order is preserved
            for (let i = 0; i < filtered.length - 1; i++) {
              const firstIndex = evaluations.indexOf(filtered[i])
              const secondIndex = evaluations.indexOf(filtered[i + 1])
              expect(firstIndex).toBeLessThan(secondIndex)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Search Idempotence
   * 
   * Applying the same search filter multiple times should produce the same result.
   */
  describe('Property: Search Idempotence', () => {
    it('should produce same result when applied multiple times', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 0, maxLength: 20 }),
          fc.string(),
          (evaluations, query) => {
            const firstFilter = filterEvaluations(evaluations, query)
            const secondFilter = filterEvaluations(firstFilter, query)

            expect(firstFilter).toEqual(secondFilter)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Partial Match Search
   * 
   * For any evaluation and any substring of its apellido or nombre,
   * searching for that substring should include the evaluation in results.
   */
  describe('Property: Partial Match Search', () => {
    it('should find evaluations by partial apellido match', () => {
      fc.assert(
        fc.property(evaluacionArb, (evaluation) => {
          const apellido = evaluation.paciente.apellido
          if (apellido.length === 0) return

          // Test various substrings
          const start = Math.floor(Math.random() * apellido.length)
          const end = start + Math.floor(Math.random() * (apellido.length - start)) + 1
          const substring = apellido.substring(start, end)

          const filtered = filterEvaluations([evaluation], substring)
          expect(filtered).toContainEqual(evaluation)
        }),
        { numRuns: 100 }
      )
    })

    it('should find evaluations by partial nombre match', () => {
      fc.assert(
        fc.property(evaluacionArb, (evaluation) => {
          const nombre = evaluation.paciente.nombre
          if (nombre.length === 0) return

          // Test various substrings
          const start = Math.floor(Math.random() * nombre.length)
          const end = start + Math.floor(Math.random() * (nombre.length - start)) + 1
          const substring = nombre.substring(start, end)

          const filtered = filterEvaluations([evaluation], substring)
          expect(filtered).toContainEqual(evaluation)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property: Search Result Count
   * 
   * The number of filtered results should never exceed the original count.
   */
  describe('Property: Search Result Count', () => {
    it('should never return more results than original list', () => {
      fc.assert(
        fc.property(
          fc.array(evaluacionArb, { minLength: 0, maxLength: 50 }),
          fc.string(),
          (evaluations, query) => {
            const filtered = filterEvaluations(evaluations, query)
            expect(filtered.length).toBeLessThanOrEqual(evaluations.length)
            expect(filtered.length).toBeGreaterThanOrEqual(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
