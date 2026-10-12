import { FMParameters } from './fmParameters';

export type TimeWindowMode = 'modulating_period' | 'carrier_zoom';

export interface TimeDomainConfig {
  parameters: FMParameters;
  carrierAmplitude_V: number; // Ac reference amplitude (default 5.0 V)
  amModulationIndex_mu: number; // mu reference amplitude (e.g. 0.70 illustrative)
  windowMode: TimeWindowMode;
  timeWindow_ms: number; // Width of visual window in milliseconds
  animationSpeed: number; // 0.25, 0.5, 1.0, 2.0
  isPlaying: boolean;
  simulatedTime_ms: number;
}

export interface InstantaneousValues {
  time_ms: number;
  modulating_V: number;
  carrier_V: number;
  fm_V: number;
  dsb_V: number;
  envelope_upper_V: number;
  envelope_lower_V: number;
  instantaneousFreq_kHz: number;
}
