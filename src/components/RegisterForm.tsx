import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../services/authService';
import { validateRegisterForm } from '../utils/validation';
import { User } from '../types/auth';

interface RegisterFormProps {
  onSuccess: (user: User, message: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validate inputs
    const validation = validateRegisterForm(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await registerUser({
        name,
        email,
        password,
      });

      if (result.success && result.user) {
        onSuccess(
          result.user,
          'Cuenta creada con éxito. Ingrese con su correo y contraseña para acceder al simulador.'
        );
      } else {
        setGeneralError(
          result.message || 'No fue posible registrar la cuenta. Verifique los datos ingresados.'
        );
      }
    } catch (err) {
      console.error('Error durante el registro:', err);
      setGeneralError('Ocurrió un error al procesar el registro. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Crear cuenta de acceso
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Registro de nuevo estudiante o investigador para el laboratorio de modulación FM.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Regresar a inicio de sesión"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {generalError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Error en el registro</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name Field */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Nombre completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                if (generalError) setGeneralError(null);
              }}
              placeholder="Ej. Juan Pérez Quispe"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.name
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.name}</span>
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                if (generalError) setGeneralError(null);
              }}
              placeholder="ejemplo@upea.edu.bo"
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

        {/* Password Field */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                if (generalError) setGeneralError(null);
              }}
              placeholder="Mínimo 6 caracteres"
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Confirmar contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
                if (generalError) setGeneralError(null);
              }}
              placeholder="Repita su contraseña"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.confirmPassword || passwordsMismatch
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : passwordsMatch
                  ? 'border-emerald-500 focus:ring-emerald-500/20'
                  : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
              title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time match visual helper */}
          {passwordsMatch && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Las contraseñas coinciden correctamente.</span>
            </p>
          )}

          {fieldErrors.confirmPassword && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.confirmPassword}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Crear cuenta</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to login link */}
      <div className="mt-6 text-center text-sm text-slate-400">
        ¿Ya tiene una cuenta registrada?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
        >
          Regresar al inicio de sesión
        </button>
      </div>
    </div>
  );
};
