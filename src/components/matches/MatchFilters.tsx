'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';

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
  { value: 'safety', label: 'Safety' },
  { value: 'target', label: 'Target' },
  { value: 'reach', label: 'Reach' },
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
  { value: 'usa', label: 'USA' },
  { value: 'canada', label: 'Canada' },
  { value: 'uk', label: 'UK' },
  { value: 'europe', label: 'Europe' },
  { value: 'australia', label: 'Australia' },
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
  const [collapsed, setCollapsed] = useState(true);

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
    opts: { value: string; label: string }[]
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(28,10,12,0.5)', flexShrink: 0, minWidth: '68px',
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
                border: isActive ? '1px solid rgba(28,10,12,0.22)' : '1px solid rgba(140,45,53,0.10)',
                background: isActive ? 'rgba(28,10,12,0.07)' : 'transparent',
                color: isActive ? '#1C0A0C' : 'rgba(28,10,12,0.45)',
                cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(28,10,12,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(28,10,12,0.65)'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(28,10,12,0.45)'; } }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const divider = <div style={{ height: '1px', background: 'rgba(140,45,53,0.07)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Collapse toggle header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 14px', borderRadius: '100px',
            background: collapsed ? 'rgba(140,45,53,0.05)' : 'rgba(140,45,53,0.08)',
            border: '1px solid rgba(140,45,53,0.14)',
            fontSize: '12px', fontWeight: 600, color: 'rgba(28,10,12,0.65)',
            cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit',
          }}
        >
          <SlidersHorizontal style={{ width: '13px', height: '13px', color: 'rgba(140,45,53,0.6)' }} />
          Filters
          {active > 0 && (
            <span style={{
              minWidth: '18px', height: '18px', borderRadius: '100px',
              background: '#8C2D35', color: '#F5EDE5',
              fontSize: '10px', fontWeight: 700, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', padding: '0 5px',
            }}>
              {active}
            </span>
          )}
          <ChevronDown style={{
            width: '12px', height: '12px',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease',
            color: 'rgba(28,10,12,0.4)',
          }} />
        </button>
        {active > 0 && collapsed && (
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', color: 'rgba(28,10,12,0.35)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: '4px 6px', borderRadius: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.35)')}
          >
            <X style={{ width: '11px', height: '11px' }} />
            Clear
          </button>
        )}
      </div>

      {/* Expandable filter panel */}
      {!collapsed && (
        <div style={{
          background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.09)',
          borderRadius: '16px', padding: '14px 18px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          {pill('Tier', 'tier', TIER_OPTS)}
          {divider}
          {pill('Budget', 'budgetRange', BUDGET_OPTS)}
          {divider}
          {pill('Admit Rate', 'successRate', ADMIT_OPTS)}
          {divider}
          {pill('Location', 'location', LOCATION_OPTS)}
          {divider}
          {pill('Test Policy', 'testPolicy', TEST_OPTS)}

          {active > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={reset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '11px', color: 'rgba(28,10,12,0.3)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '4px 8px', borderRadius: '6px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.3)')}
              >
                <X style={{ width: '12px', height: '12px' }} />
                Clear {active} filter{active > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
