'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, DollarSign, Heart, ExternalLink, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapDistance from './MapDistance';
import { cleanAIText } from '@/lib/utils';

export interface Match {
  id?: string;
  schoolName: string;
  location: string;
  programName: string;
  successProbability: number;
  reasoning: string;
  costBreakdown: {
    tuition: number;
    living: number;
    total: number;
    scholarshipPotential?: number;
  };
  highlights: string[];
  admissionRequirements?: {
    gpa?: string;
    testScores?: string;
    other?: string;
  };
  whyUnbiased: string;
  citations?: string[];
  favorited?: boolean;
}

interface MatchCardProps {
  match: Match;
  onFavorite?: (id: string) => void;
}

export function MatchCard({ match, onFavorite }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [favorited, setFavorited] = useState(match.favorited || false);

  const handleFavorite = () => {
    setFavorited(!favorited);
    if (onFavorite && match.id) {
      onFavorite(match.id);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (prob >= 60) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              {cleanAIText(match.schoolName)}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              $0 Commission
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            {cleanAIText(match.location)}
          </div>
          <p className="text-white/80 font-medium">{cleanAIText(match.programName)}</p>
        </div>

        <button
          onClick={handleFavorite}
          className={`p-3 rounded-xl transition-all ${
            favorited
              ? 'bg-pink-500/20 text-pink-400'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Success Probability */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getProbabilityColor(match.successProbability)}`}>
          <TrendingUp className="w-5 h-5" />
          <div>
            <div className="text-2xl font-bold">{match.successProbability}%</div>
            <div className="text-xs opacity-80">Match Score</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/5 border-white/10 text-white">
          <DollarSign className="w-5 h-5" />
          <div>
            <div className="text-2xl font-bold">${(match.costBreakdown.total / 1000).toFixed(0)}k</div>
            <div className="text-xs opacity-60">Total/Year</div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-2 mb-6">
        {match.highlights.slice(0, 3).map((highlight, idx) => (
          <div key={idx} className="flex items-start gap-2 text-white/80 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <span>{cleanAIText(highlight)}</span>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <h4 className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Why This Match?</h4>
        <p className="text-white/70 text-sm leading-relaxed">{cleanAIText(match.reasoning)}</p>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Cost Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Tuition</span>
                <span className="font-bold">${match.costBreakdown.tuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Living Expenses</span>
                <span className="font-bold">${match.costBreakdown.living.toLocaleString()}</span>
              </div>
              {match.costBreakdown.scholarshipPotential && (
                <div className="flex justify-between text-emerald-400">
                  <span>Scholarship Potential</span>
                  <span className="font-bold">-${match.costBreakdown.scholarshipPotential.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                <span>Total Annual Cost</span>
                <span>${match.costBreakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Admission Requirements */}
          {match.admissionRequirements && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Admission Requirements</h4>
              <div className="space-y-2 text-sm text-white/70">
                {match.admissionRequirements.gpa && (
                  <div><span className="text-white/50">GPA:</span> {cleanAIText(match.admissionRequirements.gpa)}</div>
                )}
                {match.admissionRequirements.testScores && (
                  <div><span className="text-white/50">Test Scores:</span> {cleanAIText(match.admissionRequirements.testScores)}</div>
                )}
                {match.admissionRequirements.other && (
                  <div><span className="text-white/50">Other:</span> {cleanAIText(match.admissionRequirements.other)}</div>
                )}
              </div>
            </div>
          )}

          {/* Map Distance */}
          <MapDistance schoolLocation={match.location} schoolName={match.schoolName} />

          {/* Why Unbiased */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Zero Commission Guarantee
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">{cleanAIText(match.whyUnbiased)}</p>
          </div>

          {/* Citations */}
          {match.citations && match.citations.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">Sources</h4>
              <div className="space-y-1">
                {match.citations.map((citation, idx) => (
                  <div key={idx} className="text-xs text-white/50 flex items-start gap-2">
                    <span className="text-indigo-400">[{idx + 1}]</span>
                    <span className="flex-1">{cleanAIText(citation)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setExpanded(!expanded)}
          variant="outline"
          className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              View Details
            </>
          )}
        </Button>
        <Button className="flex-1 rounded-xl h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0">
          <ExternalLink className="w-4 h-4 mr-2" />
          Learn More
        </Button>
      </div>
    </div>
  );
}
