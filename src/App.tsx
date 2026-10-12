/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, WorkspaceView } from './components/Navbar';
import { FMParameterPanel } from './components/FMParameterPanel';
import { TimeDomainVisualizer } from './components/TimeDomainVisualizer';
import { FrequencyDomainVisualizer } from './components/FrequencyDomainVisualizer';
import { ResultsPanel } from './components/ResultsPanel';
import { FMParameters } from './types/fmParameters';

export default function App() {
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<WorkspaceView>('module2');

  // Active validated FM parameters shared across all modules
  const [validatedFMParams, setValidatedFMParams] = useState<FMParameters>({
    beta: 2.5,
    deltaF_kHz: 12.5,
    k: 5.0,
    Am: 2.5,
    fm_kHz: 5.0,
    fc_kHz: 10700, // 10.7 MHz
  });

  const handleParametersGenerated = (params: FMParameters) => {
    setValidatedFMParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Institutional Top Navbar with title, subtitle, and navigation */}
      <Navbar
        activeView={activeWorkspaceView}
        onSelectView={(v) => setActiveWorkspaceView(v)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeWorkspaceView === 'module5' ? (
          /* Module 5: Results Panel and Theoretical Comparison */
          <ResultsPanel
            params={validatedFMParams}
            onNavigateToModule2={() => setActiveWorkspaceView('module2')}
            onNavigateToModule3={() => setActiveWorkspaceView('module3')}
            onNavigateToModule4={() => setActiveWorkspaceView('module4')}
          />
        ) : activeWorkspaceView === 'module4' ? (
          /* Module 4: Frequency Domain & Bessel Analysis */
          <FrequencyDomainVisualizer
            params={validatedFMParams}
            onNavigateToModule2={() => setActiveWorkspaceView('module2')}
            onNavigateToModule3={() => setActiveWorkspaceView('module3')}
            onNavigateToModule5={() => setActiveWorkspaceView('module5')}
          />
        ) : activeWorkspaceView === 'module3' ? (
          /* Module 3: Time Domain Oscilloscopic Visualizer */
          <TimeDomainVisualizer
            params={validatedFMParams}
            onNavigateToModule2={() => setActiveWorkspaceView('module2')}
            onNavigateToModule4={() => setActiveWorkspaceView('module4')}
          />
        ) : (
          /* Module 2: FM Parameter Panel and Signal Generation */
          <FMParameterPanel
            currentParams={validatedFMParams}
            onParametersGenerated={handleParametersGenerated}
            onNavigateToModule3={() => setActiveWorkspaceView('module3')}
          />
        )}
      </main>

      {/* Institutional Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Simulador de Laboratorio de Modulación FM · MSc. Ing. Daniel Puña</p>
          <p className="text-[11px] text-slate-600">
            Carrera de Ingeniería Electrónica · Universidad Pública de El Alto (UPEA)
          </p>
        </div>
      </footer>
    </div>
  );
}
