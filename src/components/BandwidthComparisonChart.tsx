import React, { useState } from 'react';
import {
  BesselBandwidthResult,
  CarsonBandwidthResult,
  BesselThresholdType,
} from '../types/results';
import { Layers, Activity, Info, BarChart2 } from 'lucide-react';

interface BandwidthComparisonChartProps {
  bessel1Pct: BesselBandwidthResult;
  bessel5Pct: BesselBandwidthResult;
  carsonBW: CarsonBandwidthResult;
  fm_kHz: number;
  deltaF_kHz: number;
}

export const BandwidthComparisonChart: React.FC<BandwidthComparisonChartProps> = ({
  bessel1Pct,
  bessel5Pct,
  carsonBW,
  fm_kHz,
  deltaF_kHz,
}) => {
  const [selectedThreshold, setSelectedThreshold] = useState<BesselThresholdType>('1_percent');

  const activeBessel = selectedThreshold === '1_percent' ? bessel1Pct : bessel5Pct;

  // Max bandwidth for chart scaling
  const maxBW = Math.max(carsonBW.bw_kHz, bessel1Pct.bw_kHz, bessel5Pct.bw_kHz, 10);
  const chartScale = Math.ceil(maxBW * 1.15);

  const carsonPercent = (carsonBW.bw_kHz / chartScale) * 100;
  const besselPercent = (activeBessel.bw_kHz / chartScale) * 100;

  // Differences
  const diff_kHz = Number((activeBessel.bw_kHz - carsonBW.bw_kHz).toFixed(3));
  const diffPercent =
    carsonBW.bw_kHz > 0
      ? Number(((Math.abs(diff_kHz) / carsonBW.bw_kHz) * 100).toFixed(2))
      : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
              BW
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Visualización Comparativa: Ancho de Banda Bessel vs Regla de Carson
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparación dimensional directa del espectro ocupado calculado mediante el criterio analítico de Bessel y la aproximación de Carson.
          </p>
        </div>

        {/* Bessel Threshold Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs shrink-0 font-mono">
          <button
            type="button"
            onClick={() => setSelectedThreshold('1_percent')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedThreshold === '1_percent'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criterio Bessel 1% (|Jn| ≥ 0.01)
          </button>
          <button
            type="button"
            onClick={() => setSelectedThreshold('5_percent')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedThreshold === '5_percent'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criterio Bessel 5% (|Jn| ≥ 0.05)
          </button>
        </div>
      </div>

      {/* Comparative Horizontal Bar Visualization */}
      <div className="space-y-5 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        {/* Method 1: Regla de Carson */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-bold text-amber-300">Regla de Carson</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">
                (Aproximación para ~98% de potencia: 2·(Δf + fm))
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white text-sm">
                {carsonBW.bw_kHz.toLocaleString()} kHz
              </span>
              <span className="text-slate-500 text-[11px] ml-1">
                ({(carsonBW.bw_kHz / 1000).toFixed(3)} MHz)
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-lg h-7 overflow-hidden border border-slate-800 relative">
            <div
              style={{ width: `${Math.min(carsonPercent, 100)}%` }}
              className="h-full bg-amber-500/90 rounded-r flex items-center px-3 font-mono text-[11px] font-bold text-slate-950 transition-all duration-300 shadow-md shadow-amber-500/20"
            >
              Carson: {carsonBW.bw_kHz} kHz
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Fórmula: 2 × ({deltaF_kHz} kHz + {fm_kHz} kHz) = {carsonBW.bw_kHz} kHz
          </p>
        </div>

        {/* Method 2: Criterio de Bessel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="font-bold text-cyan-300">Criterio de Bessel</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">
                ({activeBessel.thresholdDescription} · nmax = {activeBessel.nMax})
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white text-sm">
                {activeBessel.bw_kHz.toLocaleString()} kHz
              </span>
              <span className="text-slate-500 text-[11px] ml-1">
                ({(activeBessel.bw_kHz / 1000).toFixed(3)} MHz)
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-lg h-7 overflow-hidden border border-slate-800 relative">
            <div
              style={{ width: `${Math.min(besselPercent, 100)}%` }}
              className="h-full bg-cyan-500/90 rounded-r flex items-center px-3 font-mono text-[11px] font-bold text-slate-950 transition-all duration-300 shadow-md shadow-cyan-500/20"
            >
              Bessel ({selectedThreshold === '1_percent' ? '1%' : '5%'}): {activeBessel.bw_kHz} kHz
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Fórmula: 2 × nmax × fm = 2 × {activeBessel.nMax} × {fm_kHz} kHz = {activeBessel.bw_kHz} kHz
          </p>
        </div>

        {/* Discrepancy / Delta Indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Discrepancia entre métodos:</span>
            <span
              className={`font-bold ${
                diff_kHz === 0
                  ? 'text-emerald-400'
                  : diff_kHz > 0
                  ? 'text-cyan-300'
                  : 'text-amber-300'
              }`}
            >
              Δ = {diff_kHz >= 0 ? `+${diff_kHz}` : diff_kHz} kHz ({diffPercent}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {diff_kHz === 0
              ? 'Convergencia exacta entre ambos métodos.'
              : diff_kHz > 0
              ? 'El criterio de Bessel retiene más bandas laterales de bajo nivel.'
              : 'La regla de Carson contempla un margen mayor que el umbral de truncamiento.'}
          </span>
        </div>
      </div>

      {/* Explanatory Technical Note */}
      <div className="mt-4 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">
            ¿Por qué difieren el ancho de banda de Bessel y la regla de Carson?
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            La regla de Carson es una fórmula empírica de diseño simplificado que estima el ancho de banda conteniendo aproximadamente el 98% de la potencia total ($BW \approx 2(\Delta f + f_m)$). En contraste, el criterio de Bessel suma explícitamente los órdenes armónicos discretos que superan el umbral de corte seleccionado ($1\%$ o $5\%$ de la portadora no modulada), por lo que el resultado exacto varía en función del criterio de significancia adoptado.
          </p>
        </div>
      </div>
    </div>
  );
};
