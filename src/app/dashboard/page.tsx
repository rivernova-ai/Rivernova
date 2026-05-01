'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, Search, TrendingUp, MapPin, DollarSign, GraduationCap, Award, Briefcase, Calendar, Heart, Star, Zap, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { Button } from '@/components/ui/button';
import MatchFilters from '@/components/matches/MatchFilters';
import MapDistance from '@/components/matches/MapDistance';
import { stripMarkdown } from '@/lib/utils';

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
      
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (matchesData && matchesData.length > 0) {
        const formattedMatches = matchesData.map(match => (({
          id: match.id,
          name: stripMarkdown(match.school_name),
          location: stripMarkdown(match.school_data?.location || ''),
          program: stripMarkdown(match.school_data?.programName || ''),
          tuition: stripMarkdown(match.school_data?.tuition || ''),
          highlights: (match.school_data?.highlights || []).map((h: string) => stripMarkdown(h)),
          admissionRate: stripMarkdown(match.school_data?.admissionRate || ''),
          ranking: stripMarkdown(match.school_data?.ranking || ''),
          employmentRate: stripMarkdown(match.school_data?.employmentRate || ''),
          avgSalary: stripMarkdown(match.school_data?.avgSalary || ''),
          scholarships: stripMarkdown(match.school_data?.scholarships || ''),
          deadline: stripMarkdown(match.school_data?.deadline || ''),
        })));
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
    setFilteredResults([]);
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
          success_probability: 75,
          reasoning: 'Match based on your profile',
        }));

        await supabase.from('matches').insert(matchesToSave);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to search schools. Please try again.');
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
        currentSchool = { name: stripMarkdown(line.replace(/^\d+\.\s+/, '')) };
      }
      else if (line.toLowerCase().includes('location:')) {
        currentSchool.location = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('program:')) {
        currentSchool.program = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('tuition:')) {
        currentSchool.tuition = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('admission rate:')) {
        currentSchool.admissionRate = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('ranking:')) {
        currentSchool.ranking = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('employment rate:')) {
        currentSchool.employmentRate = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('salary:') || line.toLowerCase().includes('starting salary:')) {
        currentSchool.avgSalary = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('scholarship:')) {
        currentSchool.scholarships = stripMarkdown(line.split(':')[1]);
      }
      else if (line.toLowerCase().includes('deadline:')) {
        currentSchool.deadline = stripMarkdown(line.split(':')[1]);
      }
      else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        highlights.push(stripMarkdown(line.replace(/^[-•*]\s*/, '')));
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Minimal */}
      <div className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/40 font-light uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-light text-white">{profile.full_name || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard/edit-profile')}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full h-10 px-6 text-sm font-light"
            >
              Edit Profile
            </Button>
            <ModeToggle currentMode={profile.mode} onChange={handleModeChange} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-12">
        {/* Profile Summary - Ultra Minimal */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Major', value: profile.academic_background?.major || '—', icon: GraduationCap },
              { label: 'Budget', value: profile.budget?.min && profile.budget?.max ? `$${profile.budget.min}-${profile.budget.max}` : '—', icon: DollarSign },
              { label: 'Location', value: profile.location_preferences?.preferredCountries || '—', icon: MapPin },
              { label: 'GPA', value: profile.academic_background?.gpa || '—', icon: Star },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-400/60" />
                    <p className="text-xs text-white/40 font-light uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-lg font-light text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search State */}
        {!searching && results.length === 0 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-light text-white leading-tight">
                Discover your<br />
                <span className="font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">perfect match</span>
              </h2>
              <p className="text-lg text-white/50 font-light max-w-2xl">
                AI-powered recommendations tailored to your profile and goals
              </p>
            </div>

            <Button
              onClick={searchSchools}
              className="rounded-full bg-white text-black hover:bg-white/90 text-base font-medium h-12 px-8 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Find Schools
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Searching State */}
        {searching && (
          <div className="space-y-12 py-20">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-light text-white">Analyzing schools</h2>
                <p className="text-white/50 font-light">Finding your perfect matches...</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !searching && (
          <div className="space-y-12">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-light text-white">
                  {filteredResults.length} <span className="font-semibold">matches</span>
                </h2>
                <p className="text-white/50 font-light">Curated for your success</p>
              </div>
              <Button
                onClick={searchSchools}
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full h-11 px-6 font-light"
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <MatchFilters onFilterChange={handleFilterChange} />

            {/* School Cards - Ultra Sleek */}
            <div className="space-y-6">
              {filteredResults.map((school, idx) => (
                <div key={idx} className="group">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl md:text-3xl font-light text-white group-hover:text-indigo-300 transition-colors">
                            {school.name}
                          </h3>
                          <button
                            onClick={() => toggleFavorite(idx)}
                            className={`p-2 rounded-lg transition-all ${
                              favorites.has(idx)
                                ? 'bg-pink-500/20 text-pink-400'
                                : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${favorites.has(idx) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        {school.location && (
                          <div className="flex items-center gap-2 text-white/50 text-sm font-light">
                            <MapPin className="w-4 h-4" />
                            <span>{school.location}</span>
                          </div>
                        )}
                      </div>
                      {school.tuition && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-3xl font-light bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {school.tuition}
                          </p>
                          <p className="text-xs text-white/30 font-light mt-1">per year</p>
                        </div>
                      )}
                    </div>

                    {/* Program Badge */}
                    {school.program && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-light">
                        <GraduationCap className="w-4 h-4" />
                        {school.program}
                      </div>
                    )}

                    {/* Stats - Minimal Pills */}
                    {(school.admissionRate || school.ranking || school.employmentRate || school.avgSalary) && (
                      <div className="flex flex-wrap gap-3">
                        {school.admissionRate && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-light">
                            <TrendingUp className="w-4 h-4" />
                            {school.admissionRate}
                          </div>
                        )}
                        {school.ranking && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-light">
                            <Star className="w-4 h-4" />
                            {school.ranking}
                          </div>
                        )}
                        {school.employmentRate && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-light">
                            <Briefcase className="w-4 h-4" />
                            {school.employmentRate}
                          </div>
                        )}
                        {school.avgSalary && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-light">
                            <Zap className="w-4 h-4" />
                            {school.avgSalary}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Highlights */}
                    {school.highlights && school.highlights.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                        {school.highlights.slice(0, 4).map((highlight, i) => (
                          <div key={i} className="flex items-start gap-3 text-white/60 text-sm font-light">
                            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    {(school.scholarships || school.deadline) && (
                      <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5 text-sm font-light">
                        {school.scholarships && (
                          <div className="flex items-center gap-2 text-white/50">
                            <Award className="w-4 h-4 text-yellow-400/60" />
                            <span>{school.scholarships}</span>
                          </div>
                        )}
                        {school.deadline && (
                          <div className="flex items-center gap-2 text-white/50">
                            <Calendar className="w-4 h-4 text-pink-400/60" />
                            <span>{school.deadline}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Map */}
                    <div className="pt-4 border-t border-white/5">
                      <MapDistance schoolLocation={school.location} schoolName={school.name} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
