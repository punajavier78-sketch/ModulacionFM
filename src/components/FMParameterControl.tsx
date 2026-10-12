import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FMParameterControlProps {
  id: string;
  name: string;
  symbol: string;
  value: number; // Value in base unit (e.g. kHz for deltaF, V for Am, etc.)
  min: number;
  max: number;
  step: number;
  primaryUnit: string;
  secondaryUnit?: string;
  secondaryUnitValue?: string;
  description: string;
  inconsistencyWarning?: string | null;
  isConsistent?: boolean;
  onChange: (newValue: number) => void;
  // Unit conversion helper if applicable
  unitToggle?: {
    currentUnit: string;
    availableUnits: string[];
    onToggleUnit: (unit: string) => void;
    displayMultiplier: number; // e.g. 1000 to show in Hz if stored in kHz
  };
}

export const FMParameterControl: React.FC<FMParameterControlProps> = ({
  id,
  name,
  symbol,
  value,
  min,
  max,
  step,
  primaryUnit,
  secondaryUnit,
  secondaryUnitValue,
  description,
  inconsistencyWarning,
  isConsistent,
  onChange,
  unitToggle,
}) => {
  // Determine displayed numerical value based on active unit toggle
  const multiplier = unitToggle ? unitToggle.displayMultiplier : 1;
  const displayVal = Number((value * multiplier).toFixed(3));
  const displayMin = min * multiplier;
  const displayMax = max * multiplier;
  const displayStep = step * multiplier;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    if (!isNaN(rawVal)) {
      const baseValue = Number((rawVal / multiplier).toFixed(3));
      onChange(Math.min(Math.max(baseValue, min), max));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    if (!isNaN(rawVal)) {
      const baseValue = Number((rawVal / multiplier).toFixed(3));
      // Clamp within allowable limits
      const clampedValue = Math.min(Math.max(baseValue, min), max);
      onChange(clampedValue);
    }
  };

  // Check if current value is out of bounds
  const isOutOfRange = value < min || value > max;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        inconsistencyWarning || isOutOfRange
          ? 'bg-rose-950/20 border-rose-800/60 shadow-sm shadow-rose-950/30'
          : isConsistent
          ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-800/60'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Title & Symbol Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono font-bold text-sm shrink-0">
              {symbol}
            </span>
            <label htmlFor={`num-${id}`} className="font-semibold text-slate-200 text-sm">
              {name}
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">{description}</p>
        </div>

        {/* Unit Selector or Badge */}
        <div className="shrink-0 flex items-center gap-1">
          {unitToggle ? (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {unitToggle.availableUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => unitToggle.onToggleUnit(u)}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
                    unitToggle.currentUnit === u
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-mono font-medium text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md">
              {primaryUnit}
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Slider & Numeric Input Controls */}
      <div className="mt-3.5 space-y-3">
        {/* Numeric input row */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Rango: [{displayMin} – {displayMax} {unitToggle ? unitToggle.currentUnit : primaryUnit}]
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <input
              id={`num-${id}`}
              type="number"
              value={displayVal}
              min={displayMin}
              max={displayMax}
              step={displayStep}
              onChange={handleNumberChange}
              className={`w-28 sm:w-32 px-2.5 py-1.5 rounded-lg bg-slate-950 border font-mono text-sm text-right text-white focus:outline-none focus:ring-2 transition-all ${
                isOutOfRange || inconsistencyWarning
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            />
            <span className="text-xs font-mono text-slate-400 w-10">
              {unitToggle ? unitToggle.currentUnit : primaryUnit}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative pt-1">
          <input
            id={`range-${id}`}
            type="range"
            value={displayVal}
            min={displayMin}
            max={displayMax}
            step={displayStep}
            onChange={handleSliderChange}
            aria-label={`${name} (${symbol})`}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{displayMin}</span>
            <span>{((displayMin + displayMax) / 2).toFixed(1)}</span>
            <span>{displayMax}</span>
          </div>
        </div>

        {/* Dual unit conversion display hint if applicable */}
        {secondaryUnit && secondaryUnitValue && (
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-end gap-1">
            <span className="text-slate-500">Equivalencia:</span>
            <span className="text-slate-300 font-medium">{secondaryUnitValue}</span>
          </div>
        )}

        {/* Inconsistency or Out of bounds alert */}
        {inconsistencyWarning ? (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-tight">{inconsistencyWarning}</p>
          </div>
        ) : isConsistent ? (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Valor matemáticamente verificado</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
