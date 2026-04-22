'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, Search, TrendingUp, MapPin, DollarSign, GraduationCap, Award, Briefcase, Calendar, ExternalLink, Heart, ArrowUpRight, Star, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { Button } from '@/components/ui/button';
import MatchFilters from '@/components/matches/MatchFilters';
import MapDistance from '@/components/matches/MapDistance';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Profile {
  mode: 'domestic' | 'international' | 'lifelong';
  onboarding_completed: boolean;
  full_name: string;
  academic_background: any;
  career_goals: any;
  budget: any;
  location_preferences: any;
}

interface SchoolMatch {
  name: string;
  location: string;
  program: string;
  tuition: string;
  highlights: string[];
  admissionRate?: string;
  ranking?: string;
  employmentRate?: string;
  avgSalary?: string;
  scholarships?: string;
  deadline?: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SchoolMatch[]>([]);
  const [filteredResults, setFilteredResults] = useState<SchoolMatch[]>([]);
  const [rawResults, setRawResults] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    budgetRange: 'all',
    location: 'all',
    successRate: 'all',
    programType: 'all',
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      if (!user) {
        router.push('/');
        return;
      }

      const supabase = createClient();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);
      
      // Load existing matches from database
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (matchesData && matchesData.length > 0) {
        // Convert database matches to display format
        const formattedMatches = matchesData.map(match => ({
          id: match.id,
          name: match.school_name,
          location: match.school_data?.location || '',
          program: match.school_data?.programName || '',
          tuition: match.school_data?.tuition || '',
          highlights: match.school_data?.highlights || [],
          admissionRate: match.school_data?.admissionRate || '',
          ranking: match.school_data?.ranking || '',
          employmentRate: match.school_data?.employmentRate || '',
          avgSalary: match.school_data?.avgSalary || '',
          scholarships: match.school_data?.scholarships || '',
          deadline: match.school_data?.deadline || '',
        }));
        setResults(formattedMatches);
        setFilteredResults(formattedMatches);
      }
      
      setChecking(false);
    };

    checkOnboarding();
  }, [user, loading, router]);

  const handleModeChange = async (newMode: 'domestic' | 'international' | 'lifelong') => {
    if (!user) return;

    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ mode: newMode })
      .eq('id', user.id);

    setProfile(prev => prev ? { ...prev, mode: newMode } : null);
  };

  const searchSchools = async () => {
    if (!profile) return;

    setSearching(true);
    setResults([]);
    setRawResults('');

    try {
      const academic = profile.academic_background || {};
      const career = profile.career_goals || {};
      const budget = profile.budget || {};
      const location = profile.location_preferences || {};

      const response = await fetch('/api/search-schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          major: academic.major || '',
          budget: budget.min && budget.max ? `$${budget.min} - $${budget.max}` : '',
          location: location.preferredCountries || '',
          gpa: academic.gpa || '',
          goals: career.dreamJob || career.careerField || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setRawResults(data.results);
      const parsedResults = parseResults(data.results);
      
      // Save matches to database
      if (parsedResults.length > 0) {
        const supabase = createClient();
        const matchesToSave = parsedResults.map(school => ({
          user_id: user!.id,
          school_name: school.name,
          school_data: {
            location: school.location,
            programName: school.program,
            tuition: school.tuition,
            highlights: school.highlights,
            admissionRate: school.admissionRate,
            ranking: school.ranking,
            employmentRate: school.employmentRate,
            avgSalary: school.avgSalary,
            scholarships: school.scholarships,
            deadline: school.deadline,
          },
          success_probability: 75, // Default value
          reasoning: 'Match based on your profile',
        }));

        await supabase.from('matches').insert(matchesToSave);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      alert(error.message || 'Failed to search schools');
    } finally {
      setSearching(false);
    }
  };

  const parseResults = (text: string): SchoolMatch[] => {
    const schools: SchoolMatch[] = [];
    const lines = text.split('\n');
    let currentSchool: Partial<SchoolMatch> = {};
    let highlights: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/^\d+\.\s+(.+)/) || (line.length > 0 && line.length < 100 && !line.includes(':') && i > 0 && lines[i-1].trim() === '')) {
        if (currentSchool.name) {
          schools.push({ ...currentSchool, highlights } as SchoolMatch);
          highlights = [];
        }
        currentSchool = { name: line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '') };
      }
      else if (line.toLowerCase().includes('location:')) {
        currentSchool.location = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('program:')) {
        currentSchool.program = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('tuition:')) {
        currentSchool.tuition = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('admission rate:')) {
        currentSchool.admissionRate = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('ranking:')) {
        currentSchool.ranking = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('employment rate:')) {
        currentSchool.employmentRate = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('salary:') || line.toLowerCase().includes('starting salary:')) {
        currentSchool.avgSalary = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('scholarship:')) {
        currentSchool.scholarships = line.split(':')[1]?.trim() || '';
      }
      else if (line.toLowerCase().includes('deadline:')) {
        currentSchool.deadline = line.split(':')[1]?.trim() || '';
      }
      else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        highlights.push(line.replace(/^[-•*]\s*/, ''));
      }
    }

    if (currentSchool.name) {
      schools.push({ ...currentSchool, highlights } as SchoolMatch);
    }

    const filteredSchools = schools.filter(s => s.name && s.name.length > 0);
    setResults(filteredSchools);
    setFilteredResults(filteredSchools);
    return filteredSchools;
  };

  const toggleFavorite = (index: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(index)) {
        newFavorites.delete(index);
      } else {
        newFavorites.add(index);
      }
      return newFavorites;
    });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    const filtered = results.filter((school) => {
      const tuition = parseInt(school.tuition?.replace(/[^0-9]/g, '') || '0');
      const location = school.location?.toLowerCase() || '';

      if (newFilters.budgetRange !== 'all') {
        if (newFilters.budgetRange === 'under30k' && tuition >= 30000) return false;
        if (newFilters.budgetRange === '30k-50k' && (tuition < 30000 || tuition >= 50000)) return false;
        if (newFilters.budgetRange === '50k-70k' && (tuition < 50000 || tuition >= 70000)) return false;
        if (newFilters.budgetRange === 'over70k' && tuition < 70000) return false;
      }

      if (newFilters.location !== 'all') {
        if (newFilters.location === 'usa' && !location.includes('usa') && !location.includes('united states')) return false;
        if (newFilters.location === 'canada' && !location.includes('canada')) return false;
        if (newFilters.location === 'uk' && !location.includes('uk') && !location.includes('united kingdom')) return false;
        if (newFilters.location === 'europe' && !location.includes('europe') && !location.includes('germany') && !location.includes('france')) return false;
      }

      return true;
    });

    setFilteredResults(filtered);
  };

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">Dashboard</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {profile.full_name || 'Welcome'}
          </h1>
          <p className="text-white/50 text-lg">Find your perfect match</p>
        </div>

        <ModeToggle currentMode={profile.mode} onChange={handleModeChange} />
      </div>

      {/* Profile Summary - Minimalist */}
      <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Profile</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">Complete</span>
            </div>
            <Button
              onClick={() => router.push('/onboarding?edit=true')}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-9 px-4 text-sm"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Major', value: profile.academic_background?.major || 'Not specified', isEmpty: !profile.academic_background?.major },
            { label: 'Budget', value: profile.budget?.min && profile.budget?.max ? `$${profile.budget.min}-${profile.budget.max}` : 'Not specified', isEmpty: !profile.budget?.min || !profile.budget?.max },
            { label: 'Location', value: profile.location_preferences?.preferredCountries || 'Not specified', isEmpty: !profile.location_preferences?.preferredCountries },
            { label: 'GPA', value: profile.academic_background?.gpa || 'Not specified', isEmpty: !profile.academic_background?.gpa },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{item.label}</div>
              <div className={`font-semibold truncate ${item.isEmpty ? 'text-white/30 italic' : 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Button */}
      {!searching && results.length === 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-3xl p-12 md:p-16 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Discover Your Perfect Match
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
              AI-powered recommendations tailored to your profile
            </p>
            <Button
              onClick={searchSchools}
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all text-base font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Find Schools
            </Button>
          </div>
        </div>
      )}

      {/* Searching State */}
      {searching && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-3xl p-16 text-center backdrop-blur-xl">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Analyzing Thousands of Schools
            </h2>
            <p className="text-white/50 max-w-md mx-auto">
              Our AI is researching programs, scholarships, and outcomes
            </p>
          </div>
        </div>
      )}

      {/* Results - Ultra Modern Design */}
      {results.length > 0 && !searching && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {filteredResults.length} Perfect Matches
              </h2>
              <p className="text-white/50">Curated for your success</p>
            </div>
            <Button
              onClick={searchSchools}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11 px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <MatchFilters onFilterChange={handleFilterChange} />

          <div className="grid gap-6">
            {filteredResults.map((school, idx) => (
              <div
                key={idx}
                className="group relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-purple-500/20 to-pink-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
                
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:border-white/[0.15]">
                  {/* Subtle gradient overlay */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="relative flex items-start justify-between mb-6">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                          {school.name}
                        </h3>
                        <button
                          onClick={() => toggleFavorite(idx)}
                          className={`p-2 rounded-xl transition-all ${
                            favorites.has(idx)
                              ? 'bg-pink-500/20 text-pink-400 scale-110'
                              : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 hover:scale-110'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(idx) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      {school.location && (
                        <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{school.location}</span>
                        </div>
                      )}
                      {school.program && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                          <GraduationCap className="w-4 h-4" />
                          <span>{school.program}</span>
                        </div>
                      )}
                    </div>

                    {school.tuition && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          {school.tuition}
                        </div>
                        <div className="text-xs text-white/30 uppercase tracking-wider mt-1">per year</div>
                      </div>
                    )}
                  </div>

                  {/* Stats - Sleek Pills */}
                  {(school.admissionRate || school.ranking || school.employmentRate || school.avgSalary) && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {school.admissionRate && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-400">{school.admissionRate}</span>
                          <span className="text-xs text-white/40">admit</span>
                        </div>
                      )}
                      {school.ranking && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-400">{school.ranking}</span>
                        </div>
                      )}
                      {school.employmentRate && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          <Briefcase className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-semibold text-indigo-400">{school.employmentRate}</span>
                          <span className="text-xs text-white/40">employed</span>
                        </div>
                      )}
                      {school.avgSalary && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-semibold text-purple-400">{school.avgSalary}</span>
                          <span className="text-xs text-white/40">avg salary</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlights - Clean List */}
                  {school.highlights && school.highlights.length > 0 && (
                    <div className="mb-6">
                      <div className="grid md:grid-cols-2 gap-3">
                        {school.highlights.slice(0, 6).map((highlight, i) => (
                          <div key={i} className="flex items-start gap-3 text-white/70 text-sm group/item">
                            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform" />
                            <span className="leading-relaxed">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/[0.08]">
                    {school.scholarships && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-yellow-400/60" />
                        <span className="text-white/40">Scholarships:</span>
                        <span className="text-white/70 font-medium">{school.scholarships}</span>
                      </div>
                    )}
                    {school.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-pink-400/60" />
                        <span className="text-white/40">Deadline:</span>
                        <span className="text-white/70 font-medium">{school.deadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Map Distance */}
                  <div className="mt-6">
                    <MapDistance schoolLocation={school.location} schoolName={school.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
