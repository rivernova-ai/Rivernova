'use client';

import { X, ArrowRight } from 'lucide-react';
import { ComparisonSchool } from '@/lib/comparison';
import { cleanText } from '@/lib/utils';

interface ComparisonBarProps {
  selectedSchools: ComparisonSchool[];
  onViewComparison: () => void;
  onRemoveSchool: (schoolName: string) => void;
}

const SCHOOL_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b'];

export function ComparisonBar({ selectedSchools, onViewComparison, onRemoveSchool }: ComparisonBarProps) {
  if (selectedSchools.length < 1) return null;

  const scoreColor = (s: number) => s >= 80 ? '#34d399' : s >= 60 ? '#fb923c' : '#f87171';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Ambient glow from below */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-56 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div
          className="pointer-events-auto relative rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 ease-out"
          style={{
            background: 'rgba(8,8,16,0.93)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          {/* Top indigo shimmer line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.7) 50%, transparent 100%)' }}
          />

          <div className="px-6 py-4">
            <div className="flex items-center gap-5">
              {/* Label */}
              <div className="flex-shrink-0 hidden md:flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: 'rgba(240,240,248,0.3)' }}>Comparison</span>
                <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: 'rgba(240,240,248,0.3)' }}>Engine</span>
              </div>
              <div className="hidden md:block w-px h-8 self-center" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* School pills */}
              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
                {selectedSchools.map((school, idx) => {
                  const sc = scoreColor(school.matchScore || 0);
                  const accent = SCHOOL_COLORS[idx % SCHOOL_COLORS.length];
                  return (
                    <div
                      key={school.name}
                      className="flex-shrink-0 flex items-center gap-2.5 rounded-full px-4 py-2.5 transition-all animate-in fade-in slide-in-from-left-2 duration-400"
                      style={{
                        background: `${accent}0f`,
                        border: `1px solid ${accent}35`,
                        animationDelay: `${idx * 70}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      {/* Letter badge */}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                        style={{ background: `${accent}28`, color: accent }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>

                      {/* Name */}
                      <span className="text-sm font-light truncate max-w-[150px]" style={{ color: '#f0f0f8' }}>
                        {cleanText(school.name)}
                      </span>

                      {/* Match score */}
                      {(school.matchScore || 0) > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc }} />
                          <span className="text-[11px] font-semibold" style={{ color: sc }}>{school.matchScore}%</span>
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => onRemoveSchool(school.name)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:rotate-90 duration-200 flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.4)' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Empty slot hints */}
                {selectedSchools.length === 1 && (
                  <div
                    className="flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5"
                    style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
                  >
                    <span className="text-xs" style={{ color: 'rgba(240,240,248,0.28)' }}>+ Add one more school</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 flex items-center gap-4">
                {selectedSchools.length < 2 && (
                  <span className="text-xs hidden sm:block" style={{ color: 'rgba(240,240,248,0.38)' }}>
                    Add {2 - selectedSchools.length} more
                  </span>
                )}
                <button
                  onClick={onViewComparison}
                  disabled={selectedSchools.length < 2}
                  className="group relative flex items-center gap-2.5 rounded-full px-6 h-11 font-semibold text-sm transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff',
                    boxShadow: '0 0 28px rgba(99,102,241,0.45)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.12),transparent)' }} />
                  <span className="relative tracking-tight">
                    Compare{selectedSchools.length > 1 ? ` ${selectedSchools.length} Schools` : ''}
                  </span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
