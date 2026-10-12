import React, { useState } from 'react';
import { BesselComponent } from '../types/frequencyDomain';
import { Info } from 'lucide-react';

interface BesselVoltageChartProps {
  components: BesselComponent[];
  beta: number;
  Ac: number;
  fm_kHz: number;
  fc_kHz: number;
}

export const BesselVoltageChart: React.FC<BesselVoltageChartProps> = ({
  components,
  beta,
  Ac,
  fm_kHz,
  fc_kHz,
}) => {
  const [hoveredComp, setHoveredComp] = useState<BesselComponent | null>(null);

  // Maximum absolute voltage or Jn for vertical axis normalization
  const maxAbsJn = Math.max(...components.map((c) => Math.abs(c.Jn)), 0.6);
  const maxVoltage = Number((maxAbsJn * Ac).toFixed(2));
  const vScale = Math.max(Math.ceil(maxVoltage * 1.2), 3); // round axis to clean range

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
              Jn
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Gráfica de Voltaje y Coeficientes de Bessel con Signo: Jn(β)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Representación con polaridad de las componentes espectrales. Los coeficientes negativos indican desfase de 180° (π rad) respecto a la portadora.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
          <span className="text-slate-400">β =</span>
          <span className="text-cyan-400 font-bold">{beta}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Ac =</span>
          <span className="text-emerald-400 font-bold">{Ac.toFixed(1)} V</span>
        </div>
      </div>

      {/* Main Signed Bar/Stem Chart Container */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-x-auto">
        {/* Voltage Scale Marks (Top, Center 0V, Bottom) */}
        <div className="absolute left-3 top-3 text-[10px] font-mono text-slate-500">
          +{vScale.toFixed(1)} V (+{(vScale / Ac).toFixed(2)} Jn)
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
          0.0 V (Jn = 0)
        </div>
        <div className="absolute left-3 bottom-8 text-[10px] font-mono text-slate-500">
          -{vScale.toFixed(1)} V (-{(vScale / Ac).toFixed(2)} Jn)
        </div>

        {/* Center Zero Horizontal Axis Line */}
        <div className="absolute left-16 right-4 top-1/2 h-px bg-slate-700 pointer-events-none" />

        {/* Grid of Component Bars */}
        <div className="ml-16 h-full flex items-center justify-around gap-1.5 sm:gap-2">
          {components.map((comp) => {
            const isCarrier = comp.order === 0;
            const isNegative = comp.Jn < 0;
            const barHeightPercent = Math.min((Math.abs(comp.voltage_V) / vScale) * 45, 45); // up to 45% of height from center

            const isHovered = hoveredComp === comp;

            return (
              <div
                key={comp.order}
                onMouseEnter={() => setHoveredComp(comp)}
                onMouseLeave={() => setHoveredComp(null)}
                className="flex-1 flex flex-col items-center justify-center h-full relative group cursor-pointer"
              >
                {/* Upper bar area (for positive Jn) */}
                <div className="h-1/2 w-full flex items-end justify-center pb-px">
                  {!isNegative && comp.voltage_V > 0 && (
                    <div
                      style={{ height: `${barHeightPercent * 2}%` }}
                      className={`w-4 sm:w-6 rounded-t transition-all duration-150 ${
                        isCarrier
                          ? 'bg-amber-400 shadow-md shadow-amber-500/20'
                          : isHovered
                          ? 'bg-cyan-300 shadow-md shadow-cyan-400/40'
                          : 'bg-cyan-500 hover:bg-cyan-400'
                      }`}
                    />
                  )}
                </div>

                {/* Lower bar area (for negative Jn) */}
                <div className="h-1/2 w-full flex items-start justify-center pt-px">
                  {isNegative && (
                    <div
                      style={{ height: `${barHeightPercent * 2}%` }}
                      className={`w-4 sm:w-6 rounded-b transition-all duration-150 ${
                        isHovered
                          ? 'bg-rose-400 shadow-md shadow-rose-500/40'
                          : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    />
                  )}
                </div>

                {/* Order label below */}
                <div className="absolute bottom-1 text-center font-mono text-[10px] sm:text-xs">
                  <span
                    className={`font-semibold ${
                      isCarrier
                        ? 'text-amber-400'
                        : isNegative
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    n={comp.order > 0 ? `+${comp.order}` : comp.order}
                  </span>
                </div>

                {/* Value tag on top or bottom */}
                <div
                  className={`absolute font-mono text-[9px] pointer-events-none transition-opacity ${
                    isHovered ? 'opacity-100 z-20' : 'opacity-0 group-hover:opacity-100'
                  } ${!isNegative ? 'top-2' : 'bottom-9'}`}
                >
                  <span className="bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-white font-bold">
                    {comp.Jn > 0 ? `+${comp.Jn.toFixed(3)}` : comp.Jn.toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Readout Strip */}
      <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between text-xs font-mono gap-2">
        {hoveredComp ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">
                Orden n = {hoveredComp.order} ({hoveredComp.label}):
              </span>
              <span className="text-slate-300">
                f = {hoveredComp.freq_kHz.toLocaleString()} kHz
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Jn(β) ={' '}
                <strong
                  className={hoveredComp.Jn < 0 ? 'text-rose-400' : 'text-emerald-400'}
                >
                  {hoveredComp.Jn > 0 ? `+${hoveredComp.Jn}` : hoveredComp.Jn}
                </strong>
              </span>
              <span className="text-slate-400">
                Voltaje pico ={' '}
                <strong
                  className={hoveredComp.voltage_V < 0 ? 'text-rose-400' : 'text-cyan-300'}
                >
                  {hoveredComp.voltage_V > 0
                    ? `+${hoveredComp.voltage_V.toFixed(3)} V`
                    : `${hoveredComp.voltage_V.toFixed(3)} V`}
                </strong>
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Pase el cursor sobre cualquier barra para inspeccionar el orden n, frecuencia exacta, coeficiente Jn con polaridad y voltaje de pico.
            </span>
          </div>
        )}
      </div>

      {/* Legend & Clarifications */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span>Portadora (n = 0)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Coeficiente Positivo (+Jn)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" />
            <span>Coeficiente Negativo (-Jn, inversión 180°)</span>
          </span>
        </div>
        <span className="text-slate-500 font-mono">Magnitud: Voltaje Pico Vn = Ac·Jn(β)</span>
      </div>
    </div>
  );
};
