import React, { useRef, useEffect, useState } from 'react';
import { FMParameters } from '../types/fmParameters';
import { calculateSignalsAtTime } from '../utils/signalCalculations';

export type SignalType = 'modulating' | 'carrier' | 'fm' | 'dsb';

interface SignalCanvasProps {
  type: SignalType;
  title: string;
  symbol: string;
  formula: string;
  color: string;
  accentBg: string;
  params: FMParameters;
  Ac: number;
  mu: number;
  simulatedTime_sec: number;
  windowDuration_sec: number;
  useNormalizedCarrier: boolean;
  timeUnitLabel: string;
  timeMultiplier: number; // to convert seconds to the displayed unit (e.g. 1000 for ms, 1e6 for µs)
  vMax_V?: number; // max vertical range in Volts (e.g. 6V for +/- 6V)
  hoverFraction: number | null;
  onHoverTime: (fraction: number | null) => void;
}

export const SignalCanvas: React.FC<SignalCanvasProps> = ({
  type,
  title,
  symbol,
  formula,
  color,
  accentBg,
  params,
  Ac,
  mu,
  simulatedTime_sec,
  windowDuration_sec,
  useNormalizedCarrier,
  timeUnitLabel,
  timeMultiplier,
  vMax_V = 6.0,
  hoverFraction,
  onHoverTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instantaneousVal, setInstantaneousVal] = useState<number>(0);

  // Redraw canvas whenever time or parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background: Dark oscilloscope viewport
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Padding for axes & labels
    const padLeft = 45;
    const padRight = 15;
    const padTop = 15;
    const padBottom = 25;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const centerY = padTop + plotH / 2;

    // Draw Oscilloscope Graticule (10 horizontal div, 6 vertical div)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Vertical grid lines (time divisions)
    const numDivX = 10;
    for (let i = 0; i <= numDivX; i++) {
      const x = padLeft + (i / numDivX) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      // Time axis ticks and text
      if (i % 2 === 0) {
        const tVal = (i / numDivX) * windowDuration_sec * timeMultiplier;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tVal.toFixed(2), x, padTop + plotH + 16);
      }
    }

    // Horizontal grid lines (voltage divisions)
    const numDivY = 6;
    for (let j = 0; j <= numDivY; j++) {
      const y = padTop + (j / numDivY) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      // Voltage labels
      const vVal = vMax_V - (j / numDivY) * (2 * vMax_V);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${vVal.toFixed(1)}V`, padLeft - 6, y + 3.5);
    }

    // Center Baseline (0 Volts) highlighted
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, centerY);
    ctx.lineTo(padLeft + plotW, centerY);
    ctx.stroke();

    // Plot Border
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Compute Waveform Points
    const numPoints = Math.max(Math.floor(plotW * 2), 300);
    const points: { x: number; y: number }[] = [];
    const envUpperPoints: { x: number; y: number }[] = [];
    const envLowerPoints: { x: number; y: number }[] = [];

    // Window time range: [simulatedTime_sec, simulatedTime_sec + windowDuration_sec]
    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const t = simulatedTime_sec + frac * windowDuration_sec;
      const px = padLeft + frac * plotW;

      const signals = calculateSignalsAtTime(t, params, Ac, mu, useNormalizedCarrier);

      let valY = 0;
      if (type === 'modulating') valY = signals.modulating_V;
      else if (type === 'carrier') valY = signals.carrier_V;
      else if (type === 'fm') valY = signals.fm_V;
      else if (type === 'dsb') {
        valY = signals.dsb_V;
        // Collect envelope points for DSBFC
        const envU_px = centerY - (signals.envelope_upper_V / vMax_V) * (plotH / 2);
        const envL_px = centerY - (signals.envelope_lower_V / vMax_V) * (plotH / 2);
        envUpperPoints.push({ x: px, y: Math.min(Math.max(envU_px, padTop), padTop + plotH) });
        envLowerPoints.push({ x: px, y: Math.min(Math.max(envL_px, padTop), padTop + plotH) });
      }

      // Convert Voltage to canvas Y
      const py = centerY - (valY / vMax_V) * (plotH / 2);
      // Clamp to plot area
      const clampedY = Math.min(Math.max(py, padTop), padTop + plotH);
      points.push({ x: px, y: clampedY });
    }

    // If DSBFC, render envelope lines first (dashed style)
    if (type === 'dsb') {
      ctx.save();
      ctx.strokeStyle = '#f472b6'; // Rose pink envelope
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Upper envelope
      ctx.beginPath();
      envUpperPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Lower envelope
      ctx.beginPath();
      envLowerPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Render Primary Signal Waveform with glowing trace
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.setLineDash([]);

    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();

    // Calculate instantaneous value at hover or at the lead edge
    const inspectionFrac = hoverFraction !== null ? hoverFraction : 0;
    const inspectT = simulatedTime_sec + inspectionFrac * windowDuration_sec;
    const inspectSignals = calculateSignalsAtTime(inspectT, params, Ac, mu, useNormalizedCarrier);

    let currentVal = 0;
    if (type === 'modulating') currentVal = inspectSignals.modulating_V;
    else if (type === 'carrier') currentVal = inspectSignals.carrier_V;
    else if (type === 'fm') currentVal = inspectSignals.fm_V;
    else if (type === 'dsb') currentVal = inspectSignals.dsb_V;
    setInstantaneousVal(currentVal);

    // Draw vertical cursor bar if hovering
    if (hoverFraction !== null) {
      const curX = padLeft + hoverFraction * plotW;
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(curX, padTop);
      ctx.lineTo(curX, padTop + plotH);
      ctx.stroke();

      // Draw cursor point on the curve
      const curPy = centerY - (currentVal / vMax_V) * (plotH / 2);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, Math.min(Math.max(curPy, padTop), padTop + plotH), 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // Axis Units Label in corner
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Tiempo [${timeUnitLabel}]`, width - padRight, height - 6);

    ctx.textAlign = 'left';
    ctx.fillText(`Amplitud [V]`, 6, padTop - 4);
  }, [
    type,
    color,
    params,
    Ac,
    mu,
    simulatedTime_sec,
    windowDuration_sec,
    useNormalizedCarrier,
    timeUnitLabel,
    timeMultiplier,
    vMax_V,
    hoverFraction,
  ]);

  // Handle mouse movements over the plot for inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const padLeft = 45;
    const padRight = 15;
    const plotW = rect.width - padLeft - padRight;
    const mouseX = e.clientX - rect.left - padLeft;

    if (mouseX >= 0 && mouseX <= plotW) {
      const frac = mouseX / plotW;
      onHoverTime(frac);
    } else {
      onHoverTime(null);
    }
  };

  const handleMouseLeave = () => {
    onHoverTime(null);
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between"
    >
      {/* Header with Title, Formula, and Live Readout */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-lg ${accentBg} border border-slate-700/60 font-mono font-bold text-xs flex items-center justify-center`}
            style={{ color }}
          >
            {symbol}
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 leading-tight">{title}</h3>
            <p className="text-[11px] font-mono text-slate-400">{formula}</p>
          </div>
        </div>

        {/* Real-time voltage readout */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg font-mono text-xs">
          <span className="text-slate-400">v(t) =</span>
          <span className="font-bold tabular-nums" style={{ color }}>
            {instantaneousVal >= 0 ? `+${instantaneousVal.toFixed(2)}` : instantaneousVal.toFixed(2)} V
          </span>
          {type === 'dsb' && (
            <span className="text-[10px] text-pink-400 hidden sm:inline border-l border-slate-800 pl-2">
              (Envolvente activa)
            </span>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Footer Notes & Characteristic Marker */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {type === 'modulating' && `Am = ${params.Am} V · fm = ${params.fm_kHz} kHz`}
          {type === 'carrier' && `Ac = ${Ac.toFixed(1)} V · fc = ${params.fc_kHz} kHz`}
          {type === 'fm' && `Amplitud constante: ${Ac.toFixed(1)} V · Frecuencia instantánea variable (β = ${params.beta})`}
          {type === 'dsb' && `Portadora completa · Envolvente variable (μ = ${mu.toFixed(2)} ilustrativo)`}
        </span>
        <span className="font-mono text-[10px] text-slate-500">Escala: ±{vMax_V}V</span>
      </div>
    </div>
  );
};
