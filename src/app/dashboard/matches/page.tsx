'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MatchCard, type Match } from '@/components/matches/MatchCard';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Search, RefreshCw } from 'lucide-react';

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadMatches();
    }
  }, [user, authLoading, router]);

  const loadMatches = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMatches = data.map((m: any) => ({
        id: m.id,
        ...m.school_data,
        favorited: m.favorited,
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/matches/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate matches');
      }

      const result = await response.json();
      
      // Reload matches from database
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
      
      await supabase
        .from('matches')
        .update({ favorited: !match?.favorited })
        .eq('id', matchId);

      setMatches(prev =>
        prev.map(m => (m.id === matchId ? { ...m, favorited: !m.favorited } : m))
      );
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            AI-Powered Matching
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Your <span className="gradient-text">Perfect Matches</span>
          </h1>
          <p className="text-white/60 text-lg">
            Unbiased recommendations with zero commissions
          </p>
        </div>

        <Button
          onClick={generateMatches}
          disabled={generating}
          className="rounded-xl h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Matches...
            </>
          ) : matches.length > 0 ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Regenerate Matches
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Generate Matches
            </>
          )}
        </Button>
      </div>

      {/* Empty State */}
      {matches.length === 0 && !generating && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to find your perfect school?
          </h2>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            Our AI will analyze thousands of schools using real-time data to find the best matches for your profile.
          </p>
          <Button
            onClick={generateMatches}
            className="rounded-xl h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Matches
          </Button>
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-16 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Analyzing Your Profile...
          </h2>
          <p className="text-white/60 max-w-md mx-auto">
            Our AI is researching thousands of schools, scholarships, and programs to find your perfect matches. This may take 30-60 seconds.
          </p>
        </div>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && !generating && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-white/60">
              Found <span className="text-white font-bold">{matches.length}</span> matches for you
            </p>
          </div>

          <div className="grid gap-6">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} onFavorite={handleFavorite} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
