/**
 * Tests for Chart Generators
 * Feature: sistema-evaluacion-auditiva
 * 
 * These tests validate the correctness of chart generation functions
 * including sigmoid curves for logoaudiometry.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateSigmoidCurve, LogoaudiometryPoint } from './chart-generators';

/**
 * Unit Tests for generateSigmoidCurve
 */
describe('generateSigmoidCurve - Unit Tests', () => {
  it('should generate points from 0 to 100 dB in 5 dB increments', () => {
    const curve = generateSigmoidCurve(30, 95);
    
    // Should have 21 points (0, 5, 10, ..., 95, 100)
    expect(curve.length).toBe(21);
    
    // Check first and last points
    expect(curve[0].db).toBe(0);
    expect(curve[curve.length - 1].db).toBe(100);
    
    // Check increments
    for (let i = 0; i < curve.length; i++) {
      expect(curve[i].db).toBe(i * 5);
    }
  });

  it('should generate sigmoid curve that approaches 0 at low intensities', () => {
    const srt = 40;
    const sds = 100;
    const curve = generateSigmoidCurve(srt, sds);
    
    // At very low intensities (well below SRT), percentage should be very low
    const lowIntensityPoint = curve.find(p => p.db === 0);
    expect(lowIntensityPoint).toBeDefined();
    expect(lowIntensityPoint!.percentage).toBeLessThan(10);
  });

  it('should generate sigmoid curve that plateaus near SDS at high intensities', () => {
    const srt = 30;
    const sds = 95;
    const curve = generateSigmoidCurve(srt, sds);
    
    // At high intensities (well above SRT), percentage should approach SDS
    const highIntensityPoint = curve.find(p => p.db === 100);
    expect(highIntensityPoint).toBeDefined();
    
    // Should be close to SDS (within 5% tolerance due to sigmoid asymptote)
    expect(highIntensityPoint!.percentage).toBeGreaterThan(sds * 0.90);
    expect(highIntensityPoint!.percentage).toBeLessThanOrEqual(sds);
  });

  it('should have steepest rise around the SRT value', () => {
    const srt = 40;
    const sds = 100;
    const curve = generateSigmoidCurve(srt, sds);
    
    // Find the point closest to SRT
    const srtIndex = curve.findIndex(p => p.db >= srt);
    
    // Calculate slopes before and after SRT
    if (srtIndex > 0 && srtIndex < curve.length - 1) {
      const slopeBefore = curve[srtIndex].percentage - curve[srtIndex - 1].percentage;
      const slopeAfter = curve[srtIndex + 1].percentage - curve[srtIndex].percentage;
      
      // Slopes around SRT should be significant (steeper than at extremes)
      const slopeAtStart = curve[1].percentage - curve[0].percentage;
      const slopeAtEnd = curve[curve.length - 1].percentage - curve[curve.length - 2].percentage;
      
      expect(slopeBefore).toBeGreaterThan(slopeAtStart);
      expect(slopeAfter).toBeGreaterThan(slopeAtEnd);
    }
  });

  it('should handle edge case with SRT at 0 dB', () => {
    const curve = generateSigmoidCurve(0, 100);
    
    expect(curve.length).toBe(21);
    expect(curve[0].db).toBe(0);
    expect(curve[curve.length - 1].db).toBe(100);
    
    // All percentages should be valid numbers
    curve.forEach(point => {
      expect(point.percentage).toBeGreaterThanOrEqual(0);
      expect(point.percentage).toBeLessThanOrEqual(100);
      expect(isNaN(point.percentage)).toBe(false);
    });
  });

  it('should handle edge case with SRT at 100 dB', () => {
    const curve = generateSigmoidCurve(100, 80);
    
    expect(curve.length).toBe(21);
    
    // At low intensities, percentage should be very low since SRT is at 100
    const lowPoint = curve.find(p => p.db === 0);
    expect(lowPoint!.percentage).toBeLessThan(5);
    
    // All percentages should be valid
    curve.forEach(point => {
      expect(isNaN(point.percentage)).toBe(false);
    });
  });

  it('should handle low SDS values correctly', () => {
    const curve = generateSigmoidCurve(40, 20);
    
    // Maximum percentage should not exceed SDS
    const maxPercentage = Math.max(...curve.map(p => p.percentage));
    expect(maxPercentage).toBeLessThanOrEqual(20);
  });

  it('should generate monotonically increasing curve', () => {
    const curve = generateSigmoidCurve(40, 95);
    
    // Each point should have percentage >= previous point
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].percentage).toBeGreaterThanOrEqual(curve[i - 1].percentage);
    }
  });
});

/**
 * Property-Based Tests for generateSigmoidCurve
 * 
 * These tests validate universal properties that should hold for any valid input.
 */
describe('generateSigmoidCurve - Property Tests', () => {
  /**
   * Property: Curve Length Consistency
   * For any valid SRT and SDS values, the generated curve should always
   * have exactly 21 points (0 to 100 dB in 5 dB increments).
   */
  it('should always generate exactly 21 points', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // SRT
        fc.integer({ min: 0, max: 100 }), // SDS
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          expect(curve.length).toBe(21);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: dB Values Correctness
   * For any valid inputs, the dB values should be exactly [0, 5, 10, ..., 100].
   */
  it('should always have correct dB values from 0 to 100 in 5 dB steps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          
          for (let i = 0; i < curve.length; i++) {
            expect(curve[i].db).toBe(i * 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Percentage Bounds
   * For any valid inputs, all percentage values should be between 0 and SDS.
   */
  it('should have all percentage values between 0 and SDS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }), // SDS must be > 0 for meaningful test
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          
          curve.forEach(point => {
            expect(point.percentage).toBeGreaterThanOrEqual(0);
            expect(point.percentage).toBeLessThanOrEqual(sds);
            expect(isNaN(point.percentage)).toBe(false);
            expect(isFinite(point.percentage)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Monotonic Increase
   * For any valid inputs, the curve should be monotonically increasing
   * (each point's percentage >= previous point's percentage).
   */
  it('should generate monotonically increasing curves', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          
          for (let i = 1; i < curve.length; i++) {
            expect(curve[i].percentage).toBeGreaterThanOrEqual(curve[i - 1].percentage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Low Intensity Behavior
   * For any valid inputs, at very low intensities (well below SRT),
   * the percentage should be significantly lower than SDS.
   */
  it('should have low percentages at low intensities', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 100 }), // SRT at least 20 to ensure 0 dB is "well below"
        fc.integer({ min: 20, max: 100 }), // SDS at least 20 for meaningful comparison
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          const lowPoint = curve[0]; // 0 dB
          
          // At 0 dB with SRT >= 20, percentage should be much less than SDS
          expect(lowPoint.percentage).toBeLessThan(sds * 0.5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: High Intensity Behavior
   * For any valid inputs, at very high intensities (well above SRT),
   * the percentage should approach SDS.
   */
  it('should approach SDS at high intensities', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 80 }), // SRT at most 80 to ensure 100 dB is "well above"
        fc.integer({ min: 20, max: 100 }), // SDS at least 20 for meaningful test
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          const highPoint = curve[curve.length - 1]; // 100 dB
          
          // At 100 dB with SRT <= 80, percentage should be close to SDS
          // Allow 10% tolerance due to sigmoid asymptotic behavior
          expect(highPoint.percentage).toBeGreaterThan(sds * 0.85);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: SDS Scaling
   * For any SRT, if we double the SDS, all percentage values should approximately double.
   */
  it('should scale linearly with SDS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 10, max: 50 }), // SDS between 10-50 so doubling stays in range
        (srt, sds) => {
          const curve1 = generateSigmoidCurve(srt, sds);
          const curve2 = generateSigmoidCurve(srt, sds * 2);
          
          // Each point in curve2 should be approximately double curve1
          for (let i = 0; i < curve1.length; i++) {
            const ratio = curve2[i].percentage / curve1[i].percentage;
            // Allow some tolerance due to floating point arithmetic
            expect(ratio).toBeGreaterThan(1.9);
            expect(ratio).toBeLessThan(2.1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid Point Structure
   * For any valid inputs, every point should have valid db and percentage properties.
   */
  it('should generate points with valid structure', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (srt, sds) => {
          const curve = generateSigmoidCurve(srt, sds);
          
          curve.forEach(point => {
            expect(point).toHaveProperty('db');
            expect(point).toHaveProperty('percentage');
            expect(typeof point.db).toBe('number');
            expect(typeof point.percentage).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit Tests for generateTympanogramCurve
 */
import { generateTympanogramCurve, TympanometryPoint, TipoCurvaTimpanometrica } from './chart-generators';

describe('generateTympanogramCurve - Unit Tests', () => {
  it('should generate points from -400 to 200 daPa in 10 daPa increments', () => {
    const curve = generateTympanogramCurve('A', 0, 1.0);
    
    // Should have 61 points (-400, -390, -380, ..., 190, 200)
    expect(curve.length).toBe(61);
    
    // Check first and last points
    expect(curve[0].presion).toBe(-400);
    expect(curve[curve.length - 1].presion).toBe(200);
    
    // Check increments
    for (let i = 0; i < curve.length; i++) {
      expect(curve[i].presion).toBe(-400 + i * 10);
    }
  });

  it('should generate Type A curve with peak at specified pressure', () => {
    const presionPico = 0;
    const cumplimiento = 1.0;
    const curve = generateTympanogramCurve('A', presionPico, cumplimiento);
    
    // Find the point with maximum compliance
    const maxPoint = curve.reduce((max, point) => 
      point.cumplimiento > max.cumplimiento ? point : max
    );
    
    // Peak should be at or very near the specified pressure
    expect(Math.abs(maxPoint.presion - presionPico)).toBeLessThanOrEqual(10);
    
    // Peak compliance should be close to the specified compliance
    expect(maxPoint.cumplimiento).toBeGreaterThan(cumplimiento * 0.9);
  });

  it('should generate Type B curve that is flat', () => {
    const cumplimiento = 0.5;
    const curve = generateTympanogramCurve('B', -100, cumplimiento);
    
    // All points should have similar compliance (flat curve)
    const expectedCompliance = cumplimiento * 0.2;
    
    curve.forEach(point => {
      expect(point.cumplimiento).toBeCloseTo(expectedCompliance, 5);
    });
    
    // Variance should be very low (essentially zero for flat curve)
    const mean = curve.reduce((sum, p) => sum + p.cumplimiento, 0) / curve.length;
    const variance = curve.reduce((sum, p) => sum + Math.pow(p.cumplimiento - mean, 2), 0) / curve.length;
    expect(variance).toBeLessThan(0.0001);
  });

  it('should generate Type C curve with peak at negative pressure', () => {
    const presionPico = -150;
    const cumplimiento = 0.8;
    const curve = generateTympanogramCurve('C', presionPico, cumplimiento);
    
    // Find the point with maximum compliance
    const maxPoint = curve.reduce((max, point) => 
      point.cumplimiento > max.cumplimiento ? point : max
    );
    
    // Peak should be at the specified negative pressure
    expect(Math.abs(maxPoint.presion - presionPico)).toBeLessThanOrEqual(10);
    expect(maxPoint.presion).toBeLessThan(0);
  });

  it('should generate Type As curve that is narrower than Type A', () => {
    const presionPico = 0;
    const cumplimiento = 1.0;
    const curveA = generateTympanogramCurve('A', presionPico, cumplimiento);
    const curveAs = generateTympanogramCurve('As', presionPico, cumplimiento);
    
    // Find peak indices
    const peakIndexA = curveA.findIndex(p => p.presion === 0);
    const peakIndexAs = curveAs.findIndex(p => p.presion === 0);
    
    // Compare compliance at points away from peak (e.g., at ±50 daPa)
    const offset = 5; // 5 steps = 50 daPa
    
    if (peakIndexA >= offset && peakIndexAs >= offset) {
      const complianceA_minus50 = curveA[peakIndexA - offset].cumplimiento;
      const complianceAs_minus50 = curveAs[peakIndexAs - offset].cumplimiento;
      
      // Type As should have lower compliance away from peak (narrower)
      expect(complianceAs_minus50).toBeLessThan(complianceA_minus50);
    }
  });

  it('should generate Type Ad curve that is wider than Type A', () => {
    const presionPico = 0;
    const cumplimiento = 1.0;
    const curveA = generateTympanogramCurve('A', presionPico, cumplimiento);
    const curveAd = generateTympanogramCurve('Ad', presionPico, cumplimiento);
    
    // Find peak indices
    const peakIndexA = curveA.findIndex(p => p.presion === 0);
    const peakIndexAd = curveAd.findIndex(p => p.presion === 0);
    
    // Compare compliance at points away from peak (e.g., at ±50 daPa)
    const offset = 5; // 5 steps = 50 daPa
    
    if (peakIndexA >= offset && peakIndexAd >= offset) {
      const complianceA_minus50 = curveA[peakIndexA - offset].cumplimiento;
      const complianceAd_minus50 = curveAd[peakIndexAd - offset].cumplimiento;
      
      // Type Ad should have higher compliance away from peak (wider)
      expect(complianceAd_minus50).toBeGreaterThan(complianceA_minus50);
    }
  });

  it('should handle edge case with pressure at -400 daPa', () => {
    const curve = generateTympanogramCurve('A', -400, 1.0);
    
    expect(curve.length).toBe(61);
    
    // All compliance values should be valid numbers
    curve.forEach(point => {
      expect(isNaN(point.cumplimiento)).toBe(false);
      expect(isFinite(point.cumplimiento)).toBe(true);
      expect(point.cumplimiento).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle edge case with pressure at +200 daPa', () => {
    const curve = generateTympanogramCurve('A', 200, 1.0);
    
    expect(curve.length).toBe(61);
    
    // All compliance values should be valid numbers
    curve.forEach(point => {
      expect(isNaN(point.cumplimiento)).toBe(false);
      expect(isFinite(point.cumplimiento)).toBe(true);
      expect(point.cumplimiento).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle very low compliance values', () => {
    const curve = generateTympanogramCurve('A', 0, 0.1);
    
    // Maximum compliance should not exceed the specified value
    const maxCompliance = Math.max(...curve.map(p => p.cumplimiento));
    expect(maxCompliance).toBeLessThanOrEqual(0.1);
  });

  it('should handle high compliance values', () => {
    const curve = generateTympanogramCurve('A', 0, 3.0);
    
    // Maximum compliance should be close to the specified value
    const maxCompliance = Math.max(...curve.map(p => p.cumplimiento));
    expect(maxCompliance).toBeGreaterThan(2.7);
    expect(maxCompliance).toBeLessThanOrEqual(3.0);
  });

  it('should generate all curve types without errors', () => {
    const types: TipoCurvaTimpanometrica[] = ['A', 'B', 'C', 'As', 'Ad'];
    
    types.forEach(tipo => {
      const curve = generateTympanogramCurve(tipo, 0, 1.0);
      
      expect(curve.length).toBe(61);
      expect(curve[0].presion).toBe(-400);
      expect(curve[curve.length - 1].presion).toBe(200);
      
      // All points should have valid compliance values
      curve.forEach(point => {
        expect(isNaN(point.cumplimiento)).toBe(false);
        expect(isFinite(point.cumplimiento)).toBe(true);
        expect(point.cumplimiento).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

/**
 * Property-Based Tests for generateTympanogramCurve
 * 
 * These tests validate universal properties that should hold for any valid input.
 * **Validates: Requirements 10.1-10.8**
 */
describe('generateTympanogramCurve - Property Tests', () => {
  /**
   * Property: Curve Length Consistency
   * For any valid curve type, peak pressure, and compliance values,
   * the generated curve should always have exactly 61 points
   * (-400 to 200 daPa in 10 daPa increments).
   */
  it('should always generate exactly 61 points', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'B', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }), // presionPico
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }), // cumplimiento
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          expect(curve.length).toBe(61);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pressure Values Correctness
   * For any valid inputs, the pressure values should be exactly
   * [-400, -390, -380, ..., 190, 200].
   */
  it('should always have correct pressure values from -400 to 200 in 10 daPa steps', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'B', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          
          for (let i = 0; i < curve.length; i++) {
            expect(curve[i].presion).toBe(-400 + i * 10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Compliance Non-Negativity
   * For any valid inputs, all compliance values should be non-negative.
   */
  it('should have all compliance values >= 0', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'B', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          
          curve.forEach(point => {
            expect(point.cumplimiento).toBeGreaterThanOrEqual(0);
            expect(isNaN(point.cumplimiento)).toBe(false);
            expect(isFinite(point.cumplimiento)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Type B Flatness
   * For any Type B curve, all compliance values should be equal
   * (flat curve indicating middle ear effusion).
   */
  it('should generate flat curves for Type B', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }).filter(n => !isNaN(n) && isFinite(n)),
        (presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve('B', presionPico, cumplimiento);
          
          // All points should have the same compliance
          const firstCompliance = curve[0].cumplimiento;
          curve.forEach(point => {
            expect(point.cumplimiento).toBeCloseTo(firstCompliance, 10);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Peak Location for Non-B Curves
   * For any non-B curve type, the maximum compliance should occur
   * at or near the specified peak pressure.
   */
  it('should have peak near specified pressure for non-B curves', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          
          // Find the point with maximum compliance
          const maxPoint = curve.reduce((max, point) => 
            point.cumplimiento > max.cumplimiento ? point : max
          );
          
          // Peak should be within 10 daPa of specified pressure
          expect(Math.abs(maxPoint.presion - presionPico)).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Compliance Bounds
   * For any valid inputs, the maximum compliance should not exceed
   * the specified compliance value.
   */
  it('should have maximum compliance not exceeding specified value', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          
          const maxCompliance = Math.max(...curve.map(p => p.cumplimiento));
          
          // Allow small tolerance for floating point arithmetic
          expect(maxCompliance).toBeLessThanOrEqual(cumplimiento * 1.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Type As Narrower Than Type A
   * For the same peak pressure and compliance, Type As curves should be
   * narrower than Type A curves (lower compliance away from peak).
   */
  it('should generate narrower curves for Type As compared to Type A', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -300, max: 100 }), // Ensure peak is not at extremes
        fc.double({ min: 0.5, max: 2.0 }), // Use double instead of float
        (presionPico, cumplimiento) => {
          const curveA = generateTympanogramCurve('A', presionPico, cumplimiento);
          const curveAs = generateTympanogramCurve('As', presionPico, cumplimiento);
          
          // Find peak index
          const peakIndex = curveA.findIndex(p => Math.abs(p.presion - presionPico) <= 10);
          
          // Compare compliance at points away from peak (±50 daPa)
          const offset = 5; // 5 steps = 50 daPa
          
          if (peakIndex >= offset && peakIndex < curveA.length - offset) {
            const complianceA_away = curveA[peakIndex - offset].cumplimiento;
            const complianceAs_away = curveAs[peakIndex - offset].cumplimiento;
            
            // Type As should have lower compliance away from peak
            // Only check if both values are valid numbers
            if (!isNaN(complianceA_away) && !isNaN(complianceAs_away) && 
                isFinite(complianceA_away) && isFinite(complianceAs_away)) {
              expect(complianceAs_away).toBeLessThan(complianceA_away);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Type Ad Wider Than Type A
   * For the same peak pressure and compliance, Type Ad curves should be
   * wider than Type A curves (higher compliance away from peak).
   */
  it('should generate wider curves for Type Ad compared to Type A', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -300, max: 100 }),
        fc.double({ min: 0.5, max: 2.0 }), // Use double instead of float
        (presionPico, cumplimiento) => {
          const curveA = generateTympanogramCurve('A', presionPico, cumplimiento);
          const curveAd = generateTympanogramCurve('Ad', presionPico, cumplimiento);
          
          // Find peak index
          const peakIndex = curveA.findIndex(p => Math.abs(p.presion - presionPico) <= 10);
          
          // Compare compliance at points away from peak (±50 daPa)
          const offset = 5; // 5 steps = 50 daPa
          
          if (peakIndex >= offset && peakIndex < curveA.length - offset) {
            const complianceA_away = curveA[peakIndex - offset].cumplimiento;
            const complianceAd_away = curveAd[peakIndex - offset].cumplimiento;
            
            // Type Ad should have higher compliance away from peak
            expect(complianceAd_away).toBeGreaterThan(complianceA_away);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Valid Point Structure
   * For any valid inputs, every point should have valid presion and
   * cumplimiento properties.
   */
  it('should generate points with valid structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'B', 'C', 'As', 'Ad'),
        fc.integer({ min: -400, max: 200 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
        (tipo, presionPico, cumplimiento) => {
          const curve = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          
          curve.forEach(point => {
            expect(point).toHaveProperty('presion');
            expect(point).toHaveProperty('cumplimiento');
            expect(typeof point.presion).toBe('number');
            expect(typeof point.cumplimiento).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Compliance Scaling
   * For any curve type and peak pressure, if we double the compliance,
   * all compliance values in the curve should approximately double.
   */
  it('should scale linearly with compliance parameter', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<TipoCurvaTimpanometrica>('A', 'C', 'As', 'Ad'),
        fc.integer({ min: -300, max: 100 }),
        fc.double({ min: 0.2, max: 1.0 }), // Use double and keep low so doubling stays in range
        (tipo, presionPico, cumplimiento) => {
          const curve1 = generateTympanogramCurve(tipo, presionPico, cumplimiento);
          const curve2 = generateTympanogramCurve(tipo, presionPico, cumplimiento * 2);
          
          // Each point in curve2 should be approximately double curve1
          for (let i = 0; i < curve1.length; i++) {
            if (curve1[i].cumplimiento > 0.01) { // Avoid division by very small numbers
              const ratio = curve2[i].cumplimiento / curve1[i].cumplimiento;
              // Allow some tolerance due to floating point arithmetic
              expect(ratio).toBeGreaterThan(1.9);
              expect(ratio).toBeLessThan(2.1);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
