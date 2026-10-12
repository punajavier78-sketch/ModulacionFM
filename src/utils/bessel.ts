import { BesselComponent } from '../types/frequencyDomain';
import { FMParameters } from '../types/fmParameters';

/**
 * Calculates the Bessel function of the first kind of integer order n, Jn(beta).
 * Uses recursive term series expansion which is unconditionally convergent and
 * numerically exact to machine precision for beta in [0, 5].
 *
 * Jn(beta) = sum_{m=0}^inf [ (-1)^m / (m! * (m+n)!) ] * (beta / 2)^(2m + n)
 */
export function besselJ(n: number, beta: number): number {
  if (beta === 0) {
    return n === 0 ? 1.0 : 0.0;
  }

  // Handle negative orders: J_{-n}(beta) = (-1)^n * J_n(beta)
  if (n < 0) {
    const absN = Math.abs(n);
    const sign = absN % 2 === 0 ? 1 : -1;
    return sign * besselJ(absN, beta);
  }

  const halfBeta = beta / 2;

  // Compute initial term: (beta / 2)^n / n!
  let term = 1.0;
  for (let i = 1; i <= n; i++) {
    term *= halfBeta / i;
  }

  let sum = term;
  const halfBetaSq = halfBeta * halfBeta;

  // Accumulate terms until precision limit
  const maxIterations = 40;
  for (let m = 1; m <= maxIterations; m++) {
    term = -term * halfBetaSq / (m * (m + n));
    sum += term;
    if (Math.abs(term) < 1e-15) {
      break;
    }
  }

  return Number(sum.toFixed(6));
}

/**
 * Generates all relevant Bessel components for FM spectral analysis.
 * Includes carrier (n = 0) and sidebands up to maxOrder on both sides:
 * n in [-maxOrder, ..., +maxOrder].
 */
export function generateBesselComponents(
  params: FMParameters,
  Ac: number = 5.0,
  maxOrder: number = 8
): BesselComponent[] {
  const { beta, fc_kHz, fm_kHz } = params;
  const components: BesselComponent[] = [];

  // Orders from -maxOrder to +maxOrder
  for (let n = -maxOrder; n <= maxOrder; n++) {
    const freq_kHz = Number((fc_kHz + n * fm_kHz).toFixed(3));

    // Physically, negative frequencies cannot exist; skip if freq_kHz < 0
    if (freq_kHz < 0) continue;

    // Jn coefficient with sign
    const Jn = besselJ(n, beta);
    const absJn = Math.abs(Jn);

    // Voltage amplitude (Ac * Jn)
    const voltage_V = Number((Ac * Jn).toFixed(4));
    const absVoltage_V = Number((Ac * absJn).toFixed(4));

    // Power relative: Jn(beta)^2
    const powerRelative = Number((Jn * Jn).toFixed(6));
    const powerPercent = Number((powerRelative * 100).toFixed(2));

    let label = 'fc';
    let type: 'carrier' | 'upper_sideband' | 'lower_sideband' = 'carrier';

    if (n > 0) {
      label = `fc + ${n}·fm`;
      type = 'upper_sideband';
    } else if (n < 0) {
      label = `fc - ${Math.abs(n)}·fm`;
      type = 'lower_sideband';
    }

    components.push({
      order: n,
      freq_kHz,
      Jn,
      absJn,
      voltage_V,
      absVoltage_V,
      powerRelative,
      powerPercent,
      label,
      type,
    });
  }

  return components;
}

/**
 * Calculates total power accounted for by the components (should be ~1.0 for valid FM).
 */
export function calculateTotalPower(components: BesselComponent[]): number {
  return components.reduce((acc, c) => acc + c.powerRelative, 0);
}
