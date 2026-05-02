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
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-light text-white">
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

            {/* School Cards */}
            <div className="space-y-6">
              {filteredResults.map((school, idx) => (
                <div key={idx} className="group">
                  <div 
                    onClick={() => router.push('/dashboard/school/' + encodeURIComponent(cleanText(school.name)))}
                    className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 space-y-6 cursor-pointer ${isSchoolSelected(school.name) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10'}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2 min-w-0">
                        <h3 className="text-xl md:text-2xl font-light text-white group-hover:text-indigo-300 transition-colors truncate">
                          {cleanText(school.name)}
                        </h3>
                        {school.location && (
                          <div className="flex items-center gap-2 text-white/50 text-sm font-light">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{cleanText(school.location)}</span>
                          </div>
                        )}
                      </div>

                      {/* Right side: tuition + match score + actions */}
                      <div className="flex items-start gap-3 flex-shrink-0">
                        {school.tuition && (
                          <div className="text-right">
                            <p className="text-xl font-light bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                              {cleanText(school.tuition)}
                            </p>
                            <p className="text-xs text-white/30 font-light mt-0.5">per year</p>
                          </div>
                        )}
                        {school.matchScore !== undefined && (
                          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 flex-shrink-0 ${getMatchScoreColor(school.matchScore)}`}>
                            <div className="text-lg font-black leading-none">{school.matchScore}%</div>
                             <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-0.5">{getMatchScoreLabel(school.matchScore)}</div>
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoiModal({ isOpen: true, school: school });
                            }}
                            className="group relative h-10 px-5 rounded-full overflow-hidden bg-[#050505] border border-white/10 transition-all duration-700 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                          >
                            {/* Luminous Animated Edge */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                            
                            <div className="relative flex items-center gap-2.5">
                              <div className="relative">
                                <Zap className="w-3.5 h-3.5 text-white/40 group-hover:text-indigo-400 transition-colors duration-500" />
                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-all duration-500">
                                ROI Intelligence
                              </span>
                            </div>

                            {/* Bottom Glow */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-indigo-500 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </Button>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(school); }}
                              className={`p-2 rounded-lg transition-all flex-1 flex items-center justify-center ${
                                favorites.has(cleanText(school.name))
                                  ? 'bg-pink-500/20 text-pink-400'
                                  : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${favorites.has(cleanText(school.name)) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCompare(school); }}
                              className={`p-2 rounded-lg transition-all flex-1 flex items-center justify-center ${
                                isSchoolSelected(school.name)
                                  ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40'
                                  : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                              }`}
                              title={isSchoolSelected(school.name) ? 'Remove from comparison' : 'Add to comparison'}
                            >
                              {isSchoolSelected(school.name) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Program Badge */}
                    {school.program && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-light">
                        <GraduationCap className="w-4 h-4" />
                        {cleanText(school.program)}
                      </div>
                    )}

                    {/* Stats */}
                    {(school.admissionRate || school.ranking || school.employmentRate || school.avgSalary) && (
                      <div className="flex flex-wrap gap-3">
                        {school.admissionRate && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-light">
                            <TrendingUp className="w-4 h-4" />
                            {cleanText(school.admissionRate)}
                          </div>
                        )}
                        {school.ranking && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-light">
                            <Star className="w-4 h-4" />
                            {cleanText(school.ranking)}
                          </div>
                        )}
                        {school.employmentRate && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-light">
                            <Briefcase className="w-4 h-4" />
                            {cleanText(school.employmentRate)}
                          </div>
                        )}
                        {school.avgSalary && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-light">
                            <Zap className="w-4 h-4" />
                            {cleanText(school.avgSalary)}
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
                            <span>{cleanText(highlight)}</span>
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
                            <span>{cleanText(school.scholarships)}</span>
                          </div>
                        )}
                        {school.deadline && (
                          <div className="flex items-center gap-2 text-white/50">
                            <Calendar className="w-4 h-4 text-pink-400/60" />
                            <span>{cleanText(school.deadline)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Bar */}
      <ComparisonBar
        selectedSchools={comparison.schools}
        onViewComparison={() => setComparison(prev => ({ ...prev, isOpen: true }))}
        onRemoveSchool={removeFromComparison}
      />

      {/* ROI Modal */}
      {roiModal.isOpen && (
        <ROIReportModal
          school={roiModal.school}
          userProfile={profile}
          onClose={() => setRoiModal({ isOpen: false, school: null })}
        />
      )}

      {/* Comparison Modal */}
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
