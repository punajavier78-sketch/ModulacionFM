import { FMParameters } from './fmParameters';

export interface BesselComponent {
  order: number; // n: ..., -3, -2, -1, 0, 1, 2, 3, ...
  freq_kHz: number; // fc + n * fm
  Jn: number; // Signed Bessel coefficient Jn(beta)
  absJn: number; // |Jn(beta)|
  voltage_V: number; // Signed voltage Ac * Jn(beta)
  absVoltage_V: number; // Peak amplitude Ac * |Jn(beta)|
  powerRelative: number; // Jn(beta)^2
  powerPercent: number; // Jn(beta)^2 * 100%
  label: string; // "fc", "fc + 1·fm", "fc - 1·fm", etc.
  type: 'carrier' | 'upper_sideband' | 'lower_sideband';
}

export interface SpectralLine {
  freq_kHz: number;
  amplitude_V: number;
  label: string;
  sublabel?: string;
  type: 'carrier' | 'sideband' | 'modulating';
}

export interface FrequencyDomainConfig {
  params: FMParameters;
  Ac: number; // Carrier amplitude (e.g. 5.0 V)
  mu: number; // AM modulation index for DSBFC (e.g. 0.70)
  maxOrder: number; // Max Bessel order to calculate (typically 8 to 10)
  displayMode: 'absolute_frequency' | 'relative_to_carrier'; // fc vs offset from carrier (Delta f)
}
