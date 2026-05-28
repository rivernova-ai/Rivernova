'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, DollarSign, TrendingUp, ExternalLink, Award, Briefcase, Calendar } from 'lucide-react';
import MatchFilters from '@/components/matches/MatchFilters';
import { stripMarkdown } from '@/lib/utils';

interface MatchResultsProps {
  matches: any[];
  citations?: any[];
}

export default function MatchResults({ matches, citations }: MatchResultsProps) {
  const [filters, setFilters] = useState({
    budgetRange: 'all',
    location: 'all',
    successRate: 'all',
    programType: 'all',
  });

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const tuition = parseInt(match.tuition?.replace(/[^0-9]/g, '') || '0');
      const location = match.location?.toLowerCase() || '';
      const score = match.match_score || match.matchScore || 0;

      if (filters.budgetRange !== 'all') {
        if (filters.budgetRange === 'under30k' && tuition >= 30000) return false;
        if (filters.budgetRange === '30k-50k' && (tuition < 30000 || tuition >= 50000)) return false;
        if (filters.budgetRange === '50k-70k' && (tuition < 50000 || tuition >= 70000)) return false;
        if (filters.budgetRange === 'over70k' && tuition < 70000) return false;
      }

      if (filters.location !== 'all') {
        if (filters.location === 'usa' && !location.includes('usa') && !location.includes('united states')) return false;
        if (filters.location === 'canada' && !location.includes('canada')) return false;
        if (filters.location === 'uk' && !location.includes('uk') && !location.includes('united kingdom')) return false;
      }

      if (filters.successRate !== 'all') {
        if (filters.successRate === 'high' && score < 80) return false;
        if (filters.successRate === 'medium' && (score < 60 || score >= 80)) return false;
        if (filters.successRate === 'low' && score >= 60) return false;
      }

      return true;
    });
  }, [matches, filters]);

  if (!matches || matches.length === 0) return null;

  const scoreColor = (s: number) => s >= 80 ? '#34d399' : s >= 60 ? '#fb923c' : '#f87171';
  const scoreLabel = (s: number) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : 'Reach';

  return (
    <div className="space-y-8" style={{ color: '#f0f0f8' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[11px] font-light uppercase tracking-widest mb-1" style={{ color: 'rgba(240,240,248,0.3)' }}>Zero Commission Verified</p>
          <h2 className="text-3xl font-light tracking-tight" style={{ color: '#f0f0f8' }}>
            {filteredMatches.length} <span className="font-semibold">matches</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
          AI-Matched
        </div>
      </div>

      <MatchFilters onFilterChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredMatches.map((match, i) => {
          const score = match.match_score || match.matchScore || 0;
          const col = scoreColor(score);
          return (
            <div key={i}
              className="group rounded-[22px] p-6 flex flex-col gap-5 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>

              {/* Top row: name + score ring */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {match.category || 'Target'}
                    </span>
                  </div>
                  <h3 className="text-[19px] font-semibold tracking-tight leading-snug" style={{ color: '#f0f0f8' }}>
                    {stripMarkdown(match.name)}
                  </h3>
                  {match.location && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[13px] font-light" style={{ color: 'rgba(240,240,248,0.45)' }}>
                      <MapPin className="w-3.5 h-3.5 opacity-60" />
                      {stripMarkdown(match.location)}
                    </div>
                  )}
                </div>

                {/* Score ring */}
                <div className="flex-shrink-0 w-[60px] h-[60px] relative">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 15}
                      strokeDashoffset={2 * Math.PI * 15 - (score / 100) * (2 * Math.PI * 15)}
                      style={{ filter: `drop-shadow(0 0 6px ${col}80)` }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[13px] font-bold leading-none" style={{ color: '#f0f0f8' }}>{score}</span>
                    <span className="text-[9px] font-light leading-none mt-0.5" style={{ color: col }}>{scoreLabel(score)}</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,240,248,0.35)' }}>
                    <DollarSign className="w-3 h-3" /> Tuition
                  </div>
                  <p className="text-[15px] font-semibold" style={{ color: '#f0f0f8' }}>{stripMarkdown(match.tuition) || '—'}</p>
                </div>
                {match.roi && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-widest mb-1.5" style={{ color: 'rgba(52,211,153,0.6)' }}>
                      <TrendingUp className="w-3 h-3" /> ROI
                    </div>
                    <p className="text-[15px] font-semibold" style={{ color: '#34d399' }}>{stripMarkdown(match.roi)}</p>
                  </div>
                )}
              </div>

              {/* Metrics row */}
              {(match.admissionRate || match.employmentRate || match.scholarships || match.deadline) && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {match.admissionRate && <span className="text-[12px] font-light flex items-center gap-1.5" style={{ color: 'rgba(240,240,248,0.65)' }}><TrendingUp className="w-3.5 h-3.5 text-emerald-400" />{stripMarkdown(match.admissionRate)}</span>}
                  {match.employmentRate && <span className="text-[12px] font-light flex items-center gap-1.5" style={{ color: 'rgba(240,240,248,0.65)' }}><Briefcase className="w-3.5 h-3.5 text-indigo-400" />{stripMarkdown(match.employmentRate)}</span>}
                  {match.scholarships && <span className="text-[12px] font-light flex items-center gap-1.5" style={{ color: 'rgba(240,240,248,0.65)' }}><Award className="w-3.5 h-3.5 text-amber-400" />{stripMarkdown(match.scholarships)}</span>}
                  {match.deadline && <span className="text-[12px] font-light flex items-center gap-1.5" style={{ color: 'rgba(240,240,248,0.65)' }}><Calendar className="w-3.5 h-3.5 text-rose-400" />{stripMarkdown(match.deadline)}</span>}
                </div>
              )}

              {/* Reasoning */}
              {match.reasoning && (
                <p className="text-[13px] font-light leading-relaxed italic pl-3"
                  style={{ color: 'rgba(240,240,248,0.45)', borderLeft: '2px solid rgba(99,102,241,0.3)' }}>
                  "{stripMarkdown(match.reasoning)}"
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                  style={{ color: '#818cf8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}>
                  Explore Program <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.2)' }}>Public Ledger Proof</span>
              </div>
            </div>
          );
        })}
      </div>

      {citations && citations.length > 0 && (
        <div className="rounded-[20px] p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h4 className="text-[10px] font-light uppercase tracking-widest mb-4" style={{ color: 'rgba(240,240,248,0.3)' }}>Research Sources</h4>
          <div className="flex flex-wrap gap-2">
            {citations.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}>
                <ExternalLink className="w-3 h-3" /> Source {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
