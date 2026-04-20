'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, MapPin, DollarSign, TrendingUp, ExternalLink, Info } from 'lucide-react';
import MatchFilters from '@/components/matches/MatchFilters';

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

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">
            Optimized <span className="gradient-text">Matches</span>
          </h2>
          <p className="text-white/40 font-medium">
            AI has synthesized {filteredMatches.length} programs based on your ROI goals.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
          <Sparkles className="w-3.5 h-3.5" />
          Zero-Commission Verified
        </div>
      </div>

      <MatchFilters onFilterChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match, i) => (
          <Card key={i} className="bg-[#0c0c10] border-white/10 rounded-[32px] p-8 hover:border-white/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-16 h-16 rounded-full border border-white/5 flex flex-col items-center justify-center bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                 <span className="text-xs font-black text-white/40 group-hover:text-indigo-400 leading-none">SCORE</span>
                 <span className="text-xl font-black text-white">{match.match_score || match.matchScore}</span>
              </div>
            </div>

            <div className="flex flex-col h-full">
              <div className="mb-6">
                <Badge variant="outline" className="mb-3 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 uppercase text-[9px] tracking-[0.2em] font-black">
                  {match.category || 'Target'}
                </Badge>
                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                  {match.name}
                </h3>
                <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {match.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">
                    <DollarSign className="w-3 h-3" />
                    Est. Tuition
                  </div>
                  <div className="text-lg font-bold text-white">{match.tuition}</div>
                </div>
                <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400/50 uppercase tracking-widest mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Projected ROI
                  </div>
                  <div className="text-lg font-bold text-emerald-400">{match.roi}</div>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-white/50 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4 py-2">
                  "{match.reasoning}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <button className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-2 transition-colors">
                  Explore Program <ExternalLink className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1">
                   <Info className="w-3 h-3 text-white/20" />
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Public Ledger Proof</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {citations && citations.length > 0 && (
        <div className="mt-12 bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Research Sources</h4>
          <div className="flex flex-wrap gap-3">
            {citations.map((url, i) => (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-indigo-400/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                Source {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
