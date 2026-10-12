import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { loginUser } from '../services/authService';
import { validateLoginForm } from '../utils/validation';
import { User } from '../types/auth';

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  initialEmail?: string;
  registrationSuccessMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  initialEmail = '',
  registrationSuccessMessage = null,
}) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(registrationSuccessMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    // Validate inputs
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.success && result.user) {
        setAuthSuccess('Credenciales validadas exitosamente.');
        setTimeout(() => {
          if (result.user) {
            onSuccess(result.user);
          }
        }, 600);
      } else {
        setAuthError(
          result.message || 'Error de autenticación. Verifique su correo electrónico y contraseña.'
        );
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setAuthError('Ocurrió un error inesperado al procesar la autenticación. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillStudent = () => {
    setEmail('estudiante.upea@upea.edu.bo');
    setPassword('Fm2026!*');
    setFieldErrors({});
    setAuthError(null);
  };

  const handleQuickFillTeacher = () => {
    setEmail('daniel.puna@upea.edu.bo');
    setPassword('Docente2026!*');
    setFieldErrors({});
    setAuthError(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Iniciar sesión en el Simulador
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ingrese sus credenciales académicas para acceder al laboratorio virtual de modulación FM.
        </p>
      </div>

      {/* Success banner if redirected from registration */}
      {authSuccess && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-200">Operación exitosa</p>
            <p className="text-xs text-emerald-300/90 mt-0.5">{authSuccess}</p>
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {authError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Error de inicio de sesión</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{authError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
                if (authError) setAuthError(null);
              }}
              placeholder="estudiante@upea.edu.bo"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.email
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field with show/hide toggle */}
        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
                if (authError) setAuthError(null);
              }}
              placeholder="••••••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.password
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Iniciar sesión</span>
            </>
          )}
        </button>
      </form>

      {/* Demo test helper section */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
          <span>Credenciales académicas precargadas (para pruebas):</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleQuickFillStudent}
            className="p-2 text-left rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-800/70 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <div className="font-medium text-slate-200">Cuenta de Estudiante</div>
            <div className="text-[11px] text-slate-400 truncate">estudiante.upea@upea.edu.bo</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Clave: Fm2026!*</div>
          </button>
          <button
            type="button"
            onClick={handleQuickFillTeacher}
            className="p-2 text-left rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-800/70 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <div className="font-medium text-slate-200">Cuenta Docente Titular</div>
            <div className="text-[11px] text-slate-400 truncate">daniel.puna@upea.edu.bo</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Clave: Docente2026!*</div>
          </button>
        </div>
      </div>

      {/* Switch to register link */}
      <div className="mt-6 text-center text-sm text-slate-400">
        ¿Aún no tienes cuenta registrada?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
        >
          Registrarse aquí
        </button>
      </div>
    </div>
  );
};
