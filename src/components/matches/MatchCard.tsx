'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, DollarSign, Heart, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, GitCompareArrows } from 'lucide-react';
import MapDistance from './MapDistance';
import { stripMarkdown, cleanText, getMatchScoreColor, getMatchScoreLabel } from '@/lib/utils';

const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'AU$', GBP: '£', CAD: 'CA$', EUR: '€', NZD: 'NZ$',
  SGD: 'S$', HKD: 'HK$', CHF: 'CHF ', SEK: 'kr ', INR: '₹',
  JPY: '¥', CNY: '¥', MXN: 'MX$', ZAR: 'R ', USD: '$',
};

function formatTuition(usdAmount: number, localAmount?: number, localCurrency?: string): string {
  if (!localAmount || !localCurrency || localCurrency === 'USD') {
    return `$${usdAmount.toLocaleString()}`;
  }
  const symbol = CURRENCY_SYMBOLS[localCurrency] || `${localCurrency} `;
  const usdK = usdAmount >= 1000 ? `~$${(usdAmount / 1000).toFixed(0)}K USD` : `~$${usdAmount} USD`;
  return `${symbol}${localAmount.toLocaleString()} (${usdK})`;
}

export interface Match {
  id?: string;
  schoolName: string;
  location: string;
  programName: string;
  successProbability: number;
  matchScore?: number;
  reasoning: string;
  costBreakdown: {
    tuition: number;
    living: number;
    total: number;
    scholarshipPotential?: number;
    tuitionLocalAmount?: number;
    tuitionLocalCurrency?: string;
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
  tier?: 'safety' | 'target' | 'reach';
}

interface MatchCardProps {
  match: Match;
  onFavorite?: (id: string) => void;
  onToggleCompare?: (match: Match) => void;
  isCompared?: boolean;
}

const probStyle = (prob: number) => {
  if (prob >= 80) return { color: '#059669', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' };
  if (prob >= 60) return { color: '#8C2D35', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.2)' };
  return { color: '#d97706', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' };
};

export function MatchCard({ match, onFavorite, onToggleCompare, isCompared }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [favorited, setFavorited] = useState(match.favorited || false);

  const handleFavorite = () => {
    setFavorited(!favorited);
    if (onFavorite && match.id) onFavorite(match.id);
  };

  return (
    <div
      style={{ background: 'rgba(245,237,229,0.6)', border: '1px solid rgba(140,45,53,0.12)', borderRadius: '24px', padding: '32px', position: 'relative', transition: 'all 0.2s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(140,45,53,0.25)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(140,45,53,0.12)'; }}
    >
      {/* Match Score Badge */}
      {match.matchScore !== undefined && (
        <div style={{
          position: 'absolute', top: '28px', right: '28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          width: '76px', height: '76px', borderRadius: '18px',
          background: 'rgba(140,45,53,0.08)', border: '2px solid rgba(140,45,53,0.25)',
        }}>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#8C2D35', lineHeight: 1 }}>{match.matchScore}%</span>
          <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(140,45,53,0.65)', marginTop: '3px' }}>
            {getMatchScoreLabel(match.matchScore)}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ flex: 1, paddingRight: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1C0A0C', margin: 0, letterSpacing: '-0.02em' }}>
              {cleanText(match.schoolName)}
            </h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 13px', borderRadius: '100px', background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.25)', fontSize: '13px', fontWeight: 700, color: '#059669' }}>
              <ShieldCheck style={{ width: '11px', height: '11px' }} />
              $0 Commission
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(28,10,12,0.5)', fontSize: '13px', marginBottom: '10px' }}>
            <MapPin style={{ width: '14px', height: '14px' }} />
            {cleanText(match.location)}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(28,10,12,0.7)', margin: 0 }}>{cleanText(match.programName)}</p>
        </div>

        <button
          onClick={handleFavorite}
          style={{
            position: 'absolute', top: '28px', right: match.matchScore !== undefined ? '120px' : '28px',
            width: '40px', height: '40px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: favorited ? 'rgba(244,63,94,0.1)' : 'rgba(140,45,53,0.05)',
            border: favorited ? '1px solid rgba(244,63,94,0.22)' : '1px solid rgba(140,45,53,0.12)',
            color: favorited ? '#fb7185' : 'rgba(28,10,12,0.4)',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <Heart style={{ width: '18px', height: '18px', fill: favorited ? 'currentColor' : 'none' }} />
        </button>
      </div>

      {/* Scores Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderRadius: '12px', ...probStyle(match.successProbability) }}>
          <TrendingUp style={{ width: '18px', height: '18px' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{match.successProbability}%</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Match Score</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderRadius: '12px', background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.12)', color: '#1C0A0C' }}>
          <DollarSign style={{ width: '18px', height: '18px', color: '#8C2D35' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>
              {match.costBreakdown.tuitionLocalAmount && match.costBreakdown.tuitionLocalCurrency && match.costBreakdown.tuitionLocalCurrency !== 'USD'
                ? `${CURRENCY_SYMBOLS[match.costBreakdown.tuitionLocalCurrency] || match.costBreakdown.tuitionLocalCurrency + ' '}${(match.costBreakdown.tuitionLocalAmount / 1000).toFixed(0)}k`
                : `$${(match.costBreakdown.total / 1000).toFixed(0)}k`}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(28,10,12,0.5)', marginTop: '2px' }}>
              {match.costBreakdown.tuitionLocalCurrency && match.costBreakdown.tuitionLocalCurrency !== 'USD'
                ? `Tuition (${match.costBreakdown.tuitionLocalCurrency})`
                : 'Total/Year'}
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {match.highlights.slice(0, 3).map((highlight, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(28,10,12,0.7)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8C2D35', flexShrink: 0, marginTop: '5px' }} />
            <span>{cleanText(highlight)}</span>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(28,10,12,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>Why This Match?</h4>
        <p style={{ fontSize: '13px', color: 'rgba(28,10,12,0.85)', lineHeight: 1.7, margin: 0 }}>{cleanText(match.reasoning)}</p>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {/* Cost Breakdown */}
          <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(28,10,12,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Cost Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(28,10,12,0.65)' }}>
                <span>Tuition</span>
                <span style={{ fontWeight: 600 }}>{formatTuition(match.costBreakdown.tuition, match.costBreakdown.tuitionLocalAmount, match.costBreakdown.tuitionLocalCurrency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(28,10,12,0.65)' }}>
                <span>Living Expenses</span>
                <span style={{ fontWeight: 600 }}>${match.costBreakdown.living.toLocaleString()}</span>
              </div>
              {match.costBreakdown.scholarshipPotential && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Scholarship Potential</span>
                  <span style={{ fontWeight: 600 }}>-${match.costBreakdown.scholarshipPotential.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1C0A0C', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid rgba(140,45,53,0.10)' }}>
                <span>Total Annual Cost</span>
                <span>${match.costBreakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Admission Requirements */}
          {match.admissionRequirements && (
            <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(28,10,12,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Admission Requirements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'rgba(28,10,12,0.65)' }}>
                {match.admissionRequirements.gpa && (
                  <div><span style={{ color: 'rgba(28,10,12,0.4)' }}>GPA:</span> {cleanText(match.admissionRequirements.gpa)}</div>
                )}
                {match.admissionRequirements.testScores && (
                  <div><span style={{ color: 'rgba(28,10,12,0.4)' }}>Test Scores:</span> {cleanText(match.admissionRequirements.testScores)}</div>
                )}
                {match.admissionRequirements.other && (
                  <div><span style={{ color: 'rgba(28,10,12,0.4)' }}>Other:</span> {cleanText(match.admissionRequirements.other)}</div>
                )}
              </div>
            </div>
          )}

          {/* Map Distance */}
          <MapDistance schoolLocation={match.location} schoolName={match.schoolName} />

          {/* Zero Commission */}
          <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '10px', fontWeight: 700, color: '#059669', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck style={{ width: '14px', height: '14px' }} />
              Zero Commission Guarantee
            </h4>
            <p style={{ fontSize: '13px', color: 'rgba(28,10,12,0.82)', lineHeight: 1.7, margin: 0 }}>{cleanText(match.whyUnbiased)}</p>
          </div>

          {/* Citations */}
          {match.citations && match.citations.length > 0 && (
            <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(28,10,12,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>Sources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {match.citations.map((citation, idx) => (
                  <div key={idx} style={{ fontSize: '11px', color: 'rgba(28,10,12,0.5)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#8C2D35' }}>[{idx + 1}]</span>
                    <span>{cleanText(citation)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '46px', borderRadius: '100px', background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.15)', color: '#8C2D35', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.09)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.05)'; }}
        >
          {expanded ? <><ChevronUp style={{ width: '16px', height: '16px' }} />Show Less</> : <><ChevronDown style={{ width: '16px', height: '16px' }} />View Details</>}
        </button>
        {onToggleCompare && (
          <button
            onClick={() => onToggleCompare(match)}
            title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
            style={{
              width: '46px', height: '46px', borderRadius: '100px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isCompared ? 'rgba(140,45,53,0.12)' : 'rgba(140,45,53,0.05)',
              border: isCompared ? '1px solid rgba(140,45,53,0.35)' : '1px solid rgba(140,45,53,0.15)',
              color: '#8C2D35', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isCompared ? 'rgba(140,45,53,0.12)' : 'rgba(140,45,53,0.05)'; }}
          >
            <GitCompareArrows style={{ width: '17px', height: '17px' }} />
          </button>
        )}
        <button
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '46px', borderRadius: '100px', background: '#8C2D35', color: '#F5EDE5', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(140,45,53,0.2)' }}
        >
          <ExternalLink style={{ width: '16px', height: '16px' }} />
          Learn More
        </button>
      </div>
    </div>
  );
}
