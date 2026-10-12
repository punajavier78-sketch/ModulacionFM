import React, { useMemo } from 'react';
import { FMParameters } from '../types/fmParameters';
import { SpectralLine } from '../types/frequencyDomain';
import { generateBesselComponents } from '../utils/bessel';
import { SpectrumPlot } from './SpectrumPlot';
import { BesselVoltageChart } from './BesselVoltageChart';
import { BesselPowerChart } from './BesselPowerChart';
import {
  Activity,
  Sliders,
  BarChart3,
  Waves,
  ClipboardList,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface FrequencyDomainVisualizerProps {
  params: FMParameters;
  onNavigateToModule2: () => void;
  onNavigateToModule3: () => void;
  onNavigateToModule5?: () => void;
}

export const FrequencyDomainVisualizer: React.FC<FrequencyDomainVisualizerProps> = ({
  params,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule5,
}) => {
  const Ac = 5.0; // Reference carrier amplitude: 5.0 V
  const mu = 0.7; // AM DSBFC illustrative index: 0.70 (consistent with Module 3)

  const { beta, deltaF_kHz, fm_kHz, fc_kHz, Am } = params;

  // Generate Bessel components for FM (orders -8 to +8)
  const besselComponents = useMemo(() => {
    return generateBesselComponents(params, Ac, 8);
  }, [params, Ac]);

  // 1. Modulating Signal Spectrum Lines
  const modulatingLines: SpectralLine[] = useMemo(() => {
    if (fm_kHz <= 0) {
      // DC message
      return [{ freq_kHz: 0, amplitude_V: Am, label: 'fm = 0 (DC)', type: 'modulating' }];
    }
    return [
      {
        freq_kHz: fm_kHz,
        amplitude_V: Am,
        label: `fm = ${fm_kHz} kHz`,
        type: 'modulating',
      },
    ];
  }, [fm_kHz, Am]);

  // 2. Unmodulated Carrier Spectrum Lines
  const carrierLines: SpectralLine[] = useMemo(() => {
    return [
      {
        freq_kHz: fc_kHz,
        amplitude_V: Ac,
        label: `fc = ${fc_kHz} kHz`,
        type: 'carrier',
      },
    ];
  }, [fc_kHz, Ac]);

  // 3. FM Modulated Spectrum Lines
  const fmLines: SpectralLine[] = useMemo(() => {
    return besselComponents
      .filter((c) => c.absVoltage_V >= 0.01) // Filter out negligible components below 10 mV
      .map((c) => ({
        freq_kHz: c.freq_kHz,
        amplitude_V: c.absVoltage_V,
        label: c.order === 0 ? 'fc' : c.order > 0 ? `+${c.order}·fm` : `${c.order}·fm`,
        sublabel: `${c.absVoltage_V.toFixed(2)}V`,
        type: c.order === 0 ? ('carrier' as const) : ('sideband' as const),
      }));
  }, [besselComponents]);

  // 4. DSBFC AM Spectrum Lines
  const dsbLines: SpectralLine[] = useMemo(() => {
    const sidebandAmp = Number(((mu * Ac) / 2).toFixed(3));
    const lines: SpectralLine[] = [
      {
        freq_kHz: fc_kHz,
        amplitude_V: Ac,
        label: 'fc (Portadora)',
        type: 'carrier',
      },
    ];

    if (fm_kHz > 0) {
      const lowerFreq = Number((fc_kHz - fm_kHz).toFixed(3));
      const upperFreq = Number((fc_kHz + fm_kHz).toFixed(3));

      if (lowerFreq >= 0) {
        lines.push({
          freq_kHz: lowerFreq,
          amplitude_V: sidebandAmp,
          label: 'fc - fm (BLI)',
          type: 'sideband',
        });
      }

      lines.push({
        freq_kHz: upperFreq,
        amplitude_V: sidebandAmp,
        label: 'fc + fm (BLS)',
        type: 'sideband',
      });
    }

    // Sort by frequency
    return lines.sort((a, b) => a.freq_kHz - b.freq_kHz);
  }, [fc_kHz, fm_kHz, Ac, mu]);

  // Frequency span for centered plots (FM and DSBFC)
  const span_kHz = Math.max(fm_kHz * 7, deltaF_kHz * 1.5, 10);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Telecommunication Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full w-fit mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Módulo 4: Análisis en el Dominio de la Frecuencia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Análisis Espectral de Señales FM y Distribución de Bessel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Estudio de las componentes discretas del espectro de modulación angular FM, coeficientes Jn(β), potencias relativas Jn(β)² y contraste frente a modulación de amplitud DSBFC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={onNavigateToModule3}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Señales Temporales (Módulo 3)</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToModule2}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ajustar Parámetros (Módulo 2)</span>
            </button>
            {onNavigateToModule5 && (
              <button
                type="button"
                onClick={onNavigateToModule5}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Resultados y Comparación (Módulo 5) →</span>
              </button>
            )}
          </div>
        </div>

        {/* Current FM Parameter Badge Strip */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">β (Índice FM): </span>
            <span className="text-cyan-400 font-bold">{beta}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Δf (Desviación): </span>
            <span className="text-cyan-300 font-bold">{deltaF_kHz} kHz</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">fm (Moduladora): </span>
            <span className="text-emerald-400 font-bold">{fm_kHz} kHz</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">fc (Portadora): </span>
            <span className="text-amber-400 font-bold">
              {fc_kHz >= 1000 ? `${(fc_kHz / 1000).toFixed(3)} MHz` : `${fc_kHz} kHz`}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Ac: </span>
            <span className="text-white font-bold">{Ac.toFixed(1)} V</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">μ (AM ref.): </span>
            <span className="text-fuchsia-400 font-bold">{mu.toFixed(2)} (70%)</span>
          </div>
        </div>
      </div>

      {/* Part 1: Four Independent Frequency Spectra */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>1. Espectros Discretos de Frecuencia de las Cuatro Señales</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Gráfica 1: Espectro Señal Moduladora */}
          <SpectrumPlot
            title="Gráfica 1: Espectro de la Señal Moduladora"
            symbol="M(f)"
            lines={modulatingLines}
            color="#34d399" // Emerald
            accentBg="bg-emerald-950/60"
            centerFreq_kHz={fm_kHz}
            freqSpan_kHz={Math.max(fm_kHz * 1.5, 2)}
            freqUnitLabel="kHz"
            vMax_V={Math.max(Am * 1.3, 3.0)}
            note={`Tono puro sinusoidal en fm = ${fm_kHz} kHz con amplitud Am = ${Am} V`}
          />

          {/* Gráfica 2: Espectro Señal Portadora Sin Modular */}
          <SpectrumPlot
            title="Gráfica 2: Espectro de la Señal Portadora"
            symbol="C(f)"
            lines={carrierLines}
            color="#fbbf24" // Amber
            accentBg="bg-amber-950/60"
            centerFreq_kHz={fc_kHz}
            freqSpan_kHz={Math.max(span_kHz, 5)}
            freqUnitLabel={fc_kHz >= 1000 ? 'MHz (kHz)' : 'kHz'}
            vMax_V={Ac * 1.25}
            note={`Portadora de referencia pura en fc = ${fc_kHz.toLocaleString()} kHz con amplitud Ac = ${Ac} V`}
          />

          {/* Gráfica 3: Espectro Señal Modulada en FM */}
          <SpectrumPlot
            title="Gráfica 3: Espectro de la Señal FM (Funciones de Bessel)"
            symbol="SFM(f)"
            lines={fmLines}
            color="#38bdf8" // Cyan / Sky Blue
            accentBg="bg-cyan-950/60"
            centerFreq_kHz={fc_kHz}
            freqSpan_kHz={span_kHz}
            freqUnitLabel="kHz"
            vMax_V={Ac * 1.15}
            note={`Portadora central fc y bandas laterales fc ± n·fm calculadas con |Jn(β)|·Ac`}
          />

          {/* Gráfica 4: Espectro Señal AM DSBFC */}
          <SpectrumPlot
            title="Gráfica 4: Espectro de la Señal DSBFC (AM Portadora Completa)"
            symbol="SAM(f)"
            lines={dsbLines}
            color="#e879f9" // Fuchsia
            accentBg="bg-fuchsia-950/60"
            centerFreq_kHz={fc_kHz}
            freqSpan_kHz={span_kHz}
            freqUnitLabel="kHz"
            vMax_V={Ac * 1.15}
            note={`Portadora central en fc (5.0 V) y dos bandas laterales en fc ± fm (amplitud μ·Ac/2 = 1.75 V)`}
          />
        </div>
      </div>

      {/* Part 2: Bessel Voltage and Power Specific Graphs */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>2. Distribución Espectral de Coeficientes de Bessel Jn(β) para FM</span>
        </h3>

        <div className="space-y-6">
          {/* Gráfica de Voltaje frente a Coeficientes de Bessel */}
          <BesselVoltageChart
            components={besselComponents}
            beta={beta}
            Ac={Ac}
            fm_kHz={fm_kHz}
            fc_kHz={fc_kHz}
          />

          {/* Gráfica de Potencia frente a Coeficientes de Bessel */}
          <BesselPowerChart components={besselComponents} beta={beta} />
        </div>
      </div>

      {/* Part 3: Detailed Bessel Coefficient Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Tabla Numérica de Coeficientes de Bessel Jn({beta}) y Distribución Espectral</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">Orden n</th>
                <th className="py-2.5 px-3 font-semibold">Componente</th>
                <th className="py-2.5 px-3 font-semibold">Frecuencia [kHz]</th>
                <th className="py-2.5 px-3 font-semibold text-right">Coeficiente Jn(β)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Voltaje Pico [V]</th>
                <th className="py-2.5 px-3 font-semibold text-right">Potencia Jn²</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aporte Potencia [%]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {besselComponents.map((c) => {
                const isCarrier = c.order === 0;
                return (
                  <tr
                    key={c.order}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCarrier ? 'bg-amber-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <span
                        className={
                          isCarrier
                            ? 'text-amber-400'
                            : c.Jn < 0
                            ? 'text-rose-400'
                            : 'text-cyan-300'
                        }
                      >
                        n = {c.order > 0 ? `+${c.order}` : c.order}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{c.label}</td>
                    <td className="py-2 px-3 text-slate-200">{c.freq_kHz.toLocaleString()}</td>
                    <td
                      className={`py-2 px-3 text-right ${
                        c.Jn < 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'
                      }`}
                    >
                      {c.Jn > 0 ? `+${c.Jn.toFixed(5)}` : c.Jn.toFixed(5)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200">
                      {c.absVoltage_V.toFixed(3)} V
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-300">{c.powerRelative.toFixed(5)}</td>
                    <td className="py-2 px-3 text-right text-emerald-300">{c.powerPercent.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span className="text-[11px]">
            * Propiedad de simetría de Bessel: J_(-n)(β) = (-1)^n · J_n(β).
          </span>
          <span className="text-[11px] text-cyan-400">
            Análisis espectral calculado para β = {beta} y Ac = {Ac.toFixed(1)} V.
          </span>
        </div>
      </div>
    </div>
  );
};
