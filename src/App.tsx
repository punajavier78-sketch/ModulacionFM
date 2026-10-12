/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, WorkspaceView } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { AccessConfirmation } from './components/AccessConfirmation';
import { AcademicHero } from './components/AcademicHero';
import { FMParameterPanel } from './components/FMParameterPanel';
import { TimeDomainVisualizer } from './components/TimeDomainVisualizer';
import { FrequencyDomainVisualizer } from './components/FrequencyDomainVisualizer';
import { ResultsPanel } from './components/ResultsPanel';
import { getCurrentSession, logout } from './services/authService';
import { User, AuthSession } from './types/auth';
import { FMParameters } from './types/fmParameters';

export default function App() {
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<WorkspaceView>('module2');
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);

  // Active validated FM parameters shared across all modules
  const [validatedFMParams, setValidatedFMParams] = useState<FMParameters>({
    beta: 2.5,
    deltaF_kHz: 12.5,
    k: 5.0,
    Am: 2.5,
    fm_kHz: 5.0,
    fc_kHz: 10700, // 10.7 MHz
  });

  // Restore existing session on mount if available
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentSession(session);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    const session = getCurrentSession();
    setCurrentSession(
      session || {
        user,
        token: 'tok_' + Date.now().toString(36),
        loginTimestamp: new Date().toISOString(),
      }
    );
    // After login, navigate directly to Module 2 (FM Parameters & Generation)
    setActiveWorkspaceView('module2');
  };

  const handleRegisterSuccess = (user: User, message: string) => {
    setPrefilledEmail(user.email);
    setRegistrationMessage(message);
    setAuthMode('login');
  };

  const handleLogout = () => {
    logout();
    setCurrentSession(null);
    setRegistrationMessage(null);
    setAuthMode('login');
    setActiveWorkspaceView('module2');
  };

  const handleParametersGenerated = (params: FMParameters) => {
    setValidatedFMParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Institutional Top Navbar with title, subtitle, and navigation */}
      <Navbar
        currentUser={currentSession?.user}
        onLogout={handleLogout}
        activeView={activeWorkspaceView}
        onSelectView={(v) => setActiveWorkspaceView(v)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentSession ? (
          /* Authenticated Workspace */
          activeWorkspaceView === 'module5' ? (
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
          ) : activeWorkspaceView === 'module2' ? (
            /* Module 2: FM Parameter Panel and Signal Generation */
            <FMParameterPanel
              currentParams={validatedFMParams}
              onParametersGenerated={handleParametersGenerated}
              onNavigateToModule3={() => setActiveWorkspaceView('module3')}
            />
          ) : (
            /* Module 1: Access Confirmation and Academic Dossier */
            <AccessConfirmation
              user={currentSession.user}
              session={currentSession}
              onLogout={handleLogout}
              onNavigateToModule2={() => setActiveWorkspaceView('module2')}
              onNavigateToModule3={() => setActiveWorkspaceView('module3')}
              onNavigateToModule4={() => setActiveWorkspaceView('module4')}
              onNavigateToModule5={() => setActiveWorkspaceView('module5')}
            />
          )
        ) : (
          /* Unauthenticated State: Module 1 Login / Register split layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Academic Telecommunications Context & Visual */}
            <div className="lg:col-span-5 flex flex-col">
              <AcademicHero />
            </div>

            {/* Right Column: Interactive Login or Register Form */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {authMode === 'login' ? (
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => {
                    setAuthMode('register');
                    setRegistrationMessage(null);
                  }}
                  initialEmail={prefilledEmail}
                  registrationSuccessMessage={registrationMessage}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleRegisterSuccess}
                  onSwitchToLogin={() => {
                    setAuthMode('login');
                    setRegistrationMessage(null);
                  }}
                />
              )}
            </div>
          </div>
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
