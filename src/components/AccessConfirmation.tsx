import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  LogOut,
  Sliders,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { User, AuthSession } from '../types/auth';

interface AccessConfirmationProps {
  user: User;
  session?: AuthSession | null;
  onLogout: () => void;
  onNavigateToModule2?: () => void;
  onNavigateToModule3?: () => void;
  onNavigateToModule4?: () => void;
  onNavigateToModule5?: () => void;
}

export const AccessConfirmation: React.FC<AccessConfirmationProps> = ({
  user,
  session,
  onLogout,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule4,
  onNavigateToModule5,
}) => {
  const formattedDate = session?.loginTimestamp
    ? new Date(session.loginTimestamp).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleTimeString('es-BO');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 shrink-0 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autenticación y Credenciales Verificadas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ¡Bienvenido al Simulador de Laboratorio de Modulación FM!
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              El <strong className="text-white">Módulo 1 (Acceso de usuarios)</strong> ha autenticado satisfactoriamente su identidad en la plataforma académica.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Verified User Academic Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User profile card */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <span>Ficha del Usuario Autenticado</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Nombre completo</p>
              <p className="text-slate-100 font-semibold mt-0.5">{user.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-cyan-400" />
                <span>Correo verificado</span>
              </p>
              <p className="text-slate-100 font-mono text-xs sm:text-sm mt-0.5 truncate">{user.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3 text-cyan-400" />
                <span>Rol académico</span>
              </p>
              <p className="text-slate-100 font-semibold mt-0.5">{user.role}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span>Carrera & Universidad</span>
              </p>
              <p className="text-slate-100 font-medium mt-0.5 text-xs">
                {user.career} - UPEA
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Docente Titular de la Asignatura</p>
              <p className="text-cyan-300 font-semibold mt-0.5">{user.teacher}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>Hora de inicio de sesión</span>
              </p>
              <p className="text-slate-100 font-mono text-xs mt-0.5">{formattedDate}</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Identificador de sesión:</span>
            <span className="font-mono text-cyan-400/90 text-[11px] truncate max-w-[200px]">
              {session?.token || 'SESION_ACTIVA'}
            </span>
          </div>
        </div>

        {/* Access to Module 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 w-fit mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Módulo 2: Panel de Parámetros
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              El panel de configuración interactiva se encuentra activo con los 6 parámetros de modulación angular:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Índice de modulación (β)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Desviación de frecuencia (Δf)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Sensibilidad en frecuencia (k)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Amplitud moduladora (Am)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Frecuencia moduladora (fm)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Frecuencia portadora (fc)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            {onNavigateToModule2 && (
              <button
                type="button"
                onClick={onNavigateToModule2}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ajustar Parámetros (Módulo 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateToModule3 && (
              <button
                type="button"
                onClick={onNavigateToModule3}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Visualizar Señales en el Tiempo (Módulo 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateToModule4 && (
              <button
                type="button"
                onClick={onNavigateToModule4}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-800 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Análisis Espectral en Frecuencia (Módulo 4)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateToModule5 && (
              <button
                type="button"
                onClick={onNavigateToModule5}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <span>Panel de Resultados y Comparación (Módulo 5)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2 text-cyan-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Módulos 1, 2, 3, 4 y 5 plenamente operativos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
