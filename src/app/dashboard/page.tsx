'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, Search, TrendingUp, MapPin, DollarSign, GraduationCap, Award, Briefcase, Calendar, Heart, Star, Zap, ArrowRight, Plus, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { Button } from '@/components/ui/button';
import MatchFilters from '@/components/matches/MatchFilters';
import { calculateMatchScore, getMatchScoreColor, getMatchScoreLabel, isValidMatchScore, stripMarkdown, cleanText } from '@/lib/utils';
import { parseSchoolJSON, validateSchoolData } from '@/lib/schoolParser';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { ComparisonModal } from '@/components/comparison/ComparisonModal';
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
          
          return {
            id: match.id,
            name: stripMarkdown(match.school_name),
            location: stripMarkdown(schoolData.location || ''),
            program: stripMarkdown(schoolData.programName || ''),
            tuition: stripMarkdown(schoolData.tuition || ''),
            netPrice: stripMarkdown(schoolData.netPrice || ''),
            highlights: (schoolData.highlights || []).map((h: string) => stripMarkdown(h)),
            admissionRate: schoolData.admissionRate || '',
            graduationRate: schoolData.graduationRate || '',
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
    await supabase.from('profiles').update({ mode: newMode }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, mode: newMode } : null);
  };

  const searchSchools = async () => {
    if (!profile) return;
    setSearching(true);
    setResults([]);
    setFilteredResults([]);

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
      if (!response.ok) throw new Error(data.error || 'Search failed');

      if (data.schools && Array.isArray(data.schools)) {
        const parsed = parseSchoolJSON(data.schools);
        const validatedSchools = validateSchoolData(parsed);
        
        const schoolsWithScores = validatedSchools
          .map(school => {
            const tuitionNum = parseInt((school.tuition || '').replace(/[^0-9]/g, '') || '0');
            const matchScore = calculateMatchScore({
              userGPA: profile?.academic_background?.gpa ? parseFloat(profile.academic_background.gpa) : undefined,
              userBudgetMax: profile?.budget?.max ? Number(profile.budget.max) : undefined,
              userMajor: profile?.academic_background?.major || '',
              schoolTuition: tuitionNum || undefined,
              schoolProgram: school.program || '',
            });
            return { ...school, matchScore };
          })
          .filter(school => isValidMatchScore(school.matchScore || 0));
        
        const sorted = schoolsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setResults(sorted as SchoolMatch[]);
        setFilteredResults(sorted as SchoolMatch[]);

        if (sorted.length > 0) {
          const supabase = createClient();
          const matchesToSave = sorted.map(school => ({
            user_id: user!.id,
            school_name: school.name,
            school_data: { ...school },
            success_probability: 75,
            reasoning: 'Strategic match',
          }));
          await supabase.from('matches').insert(matchesToSave);
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleFavorite = async (school: SchoolMatch) => {
    const supabase = createClient();
    const schoolName = cleanText(school.name);
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(schoolName)) {
        next.delete(schoolName);
        supabase.from('matches').update({ favorited: false }).eq('user_id', user!.id).eq('school_name', schoolName).then();
      } else {
        next.add(schoolName);
        supabase.from('matches').update({ favorited: true }).eq('user_id', user!.id).eq('school_name', schoolName).then();
      }
      return next;
    });
  };

  const toggleCompare = (school: SchoolMatch) => {
    setComparison(prev => {
      const isSelected = prev.schools.some(s => s.name === school.name);
      if (isSelected) return { ...prev, schools: prev.schools.filter(s => s.name !== school.name) };
      if (prev.schools.length >= 5) return prev;
      return { ...prev, schools: [...prev.schools, school as ComparisonSchool] };
    });
  };

  const isSchoolSelected = (name: string) => comparison.schools.some(s => s.name === name);

  const handleFilterChange = (newFilters: any) => {
    const filtered = results.filter((school) => {
      const tuition = parseInt(school.tuition?.replace(/[^0-9]/g, '') || '0');
      if (newFilters.budgetRange !== 'all') {
        if (newFilters.budgetRange === 'under30k' && tuition >= 30000) return false;
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

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      </div>

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
          </div>
          <div className="flex items-center gap-6">
            <ModeToggle currentMode={profile?.mode || 'domestic'} onChange={handleModeChange} />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Engine v2.0</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.9] text-white">
                Match <br /><span className="text-white/20 italic">Intelligence.</span>
              </h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] backdrop-blur-md">
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Active Focus</p>
                <p className="text-sm font-bold text-white/60">{profile?.academic_background?.major || 'General'}</p>
              </div>
              <Button onClick={searchSchools} disabled={searching} className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]">
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Synthesis'}
              </Button>
            </div>

            {searching ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
                <Loader2 className="w-20 h-20 text-indigo-400 animate-spin stroke-[1px]" />
                <p className="text-2xl font-light text-white/60 italic text-center">Synthesizing global datasets...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <MatchFilters onFilterChange={handleFilterChange} />
                <div className="space-y-6">
                  {filteredResults.map((school, idx) => (
                    <div key={idx} className="group">
                      <div 
                        onClick={() => router.push('/dashboard/school/' + encodeURIComponent(cleanText(school.name)))}
                        className={`bg-white/[0.02] border rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer ${isSchoolSelected(school.name) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/[0.06]'}`}
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-4">
                            <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">{cleanText(school.name)}</h3>
                            <div className="flex gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{cleanText(school.location)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-2xl font-black text-white tracking-tighter">{cleanText(school.tuition)}</p>
                              <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Annual Cost</p>
                            </div>
                            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-3xl border ${getMatchScoreColor(school.matchScore || 0)} bg-black/40`}>
                              <div className="text-2xl font-black">{school.matchScore}%</div>
                              <div className="text-[8px] font-black uppercase opacity-40">{getMatchScoreLabel(school.matchScore || 0)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-white/5">
                           <div className="flex items-center gap-3">
                              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setRoiModal({ isOpen: true, school }); }} className="h-11 px-6 rounded-xl bg-white/[0.03] border-white/10 text-[10px] font-black uppercase tracking-widest">ROI Intelligence</Button>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(school); }} className={`w-11 h-11 rounded-xl flex items-center justify-center border ${favorites.has(cleanText(school.name)) ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'border-white/10 text-white/20'}`}><Heart className="w-5 h-5" /></button>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); toggleCompare(school); }} className={`h-11 px-6 rounded-xl border flex items-center gap-3 ${isSchoolSelected(school.name) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'border-white/10 text-white/20'}`}>
                             {isSchoolSelected(school.name) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">Compare</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-32 text-center space-y-8 animate-in fade-in duration-1000">
                <Target className="w-16 h-16 text-white/10 mx-auto" />
                <h2 className="text-3xl font-bold text-white">Analysis Required.</h2>
                <Button onClick={searchSchools} className="h-14 px-12 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]">Initialize Search</Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-12">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl space-y-10">
                <h3 className="text-2xl font-bold text-white">Milestones</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                      <div><p className="text-xs font-bold text-white/80">Profile Completed</p><p className="text-[10px] text-white/30 uppercase font-black mt-1">Verified</p></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <ComparisonBar
        selectedSchools={comparison.schools}
        onViewComparison={() => setComparison(prev => ({ ...prev, isOpen: true }))}
        onRemoveSchool={(name) => setComparison(prev => ({ ...prev, schools: prev.schools.filter(s => s.name !== name) }))}
      />

      {roiModal.isOpen && (
        <ROIReportModal school={roiModal.school} userProfile={profile} onClose={() => setRoiModal({ isOpen: false, school: null })} />
      )}

      {comparison.isOpen && profile && (
        <ComparisonModal schools={comparison.schools} userProfile={profile} onClose={() => setComparison(prev => ({ ...prev, isOpen: false }))} />
      )}
    </div>
  );
}
