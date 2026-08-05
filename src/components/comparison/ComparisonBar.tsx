'use client';

import { X, ArrowRight } from 'lucide-react';
import { ComparisonSchool } from '@/lib/comparison';
import { cleanText } from '@/lib/utils';

interface ComparisonBarProps {
  selectedSchools: ComparisonSchool[];
  onViewComparison: () => void;
  onRemoveSchool: (schoolName: string) => void;
}

const SCHOOL_DOT_COLORS = [
  '#8C2D35',
  '#1C0A0C',
  'rgba(140,45,53,0.6)',
  'rgba(28,10,12,0.5)',
];

export function ComparisonBar({ selectedSchools, onViewComparison, onRemoveSchool }: ComparisonBarProps) {
  if (selectedSchools.length < 1) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 20px' }}>
        <div
          style={{
            pointerEvents: 'auto',
            borderRadius: '18px',
            overflow: 'hidden',
            background: 'rgba(245,237,229,0.97)',
            border: '1px solid rgba(140,45,53,0.18)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 -4px 32px rgba(140,45,53,0.08), 0 8px 40px rgba(28,10,12,0.10)',
          }}
        >
          {/* Top crimson accent line */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(140,45,53,0.5) 50%, transparent 100%)' }} />

          <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

              {/* Label */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.4)' }}>Compare</span>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.4)' }}>Schools</span>
              </div>
              <div style={{ width: '1px', height: '28px', background: 'rgba(140,45,53,0.12)', flexShrink: 0 }} />

              {/* School pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflowX: 'auto' }}>
                {selectedSchools.map((school, idx) => {
                  const dotColor = SCHOOL_DOT_COLORS[idx % SCHOOL_DOT_COLORS.length];
                  return (
                    <div
                      key={school.name}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        borderRadius: '100px', padding: '7px 12px 7px 10px',
                        background: 'rgba(140,45,53,0.05)',
                        border: '1px solid rgba(140,45,53,0.14)',
                      }}
                    >
                      {/* Letter badge */}
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '10px', fontWeight: 700,
                        background: 'rgba(140,45,53,0.10)',
                        color: '#8C2D35',
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>

                      {/* Name */}
                      <span style={{ fontSize: '13px', fontWeight: 400, color: '#1C0A0C', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cleanText(school.name)}
                      </span>

                      {/* Match score */}
                      {(school.matchScore || 0) > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(28,10,12,0.55)', flexShrink: 0 }}>
                          {school.matchScore}%
                        </span>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => onRemoveSchool(school.name)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(140,45,53,0.08)',
                          border: '1px solid rgba(140,45,53,0.14)',
                          color: 'rgba(28,10,12,0.45)',
                          cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.15)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.08)'; }}
                      >
                        <X style={{ width: '10px', height: '10px' }} />
                      </button>
                    </div>
                  );
                })}

                {/* Empty slot hint */}
                {selectedSchools.length === 1 && (
                  <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                    borderRadius: '100px', padding: '7px 14px',
                    border: '1px dashed rgba(140,45,53,0.22)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(28,10,12,0.35)' }}>+ Add one more school</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedSchools.length < 2 && (
                  <span style={{ fontSize: '12px', color: 'rgba(28,10,12,0.4)' }}>
                    Add {2 - selectedSchools.length} more
                  </span>
                )}
                <button
                  onClick={onViewComparison}
                  disabled={selectedSchools.length < 2}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    height: '40px', padding: '0 22px', borderRadius: '100px',
                    background: selectedSchools.length >= 2 ? '#8C2D35' : 'rgba(140,45,53,0.25)',
                    color: '#F5EDE5', border: 'none',
                    fontSize: '13px', fontWeight: 600,
                    cursor: selectedSchools.length >= 2 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease', fontFamily: 'inherit',
                    boxShadow: selectedSchools.length >= 2 ? '0 4px 16px rgba(140,45,53,0.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (selectedSchools.length >= 2) (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  <span>Compare{selectedSchools.length > 1 ? ` ${selectedSchools.length} Schools` : ''}</span>
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
