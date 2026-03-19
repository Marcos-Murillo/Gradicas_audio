/**
 * Chart Generators for Audiological Evaluations
 * 
 * This module provides functions to generate data points for various
 * audiological charts including sigmoid curves for logoaudiometry
 * and tympanogram curves.
 */

/**
 * Represents a point in a logoaudiometry chart
 */
export interface LogoaudiometryPoint {
  db: number;
  percentage: number;
}

/**
 * Generates a sigmoid curve for logoaudiometry based on SRT and SDS values.
 * 
 * The sigmoid function models the relationship between sound intensity (dB)
 * and speech recognition percentage. The curve starts near 0%, rises steeply
 * around the SRT (Speech Reception Threshold), and plateaus at the SDS
 * (Speech Discrimination Score).
 * 
 * @param srt - Speech Reception Threshold in decibels (dB)
 * @param sds - Speech Discrimination Score as a percentage (0-100)
 * @returns Array of points representing the sigmoid curve from 0 to 100 dB
 * 
 * @example
 * ```typescript
 * const curve = generateSigmoidCurve(30, 95);
 * // Returns points like: [{ db: 0, percentage: 0.5 }, { db: 5, percentage: 1.2 }, ...]
 * ```
 * 
 * Requirements: 9.1-9.7
 */
export function generateSigmoidCurve(
  srt: number,
  sds: number
): LogoaudiometryPoint[] {
  const points: LogoaudiometryPoint[] = [];
  
  // Generate points from 0 to 100 dB in 5 dB increments
  for (let db = 0; db <= 100; db += 5) {
    // Normalize the dB value around the SRT
    // This centers the sigmoid curve at the SRT point
    const x = (db - srt) / 10;
    
    // Apply sigmoid function: f(x) = SDS / (1 + e^(-x))
    // This creates an S-shaped curve that:
    // - Approaches 0 for very low intensities
    // - Rises steeply around the SRT
    // - Plateaus at the SDS value for high intensities
    const y = sds / (1 + Math.exp(-x));
    
    points.push({ db, percentage: y });
  }
  
  return points;
}

/**
 * Represents a point in a tympanometry chart
 */
export interface TympanometryPoint {
  presion: number;
  cumplimiento: number;
}

/**
 * Type of tympanometric curve
 * - A: Normal curve with peak near 0 daPa
 * - B: Flat curve with no peak (middle ear effusion)
 * - C: Peak shifted to negative pressures (Eustachian tube dysfunction)
 * - As: Narrow peak (stiffness/rigidity)
 * - Ad: Wide peak (hypercompliance/flaccidity)
 */
export type TipoCurvaTimpanometrica = 'A' | 'B' | 'C' | 'As' | 'Ad';

/**
 * Generates a tympanogram curve based on curve type, peak pressure, and compliance.
 * 
 * Tympanometry measures the acoustic admittance (compliance) of the middle ear
 * as a function of air pressure in the ear canal. Different curve types indicate
 * different middle ear conditions.
 * 
 * @param tipo - Type of tympanometric curve (A, B, C, As, Ad)
 * @param presionPico - Peak pressure in decapascals (daPa), typically -400 to +200
 * @param cumplimiento - Maximum compliance in milliliters (ml), typically 0 to 3
 * @returns Array of points representing the tympanogram curve from -400 to +200 daPa
 * 
 * @example
 * ```typescript
 * // Normal curve (Type A) with peak at 0 daPa and 1.0 ml compliance
 * const curveA = generateTympanogramCurve('A', 0, 1.0);
 * 
 * // Flat curve (Type B) indicating middle ear effusion
 * const curveB = generateTympanogramCurve('B', -100, 0.3);
 * 
 * // Shifted curve (Type C) indicating Eustachian tube dysfunction
 * const curveC = generateTympanogramCurve('C', -150, 0.8);
 * ```
 * 
 * Requirements: 10.1-10.8
 */
export function generateTympanogramCurve(
  tipo: TipoCurvaTimpanometrica,
  presionPico: number,
  cumplimiento: number
): TympanometryPoint[] {
  const points: TympanometryPoint[] = [];
  
  switch (tipo) {
    case 'A': // Normal curve with peak near 0 daPa
      // Gaussian curve with standard width
      for (let p = -400; p <= 200; p += 10) {
        const y = cumplimiento * Math.exp(-Math.pow((p - presionPico) / 100, 2));
        points.push({ presion: p, cumplimiento: y });
      }
      break;
      
    case 'B': // Flat curve with no peak (middle ear effusion)
      // Nearly flat line at low compliance
      for (let p = -400; p <= 200; p += 10) {
        points.push({ presion: p, cumplimiento: cumplimiento * 0.2 });
      }
      break;
      
    case 'C': // Peak shifted to negative pressures (Eustachian tube dysfunction)
      // Gaussian curve centered at negative pressure
      for (let p = -400; p <= 200; p += 10) {
        const y = cumplimiento * Math.exp(-Math.pow((p - presionPico) / 100, 2));
        points.push({ presion: p, cumplimiento: y });
      }
      break;
      
    case 'As': // Narrow peak (stiffness/rigidity)
      // Gaussian curve with narrow width (smaller denominator)
      for (let p = -400; p <= 200; p += 10) {
        const y = cumplimiento * Math.exp(-Math.pow((p - presionPico) / 50, 2));
        points.push({ presion: p, cumplimiento: y });
      }
      break;
      
    case 'Ad': // Wide peak (hypercompliance/flaccidity)
      // Gaussian curve with wide width (larger denominator)
      for (let p = -400; p <= 200; p += 10) {
        const y = cumplimiento * Math.exp(-Math.pow((p - presionPico) / 150, 2));
        points.push({ presion: p, cumplimiento: y });
      }
      break;
  }
  
  return points;
}
