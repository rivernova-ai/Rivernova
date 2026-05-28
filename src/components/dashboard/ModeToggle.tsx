'use client';

import { Globe, Home, TrendingUp } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'domestic' | 'international' | 'lifelong';
  onChange: (mode: 'domestic' | 'international' | 'lifelong') => void;
}

export function ModeToggle({ currentMode, onChange }: ModeToggleProps) {
  const modes = [
    { id: 'domestic' as const, label: 'Domestic', icon: Home },
    { id: 'international' as const, label: 'International', icon: Globe },
    { id: 'lifelong' as const, label: 'Lifelong', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200"
            style={{
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: isActive ? '#f0f0f8' : 'rgba(240,240,248,0.4)',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
