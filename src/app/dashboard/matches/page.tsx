'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MatchCard, type Match } from '@/components/matches/MatchCard';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { ComparisonModal } from '@/components/comparison/ComparisonModal';
import { type ComparisonSchool } from '@/lib/comparison';
import { Loader2, Sparkles, Search, RefreshCw } from 'lucide-react';

function matchToComparisonSchool(match: Match): ComparisonSchool {
  return {
    name: match.schoolName,
    location: match.location,
    program: match.programName,
    tuition: `$${match.costBreakdown.tuition.toLocaleString()}`,
    netPrice: `$${match.costBreakdown.total.toLocaleString()}`,
    matchScore: match.successProbability,
    gpaMinimum: match.admissionRequirements?.gpa,
    scholarships: match.costBreakdown.scholarshipPotential
      ? `$${match.costBreakdown.scholarshipPotential.toLocaleString()}`
      : undefined,
    highlights: match.highlights,
  };
}

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<ComparisonSchool[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleToggleCompare = (match: Match) => {
    const school = matchToComparisonSchool(match);
    setSelectedSchools(prev => {
      const exists = prev.find(s => s.name === school.name);
      if (exists) return prev.filter(s => s.name !== school.name);
      if (prev.length >= 4) return prev;
      return [...prev, school];
    });
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return; }
    if (user) loadMatches();
  }, [user, authLoading, router]);

  const loadMatches = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('matches').select('*').eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = data.map((m: any) => ({ id: m.id, ...m.school_data, favorited: m.favorited }));
      setMatches(mapped);
      setLoading(false);

      // Silently backfill any matches that don't have College Scorecard data yet
      const needsBackfill = mapped.some((m: any) => !m.dataSource);
      if (needsBackfill) {
        fetch('/api/matches/backfill-scorecard', { method: 'POST' })
          .then(r => r.json())
          .then(({ enriched }) => {
            if (enriched > 0) {
              // Reload cards so they show the corrected government data
              supabase.from('matches').select('*').eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .then(({ data: fresh }) => {
                  if (fresh) setMatches(fresh.map((m: any) => ({ id: m.id, ...m.school_data, favorited: m.favorited })));
                });
            }
          })
          .catch(() => { /* non-critical */ });
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/matches/generate', { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate matches');
      }
      const result = await response.json();
      await loadMatches();
      alert(`Successfully generated ${result.count} matches!`);
    } catch (error: any) {
      console.error('Error generating matches:', error);
      alert(error.message || 'Failed to generate matches. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleFavorite = async (matchId: string) => {
    try {
      const supabase = createClient();
      const match = matches.find(m => m.id === matchId);
      await supabase.from('matches').update({ favorited: !match?.favorited }).eq('id', matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, favorited: !m.favorited } : m));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (authLoading || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5EDE5' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: '#8C2D35', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ background: '#F5EDE5', minHeight: '100vh', padding: '2.5rem 2.5rem 4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8C2D35', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Sparkles style={{ width: '14px', height: '14px' }} />
              AI-Powered Matching
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#1C0A0C', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Your <span style={{ color: '#8C2D35' }}>Perfect Matches</span>
            </h1>
            <p style={{ color: 'rgba(28,10,12,0.5)', fontSize: '16px', margin: '10px 0 0', fontWeight: 300 }}>
              Unbiased recommendations with zero commissions
            </p>
          </div>

          <button
            onClick={generateMatches}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              height: '52px', padding: '0 28px', borderRadius: '100px',
              background: generating ? 'rgba(140,45,53,0.4)' : '#8C2D35',
              color: '#F5EDE5', border: 'none',
              boxShadow: generating ? 'none' : '0 0 24px rgba(140,45,53,0.25)',
              fontSize: '14px', fontWeight: 500, cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease', fontFamily: 'inherit',
            }}
          >
            {generating ? (
              <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />Generating Matches...</>
            ) : matches.length > 0 ? (
              <><RefreshCw style={{ width: '18px', height: '18px' }} />Regenerate Matches</>
            ) : (
              <><Search style={{ width: '18px', height: '18px' }} />Generate Matches</>
            )}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {matches.length === 0 && !generating && (
        <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.12)', borderRadius: '24px', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Search style={{ width: '32px', height: '32px', color: '#8C2D35' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#1C0A0C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Ready to find your perfect school?
          </h2>
          <p style={{ color: 'rgba(28,10,12,0.5)', maxWidth: '420px', margin: '0 auto 32px', lineHeight: 1.7, fontSize: '15px' }}>
            Our AI will analyze thousands of schools using real-time data to find the best matches for your profile.
          </p>
          <button
            onClick={generateMatches}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '52px', padding: '0 28px', borderRadius: '100px', background: '#8C2D35', color: '#F5EDE5', border: 'none', boxShadow: '0 0 24px rgba(140,45,53,0.25)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s ease', fontFamily: 'inherit' }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
            Generate My Matches
          </button>
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <div style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.12)', borderRadius: '24px', padding: '80px 40px', textAlign: 'center' }}>
          <Loader2 style={{ width: '56px', height: '56px', color: '#8C2D35', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#1C0A0C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Analyzing Your Profile...
          </h2>
          <p style={{ color: 'rgba(28,10,12,0.5)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7, fontSize: '15px' }}>
            Our AI is researching thousands of schools, scholarships, and programs to find your perfect matches. This may take 30–60 seconds.
          </p>
        </div>
      )}

      {/* Matches Grid — grouped by tier */}
      {matches.length > 0 && !generating && (() => {
        const tierOrder = ['reach', 'target', 'safety'] as const;
        const tierConfig = {
          reach:  { label: 'Reach Schools',  sub: 'Ambitious picks — lower admit rate, high reward', color: '#8C2D35',          bg: 'rgba(140,45,53,0.06)',  border: 'rgba(140,45,53,0.18)'  },
          target: { label: 'Target Schools', sub: 'Strong match — realistic and well-aligned',       color: 'rgba(28,10,12,0.7)', bg: 'rgba(28,10,12,0.05)',   border: 'rgba(28,10,12,0.14)'  },
          safety: { label: 'Safety Schools', sub: 'High-confidence admits — your safety net',         color: '#059669',            bg: 'rgba(5,150,105,0.06)',  border: 'rgba(5,150,105,0.18)' },
        };
        const grouped: Record<string, Match[]> = { reach: [], target: [], safety: [] };
        matches.forEach(m => {
          const t = (m.tier || 'target') as 'reach' | 'target' | 'safety';
          (grouped[t] = grouped[t] || []).push(m);
        });
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(28,10,12,0.5)', margin: 0 }}>
              Found <span style={{ color: '#1C0A0C', fontWeight: 600 }}>{matches.length}</span> matches for you
            </p>
            {tierOrder.map(tier => {
              const group = grouped[tier];
              if (!group || group.length === 0) return null;
              const cfg = tierConfig[tier];
              return (
                <div key={tier} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: `1px solid ${cfg.border}` }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: cfg.color, letterSpacing: '0.02em' }}>{cfg.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, opacity: 0.7, background: 'rgba(0,0,0,0.06)', borderRadius: '100px', padding: '1px 8px' }}>{group.length}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.42)' }}>{cfg.sub}</span>
                  </div>
                  {group.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onFavorite={handleFavorite}
                      onToggleCompare={handleToggleCompare}
                      isCompared={selectedSchools.some(s => s.name === match.schoolName)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })()}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <ComparisonBar
        selectedSchools={selectedSchools}
        onViewComparison={() => setShowComparison(true)}
        onRemoveSchool={name => setSelectedSchools(prev => prev.filter(s => s.name !== name))}
      />

      {showComparison && (
        <ComparisonModal
          schools={selectedSchools}
          userProfile={user}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
