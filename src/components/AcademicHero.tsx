import React from 'react';
import { Activity, BookOpen, Radio, Award } from 'lucide-react';
import telecomLabImg from '../assets/images/telecom_lab_fm_1791819727481.jpg';

export const AcademicHero: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 backdrop-blur-md overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div>
        {/* Academic institution tag */}
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1.5 rounded-full w-fit mb-4">
          <Award className="w-3.5 h-3.5" />
          <span>Universidad Pública de El Alto · Ingeniería Electrónica</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          Laboratorio Virtual de Modulación de Frecuencia (FM)
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Entorno interactivo para el estudio y análisis espectral de señales analógicas moduladas en frecuencia, orientado a la formación técnica de excelencia en telecomunicaciones.
        </p>

        {/* Laboratory Bench Visual with fallback */}
        <div className="mt-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative aspect-video shadow-lg group">
          <img
            src={telecomLabImg}
            alt="Mesa de instrumentos de laboratorio de telecomunicaciones con generador de RF y analizador de espectro"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Graceful fallback to styled SVG
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none flex items-end p-3.5">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Estación de Prácticas de Telecomunicaciones RF
            </span>
          </div>
        </div>

        {/* Competencies and Objectives */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 shrink-0 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Procesamiento y Modulación de Señales
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verificación del comportamiento de la onda portadora, señal moduladora e índice de modulación (β).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Cátedra Universitaria de Telecomunicaciones
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Desarrollado bajo la dirección académica del <strong className="text-slate-300">MSc. Ing. Daniel Puña</strong> para la Carrera de Ingeniería Electrónica - UPEA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer metadata note */}
      <div className="mt-6 pt-4 border-t border-slate-800/70 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Gestión Académica 2026</span>
        <span>Módulo 1: Control de Acceso</span>
      </div>
    </div>
  );
};
