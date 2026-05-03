'use client';

import { Globe, Home, TrendingUp } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'domestic' | 'international' | 'lifelong';
  onChange: (mode: 'domestic' | 'international' | 'lifelong') => void;
}

export function ModeToggle({ currentMode, onChange }: ModeToggleProps) {
  const modes = [
    {
      id: 'domestic' as const,
      label: 'Domestic',
      icon: Home,
      desc: 'US Universities',
      color: 'indigo',
    },
    {
      id: 'international' as const,
      label: 'International',
      icon: Globe,
      desc: 'Global Schools',
      color: 'purple',
    },
    {
      id: 'lifelong' as const,
      label: 'Lifelong',
      icon: TrendingUp,
      desc: 'Career Growth',
      color: 'emerald',
    },
  ];

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
              isActive
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <div className="hidden md:block">
              <div className="text-xs">{mode.label}</div>
              <div className="text-[10px] font-normal normal-case tracking-normal opacity-60">
                {mode.desc}
              </div>
            </div>
            <div className="md:hidden">{mode.label}</div>
          </button>
        );
      })}
    </div>
  );
}
