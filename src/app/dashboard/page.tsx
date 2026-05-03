'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, Search, TrendingUp, MapPin, DollarSign, GraduationCap, Award, Briefcase, Calendar, Heart, Star, Zap, ArrowRight, Plus, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { Button } from '@/components/ui/button';
import MatchFilters from '@/components/matches/MatchFilters';
import MapDistance from '@/components/matches/MapDistance';
import { calculateMatchScore, getMatchScoreColor, getMatchScoreLabel, isValidMatchScore, stripMarkdown, cleanText } from '@/lib/utils';
import { parseSchoolJSON, validateSchoolData } from '@/lib/schoolParser';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { ComparisonModal } from '@/components/comparison/ComparisonModal';
import { DeadlinesTracker } from '@/components/dashboard/DeadlinesTracker';
import { ComparisonSchool } from '@/lib/comparison';
import { ROIReportModal } from '@/components/dashboard/ROIReportModal';

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
  netPrice?: string;
  admissionRate?: string;
  graduationRate?: string;
  gpaMinimum?: string;
  ranking?: string;
  employmentRate?: string;
  avgSalary?: string;
  scholarships?: string;
  deadline?: string;
  matchScore?: number;
}

interface ComparisonState {
  isOpen: boolean;
  schools: ComparisonSchool[];
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    budgetRange: 'all',
    location: 'all',
    successRate: 'all',
    programType: 'all',
  });
  const [comparison, setComparison] = useState<ComparisonState>({
    isOpen: false,
    schools: [],
  });
  const [roiModal, setRoiModal] = useState<{ isOpen: boolean; school: any | null }>({
    isOpen: false,
    school: null,
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
        const formattedMatches = matchesData.map(match => {
          const schoolData = match.school_data || {};
          // ALWAYS calculate match score using our rigorous rubric
          const tuitionStr = schoolData.tuition || '';
          const netPriceStr = schoolData.netPrice || '';
          const acceptanceStr = schoolData.admissionRate || '';
          const graduationStr = schoolData.graduationRate || '';
          
          const matchScore = calculateMatchScore({
            userGPA: profileData?.academic_background?.gpa ? parseFloat(profileData.academic_background.gpa) : undefined,
            userBudgetMax: profileData?.budget?.max ? Number(profileData.budget.max) : undefined,
            userMajor: profileData?.academic_background?.major || '',
            schoolMinGPA: schoolData.gpaMinimum ? parseFloat(schoolData.gpaMinimum) : undefined,
            schoolNetPrice: netPriceStr ? parseInt(netPriceStr.replace(/[^0-9]/g, '') || '0') : undefined,
            schoolTuition: parseInt((tuitionStr || '').replace(/[^0-9]/g, '') || '0'),
            schoolAcceptanceRate: acceptanceStr ? parseFloat(acceptanceStr.replace(/[^0-9.]/g, '') || '0') : undefined,
            schoolGraduationRate: graduationStr ? parseFloat(graduationStr.replace(/[^0-9.]/g, '') || '0') : undefined,
            schoolProgram: schoolData.programName || '',
          });
          
          const extractPercentStr = (text: string) => {
            if (!text) return '';
            const match = text.match(/(\d+\.?\d*)\s*%/);
            return match ? `${parseFloat(match[1])}%` : '';
          };

          return {
            id: match.id,
            name: stripMarkdown(match.school_name),
            location: stripMarkdown(schoolData.location || ''),
            program: stripMarkdown(schoolData.programName || ''),
            tuition: stripMarkdown(schoolData.tuition || ''),
            netPrice: stripMarkdown(schoolData.netPrice || ''),
            gpaMinimum: stripMarkdown(schoolData.gpaMinimum ? String(schoolData.gpaMinimum) : ''),
            highlights: (schoolData.highlights || []).map((h: string) => stripMarkdown(h)),
            admissionRate: extractPercentStr(schoolData.admissionRate || ''),
            graduationRate: extractPercentStr(schoolData.graduationRate || ''),
            ranking: stripMarkdown(schoolData.ranking || ''),
            employmentRate: extractPercentStr(schoolData.employmentRate || ''),
            avgSalary: stripMarkdown(schoolData.avgSalary || ''),
            scholarships: stripMarkdown(schoolData.scholarships || ''),
            deadline: stripMarkdown(schoolData.deadline || ''),
            matchScore,
          };
        });
        
        const initialFavorites = new Set<string>();
        matchesData.forEach(match => {
          if (match.favorited) initialFavorites.add(stripMarkdown(match.school_name));
        });
        setFavorites(initialFavorites);

        const filtered = formattedMatches
          .filter(m => isValidMatchScore(m.matchScore || 0))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setResults(filtered);
        setFilteredResults(filtered);
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

      // Primary path: parse structured JSON from API
      let validatedSchools;
      if (data.schools && Array.isArray(data.schools)) {
        // New JSON path — API returns { schools: [...] }
        const parsed = parseSchoolJSON(data.schools);
        validatedSchools = validateSchoolData(parsed);
        setRawResults(JSON.stringify(data.schools, null, 2));
      } else {
        throw new Error('AI returned an invalid response format. Please try again.');
      }

      if (validatedSchools.length === 0) {
        throw new Error('No valid schools found. The AI response did not contain recognizable school data. Please try again.');
      }
      
      // Add match scores, filter below-threshold schools
      const schoolsWithScores = validatedSchools
        .map(school => {
          // Ignore AI-provided match score, force recalculation based on strict rubric
          const netPriceNum = school.netPrice ? parseInt(school.netPrice.replace(/[^0-9]/g, '') || '0') : 0;
          const tuitionNum = parseInt((school.tuition || '').replace(/[^0-9]/g, '') || '0');
          const gpaMin = school.gpaMinimum ? parseFloat(school.gpaMinimum) : undefined;
          const acceptanceNum = school.admissionRate ? parseFloat(school.admissionRate.replace(/[^0-9.]/g, '') || '0') : undefined;
          const graduationNum = school.graduationRate ? parseFloat(school.graduationRate.replace(/[^0-9.]/g, '') || '0') : undefined;
          const matchScore = calculateMatchScore({
            userGPA: profile?.academic_background?.gpa ? parseFloat(profile.academic_background.gpa) : undefined,
            userBudgetMax: profile?.budget?.max ? Number(profile.budget.max) : undefined,
            userMajor: profile?.academic_background?.major || '',
            schoolMinGPA: gpaMin,
            schoolNetPrice: netPriceNum || undefined,
            schoolTuition: tuitionNum || undefined,
            schoolAcceptanceRate: acceptanceNum || undefined,
            schoolGraduationRate: graduationNum || undefined,
            schoolProgram: school.program || '',
          });
          return { ...school, matchScore };
        })
        .filter(school => isValidMatchScore(school.matchScore || 0));
      
      const sortedSchools = schoolsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setResults(sortedSchools);
      setFilteredResults(sortedSchools);

      if (sortedSchools.length > 0) {
        const supabase = createClient();
        const matchesToSave = sortedSchools.map(school => ({
          user_id: user!.id,
          school_name: school.name,
          school_data: {
            location: school.location || '',
            programName: school.program || '',
            tuition: school.tuition || '',
            netPrice: school.netPrice || '',
            highlights: school.highlights || [],
            admissionRate: school.admissionRate || '',
            graduationRate: school.graduationRate || '',
            gpaMinimum: school.gpaMinimum || '',
            ranking: school.ranking || '',
            employmentRate: school.employmentRate || '',
            avgSalary: school.avgSalary || '',
            scholarships: school.scholarships || '',
            deadline: school.deadline || '',
            matchScore: school.matchScore || 0,
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

  const toggleFavorite = async (school: SchoolMatch) => {
    const supabase = createClient();
    const schoolName = cleanText(school.name);
    
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(schoolName)) {
        newFavorites.delete(schoolName);
        supabase.from('matches').update({ favorited: false }).eq('user_id', user!.id).eq('school_name', schoolName).then();
        supabase.from('user_deadlines').delete().eq('user_id', user!.id).eq('school_name', schoolName).then();
      } else {
        newFavorites.add(schoolName);
        supabase.from('matches').update({ favorited: true }).eq('user_id', user!.id).eq('school_name', schoolName).then();
        supabase.from('user_deadlines').insert({
          user_id: user!.id,
          school_name: schoolName,
          application_type: 'Regular Decision',
          deadline_date: null,
        }).then();
      }
      return newFavorites;
    });
  };

  const toggleCompare = (school: SchoolMatch) => {
    setComparison(prev => {
      const isSelected = prev.schools.some(s => s.name === school.name);
      if (isSelected) {
        return {
          ...prev,
          schools: prev.schools.filter(s => s.name !== school.name),
        };
      }
      if (prev.schools.length >= 5) {
        alert('You can compare up to 5 schools at a time');
        return prev;
      }
      return {
        ...prev,
        schools: [...prev.schools, school as ComparisonSchool],
      };
    });
  };

  const removeFromComparison = (schoolName: string) => {
    setComparison(prev => ({
      ...prev,
      schools: prev.schools.filter(s => s.name !== schoolName),
    }));
  };

  const isSchoolSelected = (schoolName: string) => {
    return comparison.schools.some(s => s.name === schoolName);
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
      {/* Header */}
      <div className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
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
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Profile Summary */}
        <div className="mb-12">
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

        {/* My Deadlines Tracker 
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-white">My Deadlines</h2>
            <div className="text-sm text-white/50 font-light">Application Tracker</div>
          </div>
          <DeadlinesTracker />
        </div>
        */}

        {/* Search State */}
        {!searching && results.length === 0 && (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                Discover your<br />
                <span className="font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">perfect match</span>
              </h2>
              <p className="text-lg text-white/50 font-light max-w-2xl mx-auto">
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
          <div className="space-y-8">
            {/* Results Header */}
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ── Deep Space Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-purple-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* ── Luminous Navbar ── */}
      <nav className="sticky top-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-white to-white/40 rounded-xl flex items-center justify-center shadow-2xl border border-white/10">
                  <Zap className="w-5 h-5 text-black" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">Rivernova</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              <a href="/dashboard" className="text-white hover:text-white transition-colors">Intelligence</a>
              <a href="/dashboard/comparison" className="hover:text-white transition-colors">Comparison</a>
              <a href="/dashboard/applications" className="hover:text-white transition-colors">Applications</a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ModeToggle currentMode={profile?.mode || 'domestic'} onModeChange={handleModeChange} />
            <div className="h-10 w-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/10 transition-all">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ── LEFT: MAIN ENGINE ── */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* 1. Header & Controls */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Accredited Data Engine v2.0</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.9] text-white">
                    Match <br />
                    <span className="text-white/20 italic">Intelligence.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/40 max-w-xl font-light leading-relaxed">
                    Precision matching engine synthesized {results.length} schools across the global education market.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-8 bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Active Focus</p>
                    <p className="text-sm font-bold text-white/60">{profile?.academic_background?.major || 'General Education'}</p>
                  </div>
                </div>
                <Button 
                  onClick={searchSchools} 
                  disabled={searching}
                  className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Synthesis'}
                </Button>
              </div>
            </div>

            {/* 2. States (Searching / Results / Empty) */}
            {searching ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse rounded-full" />
                  <Loader2 className="relative w-20 h-20 text-indigo-400 animate-spin stroke-[1px]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em]">Neural Search Active</p>
                  <p className="text-2xl font-light text-white/60 italic">Synthesizing global academic datasets...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Strategic Matches</h2>
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{filteredResults.length} Verified Institutions</span>
                </div>
                
                <MatchFilters onFilterChange={handleFilterChange} />

                <div className="space-y-6">
                  {filteredResults.map((school, idx) => (
                    <div key={idx} className="group">
                      <div 
                        onClick={() => router.push('/dashboard/school/' + encodeURIComponent(cleanText(school.name)))}
                        className={`bg-white/[0.02] border rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer ${isSchoolSelected(school.name) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/[0.06]'}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                          <div className="flex-1 space-y-4">
                            <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                              {cleanText(school.name)}
                            </h3>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-widest">
                                <MapPin className="w-3.5 h-3.5" />
                                {cleanText(school.location)}
                              </div>
                              <div className="flex items-center gap-2 text-indigo-400/60 text-xs font-bold uppercase tracking-widest">
                                <GraduationCap className="w-3.5 h-3.5" />
                                {cleanText(school.program)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-2xl font-black text-white tracking-tighter italic">
                                {cleanText(school.tuition)}
                              </p>
                              <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">Est. Annual Cost</p>
                            </div>
                            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-3xl border ${getMatchScoreColor(school.matchScore || 0)} bg-black/40 backdrop-blur-xl shadow-2xl`}>
                              <div className="text-2xl font-black">{school.matchScore}%</div>
                              <div className="text-[8px] font-black uppercase tracking-widest opacity-40">{getMatchScoreLabel(school.matchScore || 0)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-8 mt-8 border-t border-white/5">
                           <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); setRoiModal({ isOpen: true, school }); }}
                                className="h-11 px-6 rounded-xl bg-white/[0.03] border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group/btn"
                              >
                                <Zap className="w-4 h-4 text-indigo-400 mr-2 group-hover/btn:animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">ROI Intelligence</span>
                              </Button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(school); }}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${favorites.has(cleanText(school.name)) ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'border-white/10 text-white/20 hover:text-white hover:border-white/30'}`}
                              >
                                <Heart className={`w-5 h-5 ${favorites.has(cleanText(school.name)) ? 'fill-current' : ''}`} />
                              </button>
                           </div>
                           <button
                             onClick={(e) => { e.stopPropagation(); toggleCompare(school); }}
                             className={`h-11 px-6 rounded-xl border flex items-center gap-3 transition-all ${isSchoolSelected(school.name) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'border-white/10 text-white/20 hover:text-white hover:border-white/30'}`}
                           >
                             {isSchoolSelected(school.name) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">Add to Comparison</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-32 text-center space-y-8 animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] flex items-center justify-center mx-auto">
                  <Target className="w-10 h-10 text-white/10" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Analysis Required.</h2>
                  <p className="text-white/30 max-w-xs mx-auto text-sm leading-relaxed">Execute a synthesis protocol to generate verified matches based on your strategic profile.</p>
                </div>
                <Button onClick={searchSchools} className="h-14 px-12 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]">Initialize Search</Button>
              </div>
            )}
          </div>

          {/* ── RIGHT: STRATEGIC SIDEBAR ── */}
          <div className="lg:col-span-4 space-y-12">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl space-y-10">
                <div className="space-y-2">
                   <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">Operational Readiness</p>
                   <h3 className="text-2xl font-bold text-white">Milestones</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                         <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white/80">Profile Completed</p>
                         <p className="text-[10px] text-white/30 uppercase font-black mt-1">Status: Verified</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/20">
                         <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white/40">F-1 Visa Document</p>
                         <p className="text-[10px] text-white/20 uppercase font-black mt-1">Status: Pending Analysis</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <p className="text-[9px] text-white/20 leading-relaxed font-medium">
                      Rivernova OS monitors global admission deadlines in real-time. Connect your calendar to enable strategic alerts.
                   </p>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                <div className="flex items-center gap-3">
                   <Zap className="w-5 h-5 text-indigo-400" />
                   <p className="text-xs font-black uppercase tracking-widest text-indigo-300">Quick Support</p>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">Need a strategic briefing on your matches? Our AI Counselors are active 24/7.</p>
                <Button variant="outline" className="w-full h-11 rounded-xl border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10">Consult Advisor</Button>
             </div>
          </div>
        </div>
      </main>

      {/* ── MODALS ── */}
      <ComparisonBar
        selectedSchools={comparison.schools}
        onViewComparison={() => setComparison(prev => ({ ...prev, isOpen: true }))}
        onRemoveSchool={removeFromComparison}
      />

      {roiModal.isOpen && (
        <ROIReportModal
          school={roiModal.school}
          userProfile={profile}
          onClose={() => setRoiModal({ isOpen: false, school: null })}
        />
      )}

      {comparison.isOpen && profile && (
        <ComparisonModal
          schools={comparison.schools}
          userProfile={profile}
          onClose={() => setComparison(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
