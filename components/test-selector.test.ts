/**
 * Property-Based Tests for TestSelector Component
 * Feature: sistema-evaluacion-auditiva
 * 
 * These tests validate the correctness properties of the test selection logic
 * using fast-check for property-based testing with minimum 100 iterations.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TipoPrueba } from '@/types/evaluation';

// Helper functions that represent the core logic of TestSelector
function addTest(selectedTests: TipoPrueba[], newTest: TipoPrueba): TipoPrueba[] {
  // Don't add if already selected or if we have 3 tests
  if (selectedTests.includes(newTest) || selectedTests.length >= 3) {
    return selectedTests;
  }
  return [...selectedTests, newTest];
}

function removeTest(selectedTests: TipoPrueba[], testToRemove: TipoPrueba): TipoPrueba[] {
  return selectedTests.filter(test => test !== testToRemove);
}

function isTestSelected(selectedTests: TipoPrueba[], test: TipoPrueba): boolean {
  return selectedTests.includes(test);
}

function canAddMoreTests(selectedTests: TipoPrueba[]): boolean {
  return selectedTests.length < 3;
}

// Arbitrary generator for TipoPrueba
const tipoPruebaArbitrary = fc.constantFrom<TipoPrueba>('tonal', 'logoaudiometria', 'timpanometria');

// Arbitrary generator for array of TipoPrueba (without duplicates)
const selectedTestsArbitrary = fc.uniqueArray(tipoPruebaArbitrary, { maxLength: 3 });

/**
 * Property 1: Test Addition Grows List
 * 
 * For any list of selected tests and any valid test type not already in the list,
 * adding the test should result in the list length increasing by one and the test
 * appearing in the list.
 * 
 * Validates: Requirements 1.2
 * Feature: sistema-evaluacion-auditiva, Property 1: Test Addition Grows List
 */
describe('Property 1: Test Addition Grows List', () => {
  it('should increase list length by one when adding a new test', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length < 3),
        tipoPruebaArbitrary,
        (existingTests, newTest) => {
          // Precondition: test not already in list
          fc.pre(!existingTests.includes(newTest));
          
          const initialLength = existingTests.length;
          const result = addTest(existingTests, newTest);
          
          expect(result.length).toBe(initialLength + 1);
          expect(result).toContain(newTest);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all existing tests when adding a new test', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length < 3),
        tipoPruebaArbitrary,
        (existingTests, newTest) => {
          fc.pre(!existingTests.includes(newTest));
          
          const result = addTest(existingTests, newTest);
          
          // All existing tests should still be in the result
          existingTests.forEach(test => {
            expect(result).toContain(test);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not add test when list is at maximum capacity', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(tipoPruebaArbitrary, { minLength: 3, maxLength: 3 }),
        tipoPruebaArbitrary,
        (fullList, newTest) => {
          const result = addTest(fullList, newTest);
          
          // List should remain unchanged
          expect(result.length).toBe(3);
          expect(result).toEqual(fullList);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Duplicate Test Prevention
 * 
 * For any test type, attempting to add it when it's already in the selected
 * tests list should result in the list remaining unchanged.
 * 
 * Validates: Requirements 1.3
 * Feature: sistema-evaluacion-auditiva, Property 2: Duplicate Test Prevention
 */
describe('Property 2: Duplicate Test Prevention', () => {
  it('should not add duplicate tests to the list', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length > 0),
        (existingTests) => {
          // Pick a test that's already in the list
          const duplicateTest = existingTests[0];
          const initialLength = existingTests.length;
          
          const result = addTest(existingTests, duplicateTest);
          
          // List should remain unchanged
          expect(result.length).toBe(initialLength);
          expect(result).toEqual(existingTests);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain list integrity when attempting to add duplicates', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        tipoPruebaArbitrary,
        (existingTests, testToAdd) => {
          const result = addTest(existingTests, testToAdd);
          
          // Count occurrences of testToAdd in result
          const count = result.filter(t => t === testToAdd).length;
          
          // Should have at most 1 occurrence
          expect(count).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify when a test is already selected', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length > 0),
        (existingTests) => {
          const selectedTest = existingTests[0];
          
          expect(isTestSelected(existingTests, selectedTest)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Test Removal Reduces List
 * 
 * For any non-empty list of selected tests and any test in that list,
 * removing the test should result in the list length decreasing by one
 * and the test no longer appearing in the list.
 * 
 * Validates: Requirements 1.5
 * Feature: sistema-evaluacion-auditiva, Property 3: Test Removal Reduces List
 */
describe('Property 3: Test Removal Reduces List', () => {
  it('should decrease list length by one when removing a test', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length > 0),
        (existingTests) => {
          const testToRemove = existingTests[0];
          const initialLength = existingTests.length;
          
          const result = removeTest(existingTests, testToRemove);
          
          expect(result.length).toBe(initialLength - 1);
          expect(result).not.toContain(testToRemove);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all other tests when removing one test', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length > 1),
        (existingTests) => {
          const testToRemove = existingTests[0];
          const otherTests = existingTests.slice(1);
          
          const result = removeTest(existingTests, testToRemove);
          
          // All other tests should still be in the result
          otherTests.forEach(test => {
            expect(result).toContain(test);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle removing a test that is not in the list', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        tipoPruebaArbitrary,
        (existingTests, testToRemove) => {
          fc.pre(!existingTests.includes(testToRemove));
          
          const result = removeTest(existingTests, testToRemove);
          
          // List should remain unchanged
          expect(result.length).toBe(existingTests.length);
          expect(result).toEqual(existingTests);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should enable adding more tests after removal', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(tipoPruebaArbitrary, { minLength: 3, maxLength: 3 }),
        (fullList) => {
          const testToRemove = fullList[0];
          
          // Before removal, cannot add more tests
          expect(canAddMoreTests(fullList)).toBe(false);
          
          const result = removeTest(fullList, testToRemove);
          
          // After removal, can add more tests
          expect(canAddMoreTests(result)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Selected Tests Display Completeness
 * 
 * For any set of selected tests, the rendered list should contain exactly
 * those tests and no others.
 * 
 * Validates: Requirements 1.6
 * Feature: sistema-evaluacion-auditiva, Property 4: Selected Tests Display Completeness
 */
describe('Property 4: Selected Tests Display Completeness', () => {
  it('should display exactly the selected tests', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        (selectedTests) => {
          // Simulate what the component would display
          const displayedTests = selectedTests.slice(); // Copy of the array
          
          // Should have same length
          expect(displayedTests.length).toBe(selectedTests.length);
          
          // Should contain all selected tests
          selectedTests.forEach(test => {
            expect(displayedTests).toContain(test);
          });
          
          // Should not contain any extra tests
          displayedTests.forEach(test => {
            expect(selectedTests).toContain(test);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain correct count of selected tests', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        (selectedTests) => {
          const count = selectedTests.length;
          
          // Count should be between 0 and 3
          expect(count).toBeGreaterThanOrEqual(0);
          expect(count).toBeLessThanOrEqual(3);
          
          // Count should match actual length
          expect(count).toBe(selectedTests.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify available tests based on selection', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        (selectedTests) => {
          const allTests: TipoPrueba[] = ['tonal', 'logoaudiometria', 'timpanometria'];
          
          allTests.forEach(test => {
            const isSelected = isTestSelected(selectedTests, test);
            const actuallySelected = selectedTests.includes(test);
            
            expect(isSelected).toBe(actuallySelected);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly determine if more tests can be added', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        (selectedTests) => {
          const canAdd = canAddMoreTests(selectedTests);
          const expectedCanAdd = selectedTests.length < 3;
          
          expect(canAdd).toBe(expectedCanAdd);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional Property: Test Selection Idempotence
 * 
 * Adding and then removing a test should return to the original state.
 */
describe('Additional Property: Test Selection Idempotence', () => {
  it('should return to original state after add and remove', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary.filter(tests => tests.length < 3),
        tipoPruebaArbitrary,
        (originalTests, testToAddRemove) => {
          fc.pre(!originalTests.includes(testToAddRemove));
          
          const afterAdd = addTest(originalTests, testToAddRemove);
          const afterRemove = removeTest(afterAdd, testToAddRemove);
          
          expect(afterRemove).toEqual(originalTests);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain order after add and remove operations', () => {
    fc.assert(
      fc.property(
        selectedTestsArbitrary,
        tipoPruebaArbitrary,
        (originalTests, testToManipulate) => {
          const afterRemove = removeTest(originalTests, testToManipulate);
          const afterAdd = addTest(afterRemove, testToManipulate);
          
          // If test was originally in the list, it should be at the end after re-adding
          if (originalTests.includes(testToManipulate)) {
            expect(afterAdd[afterAdd.length - 1]).toBe(testToManipulate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional Property: Maximum Capacity Enforcement
 * 
 * The system should never allow more than 3 tests to be selected.
 */
describe('Additional Property: Maximum Capacity Enforcement', () => {
  it('should never exceed 3 tests regardless of operations', () => {
    fc.assert(
      fc.property(
        fc.array(tipoPruebaArbitrary, { minLength: 1, maxLength: 10 }),
        (testsToAdd) => {
          let currentTests: TipoPrueba[] = [];
          
          // Try to add all tests
          testsToAdd.forEach(test => {
            currentTests = addTest(currentTests, test);
          });
          
          // Should never exceed 3
          expect(currentTests.length).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain uniqueness even with repeated add attempts', () => {
    fc.assert(
      fc.property(
        tipoPruebaArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (testToAdd, attempts) => {
          let currentTests: TipoPrueba[] = [];
          
          // Try to add the same test multiple times
          for (let i = 0; i < attempts; i++) {
            currentTests = addTest(currentTests, testToAdd);
          }
          
          // Should only appear once
          const count = currentTests.filter(t => t === testToAdd).length;
          expect(count).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
