import React, { useState, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  Calculator,
  Info,
  Layers,
  Wand2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { FMParameters, FreqUnit, CarrierUnit, GenerationReadyData } from '../types/fmParameters';
import {
  validateFMParameters,
  calculateCarsonBandwidth,
  harmonizeFromInputs,
  FM_BOUNDS,
} from '../utils/fmMath';
import { FMParameterControl } from './FMParameterControl';

// Preset configurations for educational laboratory experiments
const ACADEMIC_PRESETS = [
  {
    name: 'Transmisión FM Comercial (WBFM)',
    description: 'Estándar de radiodifusión comercial: Δf = 75 kHz, fm = 15 kHz, β = 5.0, fc = 98.5 MHz',
    params: {
      k: 15.0 > 10 ? 10.0 : 7.5, // k = 10 or compatible
      Am: 5.0, // k=10 * Am=5 => deltaF=50
      // Let's create an exact consistent commercial standard:
      // k = 5.0 V/kHz, Am = 5.0 V => deltaF = 25 kHz, fm = 5 kHz => beta = 5.0, fc = 98.5 MHz
    },
  },
  {
    name: 'Banda Estrecha (NBFM - Radioafición)',
    description: 'FM de banda estrecha para comunicaciones de voz: Δf = 2.5 kHz, fm = 3 kHz, β = 0.83, fc = 144 MHz (en rango máx 110 MHz: 100 MHz)',
    params: {
      k: 2.5,
      Am: 1.0,
      deltaF_kHz: 2.5,
      fm_kHz: 3.0,
      beta: 0.83,
      fc_kHz: 100000, // 100 MHz
    },
  },
  {
    name: 'Práctica de Laboratorio UPEA (Tono 1 kHz)',
    description: 'Configuración clásica de osciloscopio: fm = 1.0 kHz, Am = 2.0 V, k = 5.0 V/kHz => Δf = 10 kHz, β = 5.0, fc = 10.7 MHz (IF)',
    params: {
      k: 5.0,
      Am: 2.0,
      deltaF_kHz: 10.0,
      fm_kHz: 2.0,
      beta: 5.0,
      fc_kHz: 10700, // 10.7 MHz
    },
  },
];

interface FMParameterPanelProps {
  currentParams?: FMParameters;
  onParametersGenerated?: (params: FMParameters) => void;
  onNavigateToModule3?: () => void;
}

export const FMParameterPanel: React.FC<FMParameterPanelProps> = ({
  currentParams,
  onParametersGenerated,
  onNavigateToModule3,
}) => {
  // Initial parameters: consistent state or passed from parent
  const [params, setParams] = useState<FMParameters>(
    currentParams || {
      beta: 2.5,
      deltaF_kHz: 12.5,
      k: 5.0,
      Am: 2.5,
      fm_kHz: 5.0,
      fc_kHz: 10700, // 10.7 MHz
    }
  );

  // Unit display preferences
  const [deltaFUnit, setDeltaFUnit] = useState<FreqUnit>('kHz');
  const [fmUnit, setFmUnit] = useState<FreqUnit>('kHz');
  const [fcUnit, setFcUnit] = useState<CarrierUnit>('MHz');

  // Generation status and feedback
  const [generationResult, setGenerationResult] = useState<GenerationReadyData | null>(null);
  const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

  // Real-time mathematical validation
  const validationReport = useMemo(() => {
    return validateFMParameters(params);
  }, [params]);

  // Handler for individual parameter changes (synchronous update, no silent overwrite of other fields)
  const handleParamChange = (field: keyof FMParameters, newValue: number) => {
    setParams((prev) => ({
      ...prev,
      [field]: newValue,
    }));
    // If the user changed parameters after generating, reset the validated ready banner to prompt re-validation
    if (generationResult) {
      setGenerationResult(null);
    }
  };

  // Explicit user action: Harmonize parameters based on equations
  // Does NOT happen silently; only when the user voluntarily clicks the button
  const handleHarmonize = () => {
    const harmonized = harmonizeFromInputs(params.k, params.Am, params.fm_kHz, params.fc_kHz);
    setParams(harmonized);
    setGenerationResult(null);
  };

  // Apply academic presets
  const applyPreset = (presetParams: Partial<FMParameters>) => {
    setParams((prev) => ({
      ...prev,
      ...presetParams,
    }));
    setGenerationResult(null);
  };

  // Reset to default textbook values
  const handleReset = () => {
    setParams({
      beta: 2.5,
      deltaF_kHz: 12.5,
      k: 5.0,
      Am: 2.5,
      fm_kHz: 5.0,
      fc_kHz: 10700,
    });
    setGenerationResult(null);
    setSubmissionAttempted(false);
  };

  // Main Generation Handler
  const handleGenerateSignals = () => {
    setSubmissionAttempted(true);

    if (validationReport.canGenerate) {
      const category = params.beta < 0.5 ? 'Banda Estrecha (NBFM)' : 'Banda Ancha (WBFM)';
      const theoreticalBandwidth_kHz = calculateCarsonBandwidth(params.deltaF_kHz, params.fm_kHz);
      const carrierToDeviationRatio = Number((params.fc_kHz / params.deltaF_kHz).toFixed(1));

      const readyData: GenerationReadyData = {
        parameters: { ...params },
        timestamp: new Date().toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        category,
        theoreticalBandwidth_kHz,
        carrierToDeviationRatio,
        isReady: true,
      };

      setGenerationResult(readyData);
      onParametersGenerated?.(params);
    } else {
      setGenerationResult(null);
    }
  };

  // Map inconsistencies to specific fields for inline warnings
  const inconsistencyByField = useMemo(() => {
    const map: Record<string, string> = {};
    validationReport.inconsistencies.forEach((inc) => {
      map[inc.field] = inc.message;
    });
    return map;
  }, [validationReport.inconsistencies]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Module Title and Formulas Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full w-fit mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Módulo 2: Panel de Parámetros y Generación de Señales</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Configuración de Parámetros de Modulación de Frecuencia (FM)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Configure las variables de la señal moduladora y portadora. El sistema evalúa continuamente la coherencia dimensional y las ecuaciones de modulación angular.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Restablecer valores predeterminados"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Governing Mathematical Equations Reference */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Relación de Desviación:</span>
            <code className="font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
              Δf = k × Am
            </code>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Índice de Modulación:</span>
            <code className="font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
              β = Δf / fm
            </code>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Condición de Portadora:</span>
            <code className="font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
              fc &gt; Δf &gt; 0
            </code>
          </div>
        </div>

        {/* Quick Academic Presets Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/70 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Configuraciones de laboratorio recomendadas:
          </span>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                k: 5.0,
                Am: 2.5,
                deltaF_kHz: 12.5,
                fm_kHz: 2.5,
                beta: 5.0,
                fc_kHz: 10700,
              })
            }
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Tono de Laboratorio UPEA (β = 5.0)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                k: 2.5,
                Am: 1.0,
                deltaF_kHz: 2.5,
                fm_kHz: 3.0,
                beta: 0.83,
                fc_kHz: 100000,
              })
            }
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Banda Estrecha NBFM (β = 0.83)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                k: 10.0,
                Am: 5.0,
                deltaF_kHz: 50.0,
                fm_kHz: 15.0,
                beta: 3.33,
                fc_kHz: 98500, // 98.5 MHz
              })
            }
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Radiodifusión Comercial WBFM (β = 3.33)
          </button>
        </div>
      </div>

      {/* Real-time Mathematical Coherence Inspector Banner */}
      {!validationReport.isValid && (
        <div
          role="region"
          aria-label="Estado de coherencia matemática"
          className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 shadow-lg text-amber-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-100">
                  Incompatibilidad detectada entre parámetros de modulación
                </h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  Los valores configurados actualmente en los controles no satisfacen simultáneamente las ecuaciones fundamentales de FM.
                </p>
                <div className="mt-2 space-y-1">
                  {validationReport.inconsistencies.map((inc) => (
                    <p key={inc.id} className="text-xs text-amber-300/90 font-mono">
                      • {inc.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Non-silent harmonization button: the user explicitly chooses to harmonize */}
            <button
              type="button"
              onClick={handleHarmonize}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 transition-all cursor-pointer shadow-md shadow-amber-950/40"
              title="Ajustar automáticamente Δf y β según los valores fijados de k, Am y fm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Armonizar según fórmulas</span>
            </button>
          </div>
        </div>
      )}

      {validationReport.isValid && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">
              Todos los parámetros son matemáticamente coherentes y respetan las ecuaciones de modulación FM.
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400/80 hidden sm:inline">
            Δf = {params.deltaF_kHz} kHz · β = {params.beta}
          </span>
        </div>
      )}

      {/* Grid of the Six FM Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Índice de modulación (β) */}
        <FMParameterControl
          id="beta"
          name="Índice de modulación"
          symbol="β"
          value={params.beta}
          min={FM_BOUNDS.beta.min}
          max={FM_BOUNDS.beta.max}
          step={FM_BOUNDS.beta.step}
          primaryUnit="adimensional (rad)"
          description="Relación entre la desviación máxima y la frecuencia moduladora (β = Δf / fm)."
          inconsistencyWarning={inconsistencyByField['beta']}
          isConsistent={!inconsistencyByField['beta']}
          onChange={(val) => handleParamChange('beta', val)}
        />

        {/* 2. Desviación de frecuencia (Δf) */}
        <FMParameterControl
          id="deltaF"
          name="Desviación de frecuencia"
          symbol="Δf"
          value={params.deltaF_kHz}
          min={FM_BOUNDS.deltaF_kHz.min}
          max={FM_BOUNDS.deltaF_kHz.max}
          step={FM_BOUNDS.deltaF_kHz.step}
          primaryUnit={deltaFUnit}
          secondaryUnit={deltaFUnit === 'kHz' ? 'Hz' : 'kHz'}
          secondaryUnitValue={
            deltaFUnit === 'kHz'
              ? `${(params.deltaF_kHz * 1000).toLocaleString('es-BO')} Hz`
              : `${(params.deltaF_kHz).toFixed(2)} kHz`
          }
          description="Máxima variación de la frecuencia instantánea respecto a la portadora (Δf = k × Am)."
          inconsistencyWarning={inconsistencyByField['deltaF_kHz']}
          isConsistent={!inconsistencyByField['deltaF_kHz']}
          onChange={(val) => handleParamChange('deltaF_kHz', val)}
          unitToggle={{
            currentUnit: deltaFUnit,
            availableUnits: ['kHz', 'Hz'],
            onToggleUnit: (u) => setDeltaFUnit(u as FreqUnit),
            displayMultiplier: deltaFUnit === 'Hz' ? 1000 : 1,
          }}
        />

        {/* 3. Sensibilidad en frecuencia (k) */}
        <FMParameterControl
          id="k"
          name="Sensibilidad en frecuencia"
          symbol="k"
          value={params.k}
          min={FM_BOUNDS.k.min}
          max={FM_BOUNDS.k.max}
          step={FM_BOUNDS.k.step}
          primaryUnit="V/kHz"
          description="Constante de proporcionalidad del modulador de frecuencia (desviación producida por voltio)."
          inconsistencyWarning={inconsistencyByField['k']}
          isConsistent={!inconsistencyByField['deltaF_kHz']}
          onChange={(val) => handleParamChange('k', val)}
        />

        {/* 4. Amplitud de la señal moduladora (Am) */}
        <FMParameterControl
          id="Am"
          name="Amplitud moduladora"
          symbol="Am"
          value={params.Am}
          min={FM_BOUNDS.Am.min}
          max={FM_BOUNDS.Am.max}
          step={FM_BOUNDS.Am.step}
          primaryUnit="V"
          description="Tensión pico de la señal de mensaje que modula la frecuencia portadora."
          inconsistencyWarning={inconsistencyByField['Am']}
          isConsistent={!inconsistencyByField['deltaF_kHz']}
          onChange={(val) => handleParamChange('Am', val)}
        />

        {/* 5. Frecuencia de la señal moduladora (fm) */}
        <FMParameterControl
          id="fm"
          name="Frecuencia moduladora"
          symbol="fm"
          value={params.fm_kHz}
          min={FM_BOUNDS.fm_kHz.min}
          max={FM_BOUNDS.fm_kHz.max}
          step={FM_BOUNDS.fm_kHz.step}
          primaryUnit={fmUnit}
          secondaryUnit={fmUnit === 'kHz' ? 'Hz' : 'kHz'}
          secondaryUnitValue={
            fmUnit === 'kHz'
              ? `${(params.fm_kHz * 1000).toLocaleString('es-BO')} Hz`
              : `${(params.fm_kHz).toFixed(2)} kHz`
          }
          description="Frecuencia del tono o señal de audio moduladora (rango audible: 0 a 20 kHz)."
          inconsistencyWarning={inconsistencyByField['fm_kHz']}
          isConsistent={!inconsistencyByField['fm_kHz'] && params.fm_kHz > 0}
          onChange={(val) => handleParamChange('fm_kHz', val)}
          unitToggle={{
            currentUnit: fmUnit,
            availableUnits: ['kHz', 'Hz'],
            onToggleUnit: (u) => setFmUnit(u as FreqUnit),
            displayMultiplier: fmUnit === 'Hz' ? 1000 : 1,
          }}
        />

        {/* 6. Frecuencia de la portadora (fc) */}
        <FMParameterControl
          id="fc"
          name="Frecuencia de la portadora"
          symbol="fc"
          value={params.fc_kHz}
          min={FM_BOUNDS.fc_kHz.min}
          max={FM_BOUNDS.fc_kHz.max}
          step={FM_BOUNDS.fc_kHz.step}
          primaryUnit={fcUnit}
          secondaryUnit={fcUnit === 'MHz' ? 'kHz' : 'MHz'}
          secondaryUnitValue={
            fcUnit === 'MHz'
              ? `${params.fc_kHz.toLocaleString('es-BO')} kHz`
              : `${(params.fc_kHz / 1000).toFixed(2)} MHz`
          }
          description="Frecuencia central no modulada de la onda de radiofrecuencia (RF)."
          inconsistencyWarning={inconsistencyByField['fc_kHz']}
          isConsistent={!inconsistencyByField['fc_kHz']}
          onChange={(val) => handleParamChange('fc_kHz', val)}
          unitToggle={{
            currentUnit: fcUnit,
            availableUnits: ['MHz', 'kHz'],
            onToggleUnit: (u) => setFcUnit(u as CarrierUnit),
            displayMultiplier: fcUnit === 'MHz' ? 0.001 : 1,
          }}
        />
      </div>

      {/* Main Generation Action Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Control de Generación de Señales
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pulse el botón para validar integralmente los parámetros matemáticos y habilitar el flujo de generación del laboratorio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateSignals}
            className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2.5 cursor-pointer shrink-0 hover:scale-[1.01]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Generar señales</span>
          </button>
        </div>

        {/* Validation Errors Notice if Generation Clicked with Invalid Parameters */}
        {submissionAttempted && !validationReport.isValid && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs space-y-2"
          >
            <div className="flex items-center gap-2 font-bold text-rose-100 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>No se pueden generar las señales: Existen parámetros inválidos o incompatibles</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-300/90 ml-1">
              {validationReport.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-rose-400">
                Sugerencia: Utilice el botón “Armonizar según fórmulas” o ajuste manualmente los controles para resolver las discrepancias.
              </span>
              <button
                type="button"
                onClick={handleHarmonize}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
              >
                Corregir automáticamente ahora
              </button>
            </div>
          </div>
        )}

        {/* Successful Generation Readiness Dossier */}
        {generationResult && (
          <div
            role="region"
            aria-label="Confirmación de generación lista"
            className="mt-6 p-6 rounded-2xl bg-slate-950/80 border border-emerald-800/60 space-y-5 shadow-2xl animate-in fade-in duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-300">
                    Configuración validada exitosamente: Señales listas para generación
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Todos los parámetros cumplen las relaciones matemáticas fundamentales de modulación angular FM.
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-400 shrink-0">
                <span className="text-slate-500">Validado a las: </span>
                <span className="text-cyan-400 font-semibold">{generationResult.timestamp}</span>
              </div>
            </div>

            {/* Technical Summary Sheet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Portadora (fc)</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {(generationResult.parameters.fc_kHz / 1000).toFixed(3)} MHz
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {generationResult.parameters.fc_kHz.toLocaleString()} kHz
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Moduladora (fm)</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {generationResult.parameters.fm_kHz} kHz
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(generationResult.parameters.fm_kHz * 1000).toLocaleString()} Hz
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Amplitud (Am)</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {generationResult.parameters.Am} V
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Tensión pico</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Sensibilidad (k)</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {generationResult.parameters.k} V/kHz
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Constante FM</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Desviación (Δf)</span>
                <p className="text-sm font-mono font-bold text-cyan-300 mt-1">
                  {generationResult.parameters.deltaF_kHz} kHz
                </p>
                <span className="text-[10px] text-cyan-500/80 font-mono">
                  {(generationResult.parameters.deltaF_kHz * 1000).toLocaleString()} Hz
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">Índice (β)</span>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                  {generationResult.parameters.beta}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {generationResult.category}
                </span>
              </div>
            </div>

            {/* Direct navigation to Module 3 */}
            {onNavigateToModule3 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToModule3}
                  className="w-full py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
                >
                  <Activity className="w-4 h-4" />
                  <span>Visualizar Señales en el Dominio del Tiempo (Módulo 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
