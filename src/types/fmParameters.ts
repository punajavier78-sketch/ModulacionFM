export type FreqUnit = 'Hz' | 'kHz';
export type CarrierUnit = 'kHz' | 'MHz';

export interface FMParameters {
  beta: number; // Índice de modulación (0 a 5, adimensional)
  deltaF_kHz: number; // Desviación de frecuencia en kHz (0 a 75 kHz)
  k: number; // Sensibilidad en frecuencia (0.1 a 10 V/kHz o kHz/V)
  Am: number; // Amplitud moduladora (0 a 5 V)
  fm_kHz: number; // Frecuencia moduladora en kHz (0 a 20 kHz)
  fc_kHz: number; // Frecuencia de la portadora en kHz (100 kHz a 110,000 kHz / 110 MHz)
}

export interface ParameterInconsistency {
  id: string;
  field: keyof FMParameters | 'general';
  title: string;
  message: string;
  currentValue: string;
  expectedValue: string;
  severity: 'error' | 'warning';
}

export interface FMValidationReport {
  isValid: boolean;
  canGenerate: boolean;
  errors: string[];
  warnings: string[];
  inconsistencies: ParameterInconsistency[];
  expectedDeltaF_kHz: number;
  expectedBeta: number | null; // null if fm === 0
}

export interface GenerationReadyData {
  parameters: FMParameters;
  timestamp: string;
  category: 'Banda Estrecha (NBFM)' | 'Banda Ancha (WBFM)';
  theoreticalBandwidth_kHz: number; // Carson's rule: 2 * (deltaF + fm)
  carrierToDeviationRatio: number;
  isReady: boolean;
}
