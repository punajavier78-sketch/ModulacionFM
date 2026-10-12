import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Radio,
  Layers,
  ZoomIn,
  Clock,
  Eye,
  Activity,
  BarChart3,
  Sparkles,
  Info,
} from 'lucide-react';
import { FMParameters } from '../types/fmParameters';
import { TimeWindowMode } from '../types/timeDomain';
import { getRecommendedTimeWindow } from '../utils/signalCalculations';
import { SignalCanvas } from './SignalCanvas';

interface TimeDomainVisualizerProps {
  params: FMParameters;
  onNavigateToModule2: () => void;
  onNavigateToModule4?: () => void;
}

export const TimeDomainVisualizer: React.FC<TimeDomainVisualizerProps> = ({
  params,
  onNavigateToModule2,
  onNavigateToModule4,
}) => {
  // Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulatedTime_sec, setSimulatedTime_sec] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.0);

  // Time window view mode
  const [windowMode, setWindowMode] = useState<TimeWindowMode>('modulating_period');

  // Interactive cross-hair synchronized hover fraction (0 to 1)
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);

  // Reference Carrier Amplitude (Ac) and AM Modulation Index (mu)
  const Ac = 5.0; // 5.0 Volts constant reference carrier amplitude
  const mu = 0.7; // 0.70 (70%) illustrative reference AM index as specified in requirement 4

  // Determine window duration in seconds based on parameters and mode
  const { window_ms, description: windowDescription } = useMemo(() => {
    return getRecommendedTimeWindow(params, windowMode);
  }, [params, windowMode]);

  const windowDuration_sec = window_ms / 1000;
  const useNormalizedCarrier = windowMode === 'modulating_period';

  // RequestAnimationFrame animation loop
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current !== null && isPlaying) {
        const deltaMs = timestamp - lastTimestampRef.current;
        // In macro mode, scale speed so wave propagation is pleasant and observable (e.g. 1 cycle in ~4 seconds)
        const speedScale =
          windowMode === 'modulating_period'
            ? (windowDuration_sec / 4) * animationSpeed
            : (windowDuration_sec / 2) * animationSpeed;

        setSimulatedTime_sec((prev) => prev + (deltaMs / 1000) * speedScale);
      }
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      lastTimestampRef.current = null;
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, animationSpeed, windowMode, windowDuration_sec]);

  // Reset time
  const handleResetTime = () => {
    setSimulatedTime_sec(0);
  };

  // Time units label and multiplier
  const timeUnitLabel = windowMode === 'modulating_period' ? 'ms' : 'µs';
  const timeMultiplier = windowMode === 'modulating_period' ? 1000 : 1e6;

  // Formatted simulated time readout
  const formattedSimulatedTime =
    windowMode === 'modulating_period'
      ? `${(simulatedTime_sec * 1000).toFixed(3)} ms`
      : `${(simulatedTime_sec * 1e6).toFixed(3)} µs`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Telecommunication Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full w-fit mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Módulo 3: Visualización en el Dominio del Tiempo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Análisis Oscilográfico de Señales FM y DSBFC
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Visualización simultánea y en movimiento de la señal moduladora m(t), portadora c(t), señal modulada en frecuencia s_FM(t) y señal AM DSBFC s_AM(t).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={onNavigateToModule2}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800/80 text-xs text-slate-200 hover:text-cyan-300 transition-all cursor-pointer font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ajustar Parámetros (Módulo 2)</span>
            </button>
            {onNavigateToModule4 && (
              <button
                type="button"
                onClick={onNavigateToModule4}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Análisis Espectral (Módulo 4) →</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Oscilloscope Playback & Timebase Controls Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
          {/* Play / Pause / Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar animación</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetTime}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Reiniciar tiempo a t = 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar t=0</span>
            </button>

            {/* Animation Speed Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono ml-1">
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setAnimationSpeed(spd)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    animationSpeed === spd
                      ? 'bg-cyan-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}×
                </button>
              ))}
            </div>
          </div>

          {/* Timebase Window Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold hidden md:inline">
              <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              Escala de observación:
            </span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setWindowMode('modulating_period')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  windowMode === 'modulating_period'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Muestra ciclos completos de la señal moduladora con portadora adaptada"
              >
                Vista de Período Modulador (Tm)
              </button>
              <button
                type="button"
                onClick={() => setWindowMode('carrier_zoom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  windowMode === 'carrier_zoom'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Zoom en nanosegundos/microsegundos a escala real de la frecuencia portadora física"
              >
                Zoom de Portadora (Tc)
              </button>
            </div>
          </div>

          {/* Simulated Time Readout */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">t_sim =</span>
            <span className="text-cyan-300 font-bold tabular-nums min-w-[75px] text-right">
              {formattedSimulatedTime}
            </span>
          </div>
        </div>

        {/* Technical Window Explanation Note */}
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 px-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>{windowDescription}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {windowMode === 'modulating_period'
              ? 'Relación adaptada para distinguir modulación de frecuencia sin solapamiento por aliasing.'
              : `Frecuencia física exacta: fc = ${params.fc_kHz} kHz`}
          </span>
        </div>
      </div>

      {/* Grid of the Four Synchronized Time-Domain Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gráfica 1: Señal Moduladora m(t) */}
        <SignalCanvas
          type="modulating"
          title="Gráfica 1: Señal Moduladora"
          symbol="m(t)"
          formula="m(t) = Am · cos(2π·fm·t)"
          color="#34d399" // Emerald Green
          accentBg="bg-emerald-950/60"
          params={params}
          Ac={Ac}
          mu={mu}
          simulatedTime_sec={simulatedTime_sec}
          windowDuration_sec={windowDuration_sec}
          useNormalizedCarrier={useNormalizedCarrier}
          timeUnitLabel={timeUnitLabel}
          timeMultiplier={timeMultiplier}
          vMax_V={6.0}
          hoverFraction={hoverFraction}
          onHoverTime={setHoverFraction}
        />

        {/* Gráfica 2: Señal Portadora c(t) */}
        <SignalCanvas
          type="carrier"
          title="Gráfica 2: Señal Portadora (Sin Modular)"
          symbol="c(t)"
          formula="c(t) = Ac · cos(2π·fc·t)"
          color="#fbbf24" // Amber / Gold
          accentBg="bg-amber-950/60"
          params={params}
          Ac={Ac}
          mu={mu}
          simulatedTime_sec={simulatedTime_sec}
          windowDuration_sec={windowDuration_sec}
          useNormalizedCarrier={useNormalizedCarrier}
          timeUnitLabel={timeUnitLabel}
          timeMultiplier={timeMultiplier}
          vMax_V={6.0}
          hoverFraction={hoverFraction}
          onHoverTime={setHoverFraction}
        />

        {/* Gráfica 3: Señal Modulada en Frecuencia s_FM(t) */}
        <SignalCanvas
          type="fm"
          title="Gráfica 3: Señal Modulada en FM"
          symbol="sFM(t)"
          formula="sFM(t) = Ac · cos(2π·fc·t + β·sin(2π·fm·t))"
          color="#38bdf8" // Sky Blue / Cyan
          accentBg="bg-cyan-950/60"
          params={params}
          Ac={Ac}
          mu={mu}
          simulatedTime_sec={simulatedTime_sec}
          windowDuration_sec={windowDuration_sec}
          useNormalizedCarrier={useNormalizedCarrier}
          timeUnitLabel={timeUnitLabel}
          timeMultiplier={timeMultiplier}
          vMax_V={6.0}
          hoverFraction={hoverFraction}
          onHoverTime={setHoverFraction}
        />

        {/* Gráfica 4: Señal Modulada en Amplitud DSBFC s_AM(t) */}
        <SignalCanvas
          type="dsb"
          title="Gráfica 4: Señal DSBFC (AM con Portadora Completa)"
          symbol="sAM(t)"
          formula="sAM(t) = Ac·[1 + μ·cos(2π·fm·t)]·cos(2π·fc·t)"
          color="#e879f9" // Fuchsia / Purple
          accentBg="bg-fuchsia-950/60"
          params={params}
          Ac={Ac}
          mu={mu}
          simulatedTime_sec={simulatedTime_sec}
          windowDuration_sec={windowDuration_sec}
          useNormalizedCarrier={useNormalizedCarrier}
          timeUnitLabel={timeUnitLabel}
          timeMultiplier={timeMultiplier}
          vMax_V={Math.max(6.0, Ac * (1 + mu) * 1.1)}
          hoverFraction={hoverFraction}
          onHoverTime={setHoverFraction}
        />
      </div>

      {/* Comparative Scientific Analysis Card: FM vs DSBFC */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Comparación Científica: Modulación Angular FM vs Modulación de Amplitud DSBFC</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-800/40">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Señal FM (Modulación de Frecuencia Angular)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                • <strong className="text-white">Amplitud estrictamente constante:</strong> El voltaje pico se mantiene inalterable en todo momento igual a la portadora <code className="text-cyan-300">Ac = {Ac.toFixed(1)} V</code>.
              </li>
              <li>
                • <strong className="text-white">Frecuencia instantánea variable:</strong> Se observa una mayor densidad de oscilaciones (compresión) durante los picos positivos de m(t) (<code className="text-cyan-300">fi_max = {(params.fc_kHz + params.deltaF_kHz).toFixed(1)} kHz</code>) y menor densidad (expansión) durante los valles (<code className="text-cyan-300">fi_min = {(params.fc_kHz - params.deltaF_kHz).toFixed(1)} kHz</code>).
              </li>
              <li>
                • <strong className="text-white">Índice β:</strong> Relación de desviación respecto al tono modulador (<code className="text-cyan-300">β = {params.beta}</code>).
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-fuchsia-800/40">
            <div className="flex items-center gap-2 font-bold text-fuchsia-300 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
              <span>Señal DSBFC (Doble Banda Lateral con Portadora Completa)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                • <strong className="text-white">Envolvente variable visible:</strong> La amplitud máxima de la señal sigue la forma de m(t) entre <code className="text-fuchsia-300">{(Ac * (1 - mu)).toFixed(2)} V</code> y <code className="text-fuchsia-300">{(Ac * (1 + mu)).toFixed(2)} V</code> (líneas punteadas rosadas).
              </li>
              <li>
                • <strong className="text-white">Frecuencia de oscilaciones constante:</strong> Todos los ciclos de alta frecuencia ocurren exactamente a la frecuencia de la portadora <code className="text-fuchsia-300">fc = {params.fc_kHz} kHz</code> sin compresión ni descompresión angular.
              </li>
              <li>
                • <strong className="text-white">Índice AM μ:</strong> Parámetro de referencia ilustrativo fijado en <code className="text-fuchsia-300">μ = {mu.toFixed(2)} (70%)</code> según las especificaciones del módulo.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
