'use client';

import { Globe, Home, TrendingUp } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'domestic' | 'international' | 'lifelong';
  onChange: (mode: 'domestic' | 'international' | 'lifelong') => void;
}

export function ModeToggle({ currentMode, onChange }: ModeToggleProps) {
  const modes = [
    { id: 'domestic', label: 'Domestic', icon: Home, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { id: 'international', label: 'Global', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { id: 'lifelong', label: 'Career', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-2xl">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id as any)}
            className={`relative group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
              isActive
                ? `${mode.bg} ${mode.color} ${mode.border} border shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05]'
            }`}
          >
            {isActive && (
              <div className={`absolute inset-0 blur-xl opacity-30 ${mode.bg} rounded-xl`} />
            )}
            <Icon className={`relative z-10 w-4 h-4 transition-transform group-hover:scale-110`} />
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em]">
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
