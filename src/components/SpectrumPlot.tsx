import React, { useRef, useEffect, useState } from 'react';
import { SpectralLine } from '../types/frequencyDomain';

interface SpectrumPlotProps {
  title: string;
  symbol: string;
  lines: SpectralLine[];
  color: string;
  accentBg: string;
  centerFreq_kHz?: number;
  freqSpan_kHz?: number;
  freqUnitLabel?: string;
  vMax_V?: number;
  note?: string;
}

export const SpectrumPlot: React.FC<SpectrumPlotProps> = ({
  title,
  symbol,
  lines,
  color,
  accentBg,
  centerFreq_kHz,
  freqSpan_kHz,
  freqUnitLabel = 'kHz',
  vMax_V = 6.0,
  note,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredLine, setHoveredLine] = useState<SpectralLine | null>(null);

  // Determine horizontal frequency bounds
  const freqs = lines.map((l) => l.freq_kHz);
  const minFreq = centerFreq_kHz !== undefined && freqSpan_kHz !== undefined
    ? Math.max(centerFreq_kHz - freqSpan_kHz, 0)
    : Math.max(Math.min(...freqs, 0) - (Math.max(...freqs) * 0.1 || 1), 0);
  const maxFreq = centerFreq_kHz !== undefined && freqSpan_kHz !== undefined
    ? centerFreq_kHz + freqSpan_kHz
    : Math.max(...freqs) * 1.25 || 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dark spectrum analyzer display
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 32;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const baselineY = padTop + plotH;

    // Grid Graticule
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // 8 Horizontal voltage divisions
    const numDivY = 5;
    for (let j = 0; j <= numDivY; j++) {
      const y = padTop + (j / numDivY) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      const vVal = vMax_V * (1 - j / numDivY);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${vVal.toFixed(1)}V`, padLeft - 6, y + 3.5);
    }

    // 10 Vertical frequency divisions
    const numDivX = 8;
    for (let i = 0; i <= numDivX; i++) {
      const x = padLeft + (i / numDivX) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      const fVal = minFreq + (i / numDivX) * (maxFreq - minFreq);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const labelText = fVal >= 1000 ? `${(fVal / 1000).toFixed(2)}M` : `${fVal.toFixed(1)}`;
      ctx.fillText(labelText, x, padTop + plotH + 16);
    }

    // Baseline axis
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, baselineY);
    ctx.lineTo(padLeft + plotW, baselineY);
    ctx.stroke();

    // Plot Border
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Draw Discrete Spectral Lines (Stem plot)
    const rangeF = maxFreq - minFreq || 1;

    lines.forEach((line) => {
      const clampedAmp = Math.min(Math.max(line.amplitude_V, 0), vMax_V);
      const fracX = (line.freq_kHz - minFreq) / rangeF;

      if (fracX >= -0.01 && fracX <= 1.01) {
        const x = padLeft + fracX * plotW;
        const stemHeight = (clampedAmp / vMax_V) * plotH;
        const yTop = baselineY - stemHeight;

        const isHovered = hoveredLine === line;

        // Vertical stem line
        ctx.save();
        ctx.strokeStyle = isHovered ? '#ffffff' : color;
        ctx.lineWidth = isHovered ? 2.5 : 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = isHovered ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(x, baselineY);
        ctx.lineTo(x, yTop);
        ctx.stroke();

        // Terminal circle marker on top
        ctx.fillStyle = isHovered ? '#ffffff' : color;
        ctx.beginPath();
        ctx.arc(x, yTop, isHovered ? 4.5 : 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // If prominent line or hovered, draw amplitude tag on top
        if (isHovered || line.amplitude_V > vMax_V * 0.15 || lines.length <= 4) {
          ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${line.amplitude_V.toFixed(2)}V`, x, Math.max(yTop - 6, padTop + 10));
        }
      }
    });

    // Axis Units Label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Frecuencia [${freqUnitLabel}]`, width - padRight, height - 6);

    ctx.textAlign = 'left';
    ctx.fillText(`Amplitud [V]`, 6, padTop - 5);
  }, [lines, minFreq, maxFreq, vMax_V, color, freqUnitLabel, hoveredLine]);

  // Handle hovering over spectral lines to inspect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const padLeft = 45;
    const padRight = 20;
    const plotW = rect.width - padLeft - padRight;
    const mouseX = e.clientX - rect.left - padLeft;

    if (mouseX >= 0 && mouseX <= plotW) {
      const rangeF = maxFreq - minFreq || 1;
      const targetFreq = minFreq + (mouseX / plotW) * rangeF;

      // Find closest spectral line within 15px
      let closest: SpectralLine | null = null;
      let minDistancePx = Infinity;

      lines.forEach((line) => {
        const lineFrac = (line.freq_kHz - minFreq) / rangeF;
        const linePx = lineFrac * plotW;
        const dist = Math.abs(mouseX - linePx);
        if (dist < 18 && dist < minDistancePx) {
          minDistancePx = dist;
          closest = line;
        }
      });

      setHoveredLine(closest);
    } else {
      setHoveredLine(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredLine(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
      {/* Header with Title and Readout */}
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
            <p className="text-[11px] text-slate-400 font-mono">
              {lines.length} componente{lines.length !== 1 ? 's' : ''} espectral{lines.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Hover inspection readout */}
        {hoveredLine ? (
          <div className="bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg font-mono text-xs text-right">
            <span className="text-cyan-300 font-bold">{hoveredLine.label}: </span>
            <span className="text-slate-300">
              {hoveredLine.freq_kHz >= 1000
                ? `${(hoveredLine.freq_kHz / 1000).toFixed(4)} MHz`
                : `${hoveredLine.freq_kHz.toFixed(2)} kHz`}
            </span>
            <span className="text-slate-500"> · </span>
            <span className="text-emerald-400 font-bold">{hoveredLine.amplitude_V.toFixed(2)} V</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Pase el cursor sobre las líneas para inspeccionar
          </div>
        )}
      </div>

      {/* Canvas Spectrum Display */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Footer Note */}
      {note && (
        <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>{note}</span>
          <span className="text-slate-500 text-[10px]">Espectro Discreto</span>
        </div>
      )}
    </div>
  );
};
