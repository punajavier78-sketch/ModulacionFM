import { FMParameters } from './fmParameters';

export type BesselThresholdType = '1_percent' | '5_percent';

export interface BesselBandwidthResult {
  thresholdType: BesselThresholdType;
  thresholdValue: number; // e.g. 0.01 or 0.05
  thresholdDescription: string;
  nMax: number; // Highest significant order where |Jn(beta)| >= threshold
  bw_kHz: number; // 2 * nMax * fm_kHz
  bw_Hz: number;
  significantOrders: number[];
  formulaApplied: string;
}

export interface CarsonBandwidthResult {
  deltaF_kHz: number;
  fm_kHz: number;
  bw_kHz: number; // 2 * (deltaF + fm)
  bw_Hz: number;
  formulaApplied: string;
}

export interface ComparisonRow {
  id: string;
  category: 'Parámetro Fundamental' | 'Componente Espectral' | 'Ancho de Banda' | 'Potencia';
  parameterName: string;
  unit: string;
  theoreticalValue: number | string;
  simulatedValue: number | string;
  absoluteDiff: string;
  percentDiff: string;
  status: 'exact' | 'close' | 'divergent' | 'not_applicable' | 'not_available';
  explanation?: string;
}

export interface ResultsAnalysisData {
  params: FMParameters;
  Ac: number;
  mu: number;
  instFreqMax_kHz: number;
  instFreqMin_kHz: number;
  besselBW_1pct: BesselBandwidthResult;
  besselBW_5pct: BesselBandwidthResult;
  carsonBW: CarsonBandwidthResult;
  comparisonRows: ComparisonRow[];
}
