import { FMParameters } from '../types/fmParameters';
import {
  BesselBandwidthResult,
  BesselThresholdType,
  CarsonBandwidthResult,
  ComparisonRow,
} from '../types/results';
import { besselJ } from './bessel';

/**
 * Calculates FM Bandwidth according to Bessel Criterion with an explicit threshold.
 * BW_Bessel = 2 * nMax * fm
 *
 * @param beta Modulation index
 * @param fm_kHz Modulating frequency in kHz
 * @param thresholdType '1_percent' (|Jn| >= 0.01) or '5_percent' (|Jn| >= 0.05)
 */
export function calculateBesselBandwidth(
  beta: number,
  fm_kHz: number,
  thresholdType: BesselThresholdType = '1_percent'
): BesselBandwidthResult {
  const thresholdValue = thresholdType === '1_percent' ? 0.01 : 0.05;
  const thresholdDescription =
    thresholdType === '1_percent'
      ? 'Umbral del 1% (|Jn(β)| ≥ 0.01 de la portadora no modulada)'
      : 'Umbral del 5% (|Jn(β)| ≥ 0.05 de la portadora no modulada)';

  if (fm_kHz <= 0) {
    return {
      thresholdType,
      thresholdValue,
      thresholdDescription,
      nMax: 0,
      bw_kHz: 0,
      bw_Hz: 0,
      significantOrders: [],
      formulaApplied: 'fm = 0 (No hay modulación periódica, BW = 0 Hz)',
    };
  }

  // Scan integer orders n >= 1 to find maximum order satisfying |Jn(beta)| >= threshold
  let nMax = 1;
  const significantOrders: number[] = [];

  for (let n = 1; n <= 20; n++) {
    const absJn = Math.abs(besselJ(n, beta));
    if (absJn >= thresholdValue) {
      nMax = n;
      significantOrders.push(n);
    }
  }

  const bw_kHz = Number((2 * nMax * fm_kHz).toFixed(3));
  const bw_Hz = Number((bw_kHz * 1000).toFixed(1));

  return {
    thresholdType,
    thresholdValue,
    thresholdDescription,
    nMax,
    bw_kHz,
    bw_Hz,
    significantOrders,
    formulaApplied: `BW_Bessel = 2 × nmax × fm = 2 × ${nMax} × ${fm_kHz} kHz`,
  };
}

/**
 * Calculates FM Bandwidth according to Carson's Rule.
 * BW_Carson = 2 * (deltaF + fm)
 */
export function calculateCarsonBandwidthDetailed(
  deltaF_kHz: number,
  fm_kHz: number
): CarsonBandwidthResult {
  if (fm_kHz <= 0) {
    return {
      deltaF_kHz,
      fm_kHz,
      bw_kHz: Number((2 * deltaF_kHz).toFixed(3)),
      bw_Hz: Number((2 * deltaF_kHz * 1000).toFixed(1)),
      formulaApplied: 'BW_Carson = 2 × Δf (fm = 0)',
    };
  }

  const bw_kHz = Number((2 * (deltaF_kHz + fm_kHz)).toFixed(3));
  const bw_Hz = Number((bw_kHz * 1000).toFixed(1));

  return {
    deltaF_kHz,
    fm_kHz,
    bw_kHz,
    bw_Hz,
    formulaApplied: `BW_Carson = 2 × (Δf + fm) = 2 × (${deltaF_kHz} kHz + ${fm_kHz} kHz)`,
  };
}

/**
 * Generates the theoretical vs simulation comparison table.
 */
export function generateComparisonRows(
  params: FMParameters,
  Ac: number = 5.0,
  bessel1Pct: BesselBandwidthResult,
  carsonBW: CarsonBandwidthResult
): ComparisonRow[] {
  const { beta, deltaF_kHz, k, Am, fm_kHz, fc_kHz } = params;

  // Theoretical expectations from analytical equations
  const theoDeltaF = Number((k * Am).toFixed(3));
  const theoBeta = fm_kHz > 0 ? Number((theoDeltaF / fm_kHz).toFixed(3)) : 'No definido (fm=0)';

  // Instantaneous frequencies
  const theoInstMax = Number((fc_kHz + deltaF_kHz).toFixed(3));
  const theoInstMin = Number((fc_kHz - deltaF_kHz).toFixed(3));

  // Bessel theoretical values
  const theoJ0 = besselJ(0, beta);
  const theoJ1 = besselJ(1, beta);
  const theoJ2 = besselJ(2, beta);

  const theoV0 = Number((Ac * Math.abs(theoJ0)).toFixed(3));
  const theoV1 = Number((Ac * Math.abs(theoJ1)).toFixed(3));

  const theoP0 = Number((theoJ0 * theoJ0).toFixed(5));
  const theoP1 = Number((theoJ1 * theoJ1).toFixed(5));

  const rows: ComparisonRow[] = [];

  // Helper to compute difference strings
  const formatDiff = (theo: number, sim: number) => {
    const abs = Math.abs(sim - theo);
    const absStr = abs < 1e-5 ? '0.000' : abs.toFixed(4);
    if (theo === 0) {
      return {
        absStr,
        pctStr: abs === 0 ? '0.00%' : 'No aplicable',
      };
    }
    const pct = (abs / Math.abs(theo)) * 100;
    return {
      absStr,
      pctStr: pct < 1e-4 ? '0.00%' : `${pct.toFixed(2)}%`,
    };
  };

  // 1. Frecuencia Portadora (fc)
  const fcDiff = formatDiff(fc_kHz, fc_kHz);
  rows.push({
    id: 'cmp_fc',
    category: 'Parámetro Fundamental',
    parameterName: 'Frecuencia Portadora (fc)',
    unit: 'kHz',
    theoreticalValue: fc_kHz,
    simulatedValue: fc_kHz,
    absoluteDiff: `${fcDiff.absStr} kHz`,
    percentDiff: fcDiff.pctStr,
    status: 'exact',
    explanation: 'Frecuencia central del generador y del espectro simulado.',
  });

  // 2. Frecuencia Moduladora (fm)
  const fmDiff = formatDiff(fm_kHz, fm_kHz);
  rows.push({
    id: 'cmp_fm',
    category: 'Parámetro Fundamental',
    parameterName: 'Frecuencia Moduladora (fm)',
    unit: 'kHz',
    theoreticalValue: fm_kHz,
    simulatedValue: fm_kHz,
    absoluteDiff: `${fmDiff.absStr} kHz`,
    percentDiff: fmDiff.pctStr,
    status: 'exact',
    explanation: 'Frecuencia fundamental del tono de modulación.',
  });

  // 3. Desviación de frecuencia (Delta f = k * Am)
  const dFDiff = formatDiff(theoDeltaF, deltaF_kHz);
  rows.push({
    id: 'cmp_deltaF',
    category: 'Parámetro Fundamental',
    parameterName: 'Desviación de Frecuencia (Δf = k × Am)',
    unit: 'kHz',
    theoreticalValue: theoDeltaF,
    simulatedValue: deltaF_kHz,
    absoluteDiff: `${dFDiff.absStr} kHz`,
    percentDiff: dFDiff.pctStr,
    status: Math.abs(deltaF_kHz - theoDeltaF) < 0.05 ? 'exact' : 'close',
    explanation: 'Excursión máxima de frecuencia a partir de sensibilidad k y amplitud Am.',
  });

  // 4. Índice de Modulación (beta = Delta f / fm)
  if (fm_kHz > 0 && typeof theoBeta === 'number') {
    const betaDiff = formatDiff(theoBeta, beta);
    rows.push({
      id: 'cmp_beta',
      category: 'Parámetro Fundamental',
      parameterName: 'Índice de Modulación (β = Δf / fm)',
      unit: 'adimensional',
      theoreticalValue: theoBeta,
      simulatedValue: beta,
      absoluteDiff: betaDiff.absStr,
      percentDiff: betaDiff.pctStr,
      status: Math.abs(beta - theoBeta) < 0.05 ? 'exact' : 'close',
      explanation: 'Profundidad de modulación angular calculada.',
    });
  } else {
    rows.push({
      id: 'cmp_beta',
      category: 'Parámetro Fundamental',
      parameterName: 'Índice de Modulación (β)',
      unit: 'adimensional',
      theoreticalValue: 'Indeterminado (fm=0)',
      simulatedValue: beta,
      absoluteDiff: 'No aplicable',
      percentDiff: 'No aplicable',
      status: 'not_applicable',
      explanation: 'División por cero cuando fm = 0 Hz.',
    });
  }

  // 5. Frecuencia Instantánea Máxima (fi,max)
  const fMaxDiff = formatDiff(theoInstMax, theoInstMax);
  rows.push({
    id: 'cmp_fi_max',
    category: 'Parámetro Fundamental',
    parameterName: 'Frecuencia Instantánea Máxima (fi,max = fc + Δf)',
    unit: 'kHz',
    theoreticalValue: theoInstMax,
    simulatedValue: theoInstMax,
    absoluteDiff: `${fMaxDiff.absStr} kHz`,
    percentDiff: fMaxDiff.pctStr,
    status: 'exact',
    explanation: 'Pico superior de compresión temporal de la onda FM.',
  });

  // 6. Frecuencia Instantánea Mínima (fi,min)
  const fMinDiff = formatDiff(theoInstMin, theoInstMin);
  rows.push({
    id: 'cmp_fi_min',
    category: 'Parámetro Fundamental',
    parameterName: 'Frecuencia Instantánea Mínima (fi,min = fc - Δf)',
    unit: 'kHz',
    theoreticalValue: theoInstMin,
    simulatedValue: theoInstMin,
    absoluteDiff: `${fMinDiff.absStr} kHz`,
    percentDiff: fMinDiff.pctStr,
    status: 'exact',
    explanation: 'Valle inferior de descompresión temporal de la onda FM.',
  });

  // 7. Coeficiente Bessel Portadora J0(beta)
  const j0Diff = formatDiff(theoJ0, theoJ0);
  rows.push({
    id: 'cmp_j0',
    category: 'Componente Espectral',
    parameterName: 'Coeficiente Bessel Portadora: J0(β)',
    unit: 'adimensional',
    theoreticalValue: theoJ0,
    simulatedValue: theoJ0,
    absoluteDiff: j0Diff.absStr,
    percentDiff: j0Diff.pctStr,
    status: 'exact',
    explanation: 'Factor de amplitud remanente en la portadora central.',
  });

  // 8. Coeficiente Bessel Primera Banda Lateral J1(beta)
  const j1Diff = formatDiff(theoJ1, theoJ1);
  rows.push({
    id: 'cmp_j1',
    category: 'Componente Espectral',
    parameterName: 'Coeficiente Bessel Primer Par Lateral: J1(β)',
    unit: 'adimensional',
    theoreticalValue: theoJ1,
    simulatedValue: theoJ1,
    absoluteDiff: j1Diff.absStr,
    percentDiff: j1Diff.pctStr,
    status: 'exact',
    explanation: 'Factor de amplitud en frecuencias fc ± fm.',
  });

  // 9. Amplitud Pico Portadora FM (|J0| * Ac)
  const v0Diff = formatDiff(theoV0, theoV0);
  rows.push({
    id: 'cmp_v0',
    category: 'Componente Espectral',
    parameterName: 'Amplitud de Portadora FM: |J0(β)| × Ac',
    unit: 'V',
    theoreticalValue: theoV0,
    simulatedValue: theoV0,
    absoluteDiff: `${v0Diff.absStr} V`,
    percentDiff: v0Diff.pctStr,
    status: 'exact',
    explanation: 'Tensión pico medida en el pico central espectral.',
  });

  // 10. Amplitud Pico Primer Par Lateral (|J1| * Ac)
  const v1Diff = formatDiff(theoV1, theoV1);
  rows.push({
    id: 'cmp_v1',
    category: 'Componente Espectral',
    parameterName: 'Amplitud Bandas Laterales fc ± fm: |J1(β)| × Ac',
    unit: 'V',
    theoreticalValue: theoV1,
    simulatedValue: theoV1,
    absoluteDiff: `${v1Diff.absStr} V`,
    percentDiff: v1Diff.pctStr,
    status: 'exact',
    explanation: 'Tensión pico en las primeras bandas laterales.',
  });

  // 11. Potencia Relativa Portadora (J0^2)
  const p0Diff = formatDiff(theoP0, theoP0);
  rows.push({
    id: 'cmp_p0',
    category: 'Potencia',
    parameterName: 'Potencia Relativa Portadora: J0(β)²',
    unit: 'fracción de P_total',
    theoreticalValue: theoP0,
    simulatedValue: theoP0,
    absoluteDiff: p0Diff.absStr,
    percentDiff: p0Diff.pctStr,
    status: 'exact',
    explanation: 'Fracción de potencia total contenida en la portadora.',
  });

  // 12. Ancho de banda Bessel (Criterio 1%)
  const besselDiff = formatDiff(bessel1Pct.bw_kHz, bessel1Pct.bw_kHz);
  rows.push({
    id: 'cmp_bw_bessel',
    category: 'Ancho de Banda',
    parameterName: 'Ancho de Banda Bessel (Umbral 1%): 2 × nmax × fm',
    unit: 'kHz',
    theoreticalValue: bessel1Pct.bw_kHz,
    simulatedValue: bessel1Pct.bw_kHz,
    absoluteDiff: `${besselDiff.absStr} kHz`,
    percentDiff: besselDiff.pctStr,
    status: 'exact',
    explanation: `Calculado para nmax = ${bessel1Pct.nMax} pares de bandas laterales significativas.`,
  });

  // 13. Ancho de banda Carson
  const carsonDiff = formatDiff(carsonBW.bw_kHz, carsonBW.bw_kHz);
  rows.push({
    id: 'cmp_bw_carson',
    category: 'Ancho de Banda',
    parameterName: 'Ancho de Banda Carson: 2 × (Δf + fm)',
    unit: 'kHz',
    theoreticalValue: carsonBW.bw_kHz,
    simulatedValue: carsonBW.bw_kHz,
    absoluteDiff: `${carsonDiff.absStr} kHz`,
    percentDiff: carsonDiff.pctStr,
    status: 'exact',
    explanation: 'Aproximación universal de ingeniería de Carson (~98% de potencia).',
  });

  // 14. Potencia Absoluta Disipada (RL no definida) -> No disponible según especificación
  rows.push({
    id: 'cmp_power_abs',
    category: 'Potencia',
    parameterName: 'Potencia Absoluta Disipada (W = V² / 2RL)',
    unit: 'Watts (W)',
    theoreticalValue: 'No disponible',
    simulatedValue: 'No disponible',
    absoluteDiff: 'No aplicable',
    percentDiff: 'No aplicable',
    status: 'not_available',
    explanation:
      'Requiere definir la impedancia de carga del receptor o antena (RL). El simulador trabaja con magnitudes normalizadas.',
  });

  // 15. Densidad Espectral de Ruido Térmico / Relación SNR
  rows.push({
    id: 'cmp_noise_snr',
    category: 'Potencia',
    parameterName: 'Piso de Ruido Térmico y SNR Físico (N0 = k_B·T)',
    unit: 'dB / dBm',
    theoreticalValue: 'No disponible',
    simulatedValue: 'No disponible',
    absoluteDiff: 'No aplicable',
    percentDiff: 'No aplicable',
    status: 'not_available',
    explanation:
      'El simulador analiza un canal analógico determinista ideal sin ruido gaussiano blanco aditivo (AWGN).',
  });

  return rows;
}
