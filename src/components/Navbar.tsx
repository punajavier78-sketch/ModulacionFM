import React from 'react';
import {
  Radio,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Sliders,
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { User } from '../types/auth';

export type WorkspaceView = 'module2' | 'module3' | 'module4' | 'module5' | 'module1';

interface NavbarProps {
  currentUser?: User | null;
  onLogout?: () => void;
  activeView?: WorkspaceView;
  onSelectView?: (view: WorkspaceView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  activeView = 'module2',
  onSelectView,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand and titles */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 shrink-0 shadow-inner">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-tight">
              Simulador de Laboratorio de Modulación FM - MSc. Ing. Daniel Puña
            </h1>
            <p className="text-xs sm:text-xs text-slate-400 leading-normal mt-0.5">
              Laboratorio virtual de telecomunicaciones - CARRERA INGENIERÍA ELECTRÓNICA - UPEA - Docente: MSc. Ing Daniel Puña
            </p>
          </div>
        </div>

        {/* User state / Navigation tabs */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto shrink-0">
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Module Navigation Tabs */}
              {onSelectView && (
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectView('module2')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeView === 'module2'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>M2: Parámetros</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectView('module3')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeView === 'module3'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>M3: Tiempo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectView('module4')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeView === 'module4'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>M4: Espectro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectView('module5')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeView === 'module5'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>M5: Resultados</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectView('module1')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeView === 'module1'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">M1: Ficha</span>
                  </button>
                </div>
              )}

              {/* User profile & Logout */}
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium truncate max-w-[90px] sm:max-w-[120px]">
                    {currentUser.name}
                  </span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors hover:bg-rose-950/40 px-2 py-1 rounded-lg ml-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Módulo 1: Acceso de usuarios</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
