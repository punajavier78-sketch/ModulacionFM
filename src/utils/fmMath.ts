import { FMParameters, FMValidationReport, ParameterInconsistency } from '../types/fmParameters';

// Range constants as requested in specification
export const FM_BOUNDS = {
  beta: { min: 0, max: 5, step: 0.05, unit: 'adimensional (rad)' },
  deltaF_kHz: { min: 0, max: 75, step: 0.5, unit: 'kHz' },
  k: { min: 0.1, max: 10, step: 0.1, unit: 'V/kHz (kHz/V)' },
  Am: { min: 0, max: 5, step: 0.1, unit: 'V' },
  fm_kHz: { min: 0, max: 20, step: 0.25, unit: 'kHz' },
  fc_kHz: { min: 100, max: 110000, step: 100, unit: 'kHz' }, // 100 kHz a 110 MHz
};

// Tolerance for mathematical consistency comparisons
const MATH_TOLERANCE = 0.08;

/**
 * Validates and analyzes FM parameters mathematically.
 * Respects:
 *   beta = deltaF / fm
 *   deltaF = k * Am
 */
export function validateFMParameters(params: FMParameters): FMValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const inconsistencies: ParameterInconsistency[] = [];

  const { beta, deltaF_kHz, k, Am, fm_kHz, fc_kHz } = params;

  // 1. Check range boundaries
  if (beta < FM_BOUNDS.beta.min || beta > FM_BOUNDS.beta.max) {
    errors.push(
      `El índice de modulación (β = ${beta}) está fuera del rango permitido [${FM_BOUNDS.beta.min} - ${FM_BOUNDS.beta.max}].`
    );
  }

  if (deltaF_kHz < FM_BOUNDS.deltaF_kHz.min || deltaF_kHz > FM_BOUNDS.deltaF_kHz.max) {
    errors.push(
      `La desviación de frecuencia (Δf = ${deltaF_kHz} kHz) está fuera del rango permitido [0 - 75 kHz].`
    );
  }

  if (k < FM_BOUNDS.k.min || k > FM_BOUNDS.k.max) {
    errors.push(
      `La sensibilidad en frecuencia (k = ${k} V/kHz) está fuera del rango permitido [0.1 - 10 V/kHz].`
    );
  }

  if (Am < FM_BOUNDS.Am.min || Am > FM_BOUNDS.Am.max) {
    errors.push(
      `La amplitud moduladora (Am = ${Am} V) está fuera del rango permitido [0 - 5 V].`
    );
  }

  if (fm_kHz < FM_BOUNDS.fm_kHz.min || fm_kHz > FM_BOUNDS.fm_kHz.max) {
    errors.push(
      `La frecuencia moduladora (fm = ${fm_kHz} kHz) está fuera del rango permitido [0 - 20 kHz].`
    );
  }

  if (fc_kHz < FM_BOUNDS.fc_kHz.min || fc_kHz > FM_BOUNDS.fc_kHz.max) {
    errors.push(
      `La frecuencia portadora (fc = ${fc_kHz} kHz) está fuera del rango permitido [100 kHz - 110 MHz].`
    );
  }

  // 2. Mathematical Relationship 1: deltaF = k * Am
  const expectedDeltaF_kHz = Number((k * Am).toFixed(2));
  const deltaFDiff = Math.abs(deltaF_kHz - expectedDeltaF_kHz);

  if (deltaFDiff > MATH_TOLERANCE) {
    inconsistencies.push({
      id: 'inconsistency_deltaF',
      field: 'deltaF_kHz',
      title: 'Incompatibilidad en Desviación de Frecuencia (Δf = k × Am)',
      message: `Con sensibilidad k = ${k} V/kHz y amplitud Am = ${Am} V, la desviación calculada es Δf = ${expectedDeltaF_kHz} kHz. El control actual indica Δf = ${deltaF_kHz} kHz (discrepancia de ${Math.abs(deltaF_kHz - expectedDeltaF_kHz).toFixed(2)} kHz).`,
      currentValue: `${deltaF_kHz} kHz`,
      expectedValue: `${expectedDeltaF_kHz} kHz`,
      severity: 'error',
    });
    errors.push(
      `Inconsistencia matemática: Δf (${deltaF_kHz} kHz) no coincide con el producto k × Am (${expectedDeltaF_kHz} kHz).`
    );
  }

  // 3. Mathematical Relationship 2: beta = deltaF / fm (handle division by zero!)
  let expectedBeta: number | null = null;

  if (fm_kHz === 0) {
    inconsistencies.push({
      id: 'zero_fm_division',
      field: 'fm_kHz',
      title: 'División por cero en cálculo de índice de modulación (β = Δf / fm)',
      message:
        'La frecuencia moduladora fm es 0 Hz. La fórmula β = Δf / fm resulta en una indeterminación matemática (división entre cero). Para modular en frecuencia se requiere fm > 0 Hz.',
      currentValue: '0 Hz',
      expectedValue: '> 0 Hz (ej. 1 kHz a 15 kHz)',
      severity: 'error',
    });
    errors.push(
      'Frecuencia moduladora nula (fm = 0): la relación β = Δf / fm no está definida debido a división entre cero.'
    );
  } else {
    expectedBeta = Number((deltaF_kHz / fm_kHz).toFixed(2));
    const betaDiff = Math.abs(beta - expectedBeta);

    if (betaDiff > MATH_TOLERANCE) {
      inconsistencies.push({
        id: 'inconsistency_beta',
        field: 'beta',
        title: 'Incompatibilidad en Índice de Modulación (β = Δf / fm)',
        message: `Con desviación Δf = ${deltaF_kHz} kHz y frecuencia moduladora fm = ${fm_kHz} kHz, el índice teórico es β = ${expectedBeta}. El control actual indica β = ${beta} (discrepancia de ${Math.abs(beta - expectedBeta).toFixed(2)}).`,
        currentValue: `${beta}`,
        expectedValue: `${expectedBeta}`,
        severity: 'error',
      });
      errors.push(
        `Inconsistencia matemática: β (${beta}) no coincide con el cociente Δf / fm (${expectedBeta}).`
      );
    }
  }

  // 4. Carrier vs Deviation Physical Consistency: fc must be significantly greater than deltaF
  if (fc_kHz <= deltaF_kHz) {
    inconsistencies.push({
      id: 'carrier_lower_than_deviation',
      field: 'fc_kHz',
      title: 'Condición Física Inviable: Portadora menor o igual a la desviación',
      message: `La frecuencia portadora fc (${fc_kHz} kHz) debe ser estrictamente superior a la desviación Δf (${deltaF_kHz} kHz) para evitar frecuencias instantáneas negativas o replegamiento espectral.`,
      currentValue: `fc = ${fc_kHz} kHz`,
      expectedValue: `fc > ${deltaF_kHz} kHz (típicamente fc >> Δf)`,
      severity: 'error',
    });
    errors.push(
      `Inconsistencia de portadora: fc (${fc_kHz} kHz) es menor o igual a la desviación de frecuencia Δf (${deltaF_kHz} kHz).`
    );
  } else if (fc_kHz < deltaF_kHz * 5) {
    warnings.push(
      `Advertencia técnica: fc (${fc_kHz} kHz) es muy cercana a la desviación Δf (${deltaF_kHz} kHz). En sistemas de telecomunicaciones se recomienda fc >> Δf para una modulación estable.`
    );
  }

  const isValid = errors.length === 0 && inconsistencies.length === 0;

  return {
    isValid,
    canGenerate: isValid,
    errors,
    warnings,
    inconsistencies,
    expectedDeltaF_kHz,
    expectedBeta,
  };
}

/**
 * Calculates theoretical Carson bandwidth: B = 2 * (deltaF + fm)
 */
export function calculateCarsonBandwidth(deltaF_kHz: number, fm_kHz: number): number {
  return Number((2 * (deltaF_kHz + fm_kHz)).toFixed(2));
}

/**
 * Harmonizes parameters starting from Am, k, and fm as independent generator signals,
 * without silently forcing them on the user (requires explicit user button invocation).
 */
export function harmonizeFromInputs(
  k: number,
  Am: number,
  fm_kHz: number,
  currentFc_kHz: number
): FMParameters {
  const safeFm = fm_kHz > 0 ? fm_kHz : 1.0;
  // Calculate deltaF = k * Am (capped at 75 kHz)
  const rawDeltaF = Number((k * Am).toFixed(2));
  const deltaF_kHz = Math.min(Math.max(rawDeltaF, 0), 75);

  // Calculate beta = deltaF / safeFm (capped at 5)
  const rawBeta = Number((deltaF_kHz / safeFm).toFixed(2));
  const beta = Math.min(Math.max(rawBeta, 0), 5);

  return {
    beta,
    deltaF_kHz,
    k,
    Am,
    fm_kHz: safeFm,
    fc_kHz: Math.max(currentFc_kHz, deltaF_kHz * 2, 100),
  };
}
