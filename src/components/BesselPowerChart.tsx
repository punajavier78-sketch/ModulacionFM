import React, { useState } from 'react';
import { BesselComponent } from '../types/frequencyDomain';
import { calculateTotalPower } from '../utils/bessel';
import { Zap, CheckCircle2 } from 'lucide-react';

interface BesselPowerChartProps {
  components: BesselComponent[];
  beta: number;
}

export const BesselPowerChart: React.FC<BesselPowerChartProps> = ({ components, beta }) => {
  const [hoveredComp, setHoveredComp] = useState<BesselComponent | null>(null);

  // Total relative power accounted for
  const totalPower = calculateTotalPower(components);
  const totalPowerPercent = Number((totalPower * 100).toFixed(2));

  // Max power percentage for scaling
  const maxPowerPercent = Math.max(...components.map((c) => c.powerPercent), 10);
  const pScale = Math.min(Math.ceil((maxPowerPercent * 1.2) / 10) * 10, 100);

  // Grouped breakdown: Carrier power vs Sidebands power
  const carrierComp = components.find((c) => c.order === 0);
  const carrierPowerPercent = carrierComp ? carrierComp.powerPercent : 0;
  const sidebandsPowerPercent = Number((totalPowerPercent - carrierPowerPercent).toFixed(2));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              P
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Gráfica de Potencia Espectral Relativa: Jn(β)²
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Distribución cuadrática de potencia por componente espectral. En modulación FM, la potencia total transmitida se conserva inalterable igual a la de la portadora pura.
          </p>
        </div>

        {/* Conservation of Power Badge */}
        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Σ Pn = {totalPowerPercent}% de P_total</span>
        </div>
      </div>

      {/* Power Bar Chart Container */}
      <div className="relative w-full h-56 sm:h-64 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-x-auto">
        {/* Power Scale Marks */}
        <div className="absolute left-3 top-3 text-[10px] font-mono text-slate-500">
          {pScale}% P_tot
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
          {(pScale / 2).toFixed(0)}%
        </div>
        <div className="absolute left-3 bottom-8 text-[10px] font-mono text-slate-500">
          0.0%
        </div>

        {/* Baseline Line */}
        <div className="absolute left-14 right-4 bottom-7 h-px bg-slate-700 pointer-events-none" />

        {/* Power Bars Grid */}
        <div className="ml-14 h-full flex items-end justify-around gap-1.5 sm:gap-2 pb-7">
          {components.map((comp) => {
            const isCarrier = comp.order === 0;
            const barHeightPercent = Math.min((comp.powerPercent / pScale) * 100, 100);
            const isHovered = hoveredComp === comp;

            return (
              <div
                key={comp.order}
                onMouseEnter={() => setHoveredComp(comp)}
                onMouseLeave={() => setHoveredComp(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              >
                {/* Bar */}
                <div
                  style={{ height: `${Math.max(barHeightPercent, 2)}%` }}
                  className={`w-4 sm:w-6 rounded-t transition-all duration-150 ${
                    isCarrier
                      ? 'bg-amber-400 shadow-md shadow-amber-500/20'
                      : isHovered
                      ? 'bg-emerald-300 shadow-md shadow-emerald-400/40'
                      : 'bg-emerald-500 hover:bg-emerald-400'
                  }`}
                />

                {/* Numerical power percentage label above bar if significant */}
                {comp.powerPercent >= 2.0 && (
                  <div className="absolute -top-5 text-[9px] font-mono text-slate-300 font-bold whitespace-nowrap">
                    {comp.powerPercent}%
                  </div>
                )}

                {/* Order label below */}
                <div className="absolute -bottom-6 text-center font-mono text-[10px] sm:text-xs">
                  <span
                    className={`font-semibold ${
                      isCarrier ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    n={comp.order > 0 ? `+${comp.order}` : comp.order}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Power Breakdown Summary Row */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Potencia en Portadora (n=0):</span>
          <span className="text-amber-400 font-bold">{carrierPowerPercent}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Potencia en Bandas Laterales:</span>
          <span className="text-emerald-400 font-bold">{sidebandsPowerPercent}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Conservación Total:</span>
          <span className="text-cyan-400 font-bold">{totalPowerPercent}%</span>
        </div>
      </div>

      {/* Hover Readout or Helper */}
      <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono">
        {hoveredComp ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-emerald-400 font-bold">
                Orden n = {hoveredComp.order} ({hoveredComp.label}):
              </span>{' '}
              <span className="text-slate-300">f = {hoveredComp.freq_kHz.toLocaleString()} kHz</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Pn relativo = <strong className="text-white">{hoveredComp.powerRelative}</strong>
              </span>
              <span className="text-slate-400">
                Aporte = <strong className="text-emerald-300">{hoveredComp.powerPercent}%</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              La potencia relativa se evalúa como Pn = Jn(β)². Todas las magnitudes son no negativas y su sumatoria preserva el 100% de la energía de la portadora.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
