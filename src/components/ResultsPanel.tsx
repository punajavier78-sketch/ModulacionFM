import React, { useMemo } from 'react';
import { FMParameters } from '../types/fmParameters';
import {
  calculateBesselBandwidth,
  calculateCarsonBandwidthDetailed,
  generateComparisonRows,
} from '../utils/bandwidthCalculations';
import { validateFMParameters } from '../utils/fmMath';
import { BandwidthComparisonChart } from './BandwidthComparisonChart';
import {
  ClipboardList,
  Sliders,
  Waves,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Zap,
  Radio,
} from 'lucide-react';

interface ResultsPanelProps {
  params: FMParameters;
  onNavigateToModule2: () => void;
  onNavigateToModule3: () => void;
  onNavigateToModule4: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  params,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule4,
}) => {
  const Ac = 5.0; // Reference carrier amplitude (5.0 V)

  const { beta, deltaF_kHz, k, Am, fm_kHz, fc_kHz } = params;

  // Validate current parameters to ensure mathematical consistency
  const validationReport = useMemo(() => {
    return validateFMParameters(params);
  }, [params]);

  // Calculate Bandwidths
  const bessel1Pct = useMemo(() => {
    return calculateBesselBandwidth(beta, fm_kHz, '1_percent');
  }, [beta, fm_kHz]);

  const bessel5Pct = useMemo(() => {
    return calculateBesselBandwidth(beta, fm_kHz, '5_percent');
  }, [beta, fm_kHz]);

  const carsonBW = useMemo(() => {
    return calculateCarsonBandwidthDetailed(deltaF_kHz, fm_kHz);
  }, [deltaF_kHz, fm_kHz]);

  // Generate Comparison Rows
  const comparisonRows = useMemo(() => {
    return generateComparisonRows(params, Ac, bessel1Pct, carsonBW);
  }, [params, Ac, bessel1Pct, carsonBW]);

  // Instantaneous frequencies
  const fi_max_kHz = Number((fc_kHz + deltaF_kHz).toFixed(3));
  const fi_min_kHz = Number((fc_kHz - deltaF_kHz).toFixed(3));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Telecommunication Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full w-fit mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Módulo 5: Panel de Resultados y Comparación Teórica</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Resultados de la Simulación y Validación Teórica de Modulación FM
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Determinación de ancho de banda mediante el criterio de Bessel y la regla de Carson, análisis de coherencia analítica y tabla comparativa teórica vs simulación.
            </p>
          </div>

          {/* Quick Navigation to Other Approved Modules */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={onNavigateToModule2}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>M2: Parámetros</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToModule3}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>M3: Tiempo</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToModule4}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>M4: Espectro</span>
            </button>
          </div>
        </div>

        {/* Coherence Warning Banner if Inconsistent */}
        {!validationReport.isValid && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Aviso de Inconsistencia en Parámetros de Entrada</span>
            </div>
            <p className="text-[11px] text-amber-300/90">
              La configuración actual presenta discrepancias entre las relaciones matemáticas (Δf ≠ k × Am o β ≠ Δf / fm). Los resultados se presentan señalando estas diferencias.
            </p>
          </div>
        )}
      </div>

      {/* Section 1: Summary of Parameters from Simulation */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>1. Resumen de Parámetros de la Configuración Validada</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Índice FM (β)</span>
            <p className="text-base font-bold text-cyan-300 mt-1">{beta}</p>
            <span className="text-[10px] text-slate-500">adimensional (rad)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Desviación (Δf)</span>
            <p className="text-base font-bold text-cyan-300 mt-1">{deltaF_kHz} kHz</p>
            <span className="text-[10px] text-slate-500">
              {(deltaF_kHz * 1000).toLocaleString()} Hz
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Sensibilidad (k)</span>
            <p className="text-base font-bold text-white mt-1">{k} V/kHz</p>
            <span className="text-[10px] text-slate-500">Constante FM</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Amplitud (Am)</span>
            <p className="text-base font-bold text-white mt-1">{Am} V</p>
            <span className="text-[10px] text-slate-500">Tensión pico mensaje</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Moduladora (fm)</span>
            <p className="text-base font-bold text-emerald-400 mt-1">{fm_kHz} kHz</p>
            <span className="text-[10px] text-slate-500">
              {(fm_kHz * 1000).toLocaleString()} Hz
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Portadora (fc)</span>
            <p className="text-base font-bold text-amber-400 mt-1">
              {fc_kHz >= 1000 ? `${(fc_kHz / 1000).toFixed(3)} MHz` : `${fc_kHz} kHz`}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              {fc_kHz.toLocaleString()} kHz
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Theoretical FM Results & Relations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>2. Resultados Analíticos y Ecuaciones Teóricas de FM</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Relation 1: Beta */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold">Índice de Modulación Teórico:</span>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Fórmula:</span>
              <span className="text-cyan-400 font-bold">β = Δf / fm</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">Cálculo:</span>
              <span className="text-white font-bold">
                {fm_kHz > 0
                  ? `${deltaF_kHz} kHz / ${fm_kHz} kHz = ${(deltaF_kHz / fm_kHz).toFixed(3)}`
                  : 'División por cero no definida (fm=0)'}
              </span>
            </div>
          </div>

          {/* Relation 2: Delta f */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold">Desviación Máxima Teórica:</span>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Fórmula:</span>
              <span className="text-cyan-400 font-bold">Δf = k × Am</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">Cálculo:</span>
              <span className="text-white font-bold">
                {k} V/kHz × {Am} V = {(k * Am).toFixed(3)} kHz
              </span>
            </div>
          </div>

          {/* Relation 3: Instantaneous Frequencies */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold">Excursión de Frecuencia Instantánea:</span>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">fi,max = fc + Δf:</span>
              <span className="text-cyan-300 font-bold">{fi_max_kHz.toLocaleString()} kHz</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">fi,min = fc - Δf:</span>
              <span className="text-cyan-300 font-bold">{fi_min_kHz.toLocaleString()} kHz</span>
            </div>
          </div>
        </div>

        {/* Zero fm explanation if applicable */}
        {fm_kHz === 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">
                Frecuencia moduladora nula (fm = 0 Hz)
              </p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                La división entre cero no es válida en la ecuación β = Δf / fm. En este estado estacionario de corriente continua, la onda portadora simplemente experimenta un desplazamiento constante de frecuencia hacia fc + Δf sin bandas laterales armónicas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Comparative Graphical Visualizer of Bandwidths */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <span>3. Determinación y Comparación del Ancho de Banda</span>
        </h3>

        <BandwidthComparisonChart
          bessel1Pct={bessel1Pct}
          bessel5Pct={bessel5Pct}
          carsonBW={carsonBW}
          fm_kHz={fm_kHz}
          deltaF_kHz={deltaF_kHz}
        />
      </div>

      {/* Section 4: Detailed Theoretical vs Simulation Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              4. Tabla de Comparación Teórica y Resultados de Simulación
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Contraste cuantitativo entre las ecuaciones matemáticas analíticas y los datos derivados del motor de simulación.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {comparisonRows.length} parámetros evaluados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">Magnitud Evaluada</th>
                <th className="py-2.5 px-3 font-semibold">Categoría</th>
                <th className="py-2.5 px-3 font-semibold text-right">Valor Teórico</th>
                <th className="py-2.5 px-3 font-semibold text-right">Valor Simulado</th>
                <th className="py-2.5 px-3 font-semibold text-right">Dif. Absoluta</th>
                <th className="py-2.5 px-3 font-semibold text-right">Dif. Porcentual</th>
                <th className="py-2.5 px-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonRows.map((row) => {
                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      <div>{row.parameterName}</div>
                      {row.explanation && (
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {row.explanation}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.category}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {typeof row.theoreticalValue === 'number'
                        ? `${row.theoreticalValue} ${row.unit}`
                        : row.theoreticalValue}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-semibold">
                      {typeof row.simulatedValue === 'number'
                        ? `${row.simulatedValue} ${row.unit}`
                        : row.simulatedValue}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{row.absoluteDiff}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        row.percentDiff === '0.00%'
                          ? 'text-emerald-400'
                          : row.percentDiff === 'No aplicable'
                          ? 'text-slate-500'
                          : 'text-amber-400'
                      }`}
                    >
                      {row.percentDiff}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.status === 'exact' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Exacto</span>
                        </span>
                      )}
                      {row.status === 'close' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Convergente</span>
                        </span>
                      )}
                      {row.status === 'not_available' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 italic">
                          <span>No disponible</span>
                        </span>
                      )}
                      {row.status === 'not_applicable' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <span>No aplicable</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            * Valores derivados rigurosamente del estado activo del simulador sin datos ficticios.
          </span>
          <span className="text-cyan-400 font-mono text-[11px]">
            Tolerancia numérica: &lt; 0.05%
          </span>
        </div>
      </div>
    </div>
  );
};
