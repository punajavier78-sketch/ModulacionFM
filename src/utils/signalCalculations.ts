import { FMParameters } from '../types/fmParameters';
import { InstantaneousValues, TimeDomainConfig } from '../types/timeDomain';

/**
 * Calculates values of the 4 signals at a given time t (in seconds).
 *
 * @param t_sec Time in seconds
 * @param params FM configuration parameters
 * @param Ac Carrier reference amplitude in Volts
 * @param mu AM modulation index reference (illustrative for DSBFC)
 * @param useNormalizedCarrier If true (macro window), uses visual carrier frequency
 *                             to prevent high-frequency aliasing while preserving FM modulation dynamics.
 */
export function calculateSignalsAtTime(
  t_sec: number,
  params: FMParameters,
  Ac: number,
  mu: number,
  useNormalizedCarrier: boolean = false
): InstantaneousValues {
  const { Am, fm_kHz, fc_kHz, beta } = params;

  const fm_Hz = fm_kHz * 1000;
  const fc_Hz = fc_kHz * 1000;

  // Modulating signal: m(t) = Am * cos(2 * pi * fm * t)
  // When fm_Hz = 0, cos(0) = 1, so m(t) = Am (constant DC)
  const m_t = fm_Hz > 0 ? Am * Math.cos(2 * Math.PI * fm_Hz * t_sec) : Am;

  // Determine carrier frequency for calculation
  let effectiveFc_Hz = fc_Hz;
  if (useNormalizedCarrier) {
    // In macro view, scale carrier relative to modulating frequency
    // (18 cycles per modulating period) to reveal wave crests and valleys legibly
    effectiveFc_Hz = fm_Hz > 0 ? fm_Hz * 18 : 2000;
  }

  // Carrier signal: c(t) = Ac * cos(2 * pi * fc * t)
  const c_t = effectiveFc_Hz > 0 ? Ac * Math.cos(2 * Math.PI * effectiveFc_Hz * t_sec) : Ac;

  // FM Modulated Signal: s_FM(t) = Ac * cos(2 * pi * fc * t + beta * sin(2 * pi * fm * t))
  const phaseModulation = fm_Hz > 0 ? beta * Math.sin(2 * Math.PI * fm_Hz * t_sec) : 0;
  const s_fm_t = Ac * Math.cos(2 * Math.PI * effectiveFc_Hz * t_sec + phaseModulation);

  // Instantaneous frequency: fi(t) = fc + deltaF * cos(2 * pi * fm * t)
  const deltaF_kHz = params.deltaF_kHz;
  const instFreq_kHz =
    fm_Hz > 0 ? fc_kHz + deltaF_kHz * Math.cos(2 * Math.PI * fm_Hz * t_sec) : fc_kHz;

  // DSBFC (AM) Modulated Signal: s_AM(t) = Ac * [1 + mu * cos(2 * pi * fm * t)] * cos(2 * pi * fc * t)
  const amEnvelopeFactor = fm_Hz > 0 ? 1 + mu * Math.cos(2 * Math.PI * fm_Hz * t_sec) : 1 + mu;
  const s_dsb_t = Ac * amEnvelopeFactor * Math.cos(2 * Math.PI * effectiveFc_Hz * t_sec);

  // Upper and lower envelope lines for DSBFC
  const env_upper = Ac * amEnvelopeFactor;
  const env_lower = -Ac * amEnvelopeFactor;

  return {
    time_ms: t_sec * 1000,
    modulating_V: Number(m_t.toFixed(3)),
    carrier_V: Number(c_t.toFixed(3)),
    fm_V: Number(s_fm_t.toFixed(3)),
    dsb_V: Number(s_dsb_t.toFixed(3)),
    envelope_upper_V: Number(env_upper.toFixed(3)),
    envelope_lower_V: Number(env_lower.toFixed(3)),
    instantaneousFreq_kHz: Number(instFreq_kHz.toFixed(2)),
  };
}

/**
 * Calculates optimal visual time window in milliseconds based on user parameters and selected mode.
 */
export function getRecommendedTimeWindow(
  params: FMParameters,
  mode: 'modulating_period' | 'carrier_zoom'
): { window_ms: number; description: string; timePerDiv_ms: number } {
  const fm_Hz = params.fm_kHz * 1000;
  const fc_Hz = params.fc_kHz * 1000;

  if (mode === 'modulating_period') {
    // Show approx 2 to 3 complete cycles of modulating signal
    const Tm_sec = fm_Hz > 0 ? 1 / fm_Hz : 0.001;
    const window_sec = Tm_sec * 2.5;
    const window_ms = Math.max(window_sec * 1000, 0.05);
    const timePerDiv_ms = window_ms / 10; // 10 divisions on oscilloscope grid

    return {
      window_ms,
      timePerDiv_ms,
      description: `Escala macro (2.5 períodos de fm): Tm = ${(Tm_sec * 1000).toFixed(3)} ms`,
    };
  } else {
    // Zoom on carrier frequency: show 12 to 15 cycles of carrier
    const Tc_sec = fc_Hz > 0 ? 1 / fc_Hz : 0.00001;
    const window_sec = Tc_sec * 12;
    const window_ms = Math.max(window_sec * 1000, 0.0001);
    const timePerDiv_ms = window_ms / 10;

    return {
      window_ms,
      timePerDiv_ms,
      description: `Zoom de portadora física: Tc = ${(Tc_sec * 1e6).toFixed(3)} µs (fc = ${params.fc_kHz} kHz)`,
    };
  }
}
