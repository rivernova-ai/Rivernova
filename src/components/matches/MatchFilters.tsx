'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface FilterOptions {
  budgetRange: string;
  location: string;
  successRate: string;
  programType: string;
  tier: string;
  testPolicy: string;
}

const TIER_OPTS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'safety', label: '🛡️ Safety' },
  { value: 'target', label: '🎯 Target' },
  { value: 'reach', label: '🚀 Reach' },
];

const BUDGET_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'under30k', label: '< $30k' },
  { value: '30k-50k', label: '$30–50k' },
  { value: '50k-70k', label: '$50–70k' },
  { value: 'over70k', label: '> $70k' },
];

const ADMIT_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'accessible', label: '> 50% Admit' },
  { value: 'selective', label: '20–50%' },
  { value: 'elite', label: '< 20%' },
];

const LOCATION_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'usa', label: '🇺🇸 USA' },
  { value: 'canada', label: '🇨🇦 Canada' },
  { value: 'uk', label: '🇬🇧 UK' },
  { value: 'europe', label: '🇪🇺 Europe' },
  { value: 'australia', label: '🇦🇺 Australia' },
];

const TEST_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'optional', label: 'Test-Optional' },
  { value: 'required', label: 'Test-Required' },
  { value: 'free', label: 'Test-Free' },
];

const DEFAULT_FILTERS: FilterOptions = {
  budgetRange: 'all',
  location: 'all',
  successRate: 'all',
  programType: 'all',
  tier: 'all',
  testPolicy: 'all',
};

export default function MatchFilters({ onFilterChange }: { onFilterChange: (f: FilterOptions) => void }) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const set = (k: keyof FilterOptions, v: string) => {
    const n = { ...filters, [k]: v };
    setFilters(n);
    onFilterChange(n);
  };

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  const active = Object.entries(filters).filter(([, v]) => v !== 'all').length;

  const pill = (
    label: string,
    filterKey: keyof FilterOptions,
    opts: { value: string; label: string }[],
    accentColor = '#818cf8'
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(240,240,248,0.25)', flexShrink: 0, minWidth: '68px',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {opts.map(o => {
          const isActive = filters[filterKey] === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => set(filterKey, o.value)}
              style={{
                padding: '5px 12px', borderRadius: '100px',
                fontSize: '12px', fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap', flexShrink: 0,
                border: isActive ? `1px solid ${accentColor}50` : '1px solid rgba(255,255,255,0.07)',
                background: isActive ? `${accentColor}14` : 'transparent',
                color: isActive ? accentColor : 'rgba(240,240,248,0.45)',
                cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,240,248,0.75)'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,240,248,0.45)'; } }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const divider = <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {pill('Tier', 'tier', TIER_OPTS, '#818cf8')}
      {divider}
      {pill('Budget', 'budgetRange', BUDGET_OPTS, '#a78bfa')}
      {divider}
      {pill('Admit Rate', 'successRate', ADMIT_OPTS, '#34d399')}
      {divider}
      {pill('Location', 'location', LOCATION_OPTS, '#c084fc')}
      {divider}
      {pill('Test Policy', 'testPolicy', TEST_OPTS, '#60a5fa')}

      {active > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', color: 'rgba(240,240,248,0.3)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: '4px 8px', borderRadius: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,240,248,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,248,0.3)')}
          >
            <X style={{ width: '12px', height: '12px' }} />
            Clear {active} filter{active > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
