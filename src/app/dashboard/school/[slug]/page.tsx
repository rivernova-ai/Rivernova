'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';
import { stripMarkdown, cleanText, calculateMatchScore, getMatchScoreColor, getMatchScoreLabel } from '@/lib/utils';
import { ArrowLeft, MapPin, GraduationCap, DollarSign, TrendingUp, Award, Briefcase, Zap, Calendar, Heart, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolAdvisor } from '@/components/chat/SchoolAdvisor';

export default function SchoolProfile() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const slug = params.slug as string;
  const decodedName = decodeURIComponent(slug);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const supabase = createClient();
        
        // Get user profile for match scoring
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        // Get match
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .eq('user_id', user.id);

        if (matches) {
          const match = matches.find(m => cleanText(m.school_name) === decodedName);
          if (match) {
            const schoolData = match.school_data || {};
            
            // Calculate match score
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

            // Extract numeric values
            const extractPct = (s: string) => { const m = s?.match(/(\d+\.?\d*)/); return m ? parseFloat(m[1]) : 0; };
            const extractNum = (s: string) => { const m = s?.match(/\$?([\d,]+)/); return m ? parseInt(m[1].replace(/,/g, '')) : 0; };

            setSchool({
              id: match.id,
              name: cleanText(match.school_name),
              location: cleanText(schoolData.location || ''),
              program: cleanText(schoolData.programName || ''),
              tuition: cleanText(schoolData.tuition || ''),
              tuitionNum: extractNum(schoolData.tuition),
              netPrice: cleanText(schoolData.netPrice || ''),
              gpaMinimum: cleanText(schoolData.gpaMinimum ? String(schoolData.gpaMinimum) : ''),
              highlights: (schoolData.highlights || []).map((h: string) => cleanText(h)),
              admissionRate: cleanText(schoolData.admissionRate || ''),
              admissionNum: extractPct(schoolData.admissionRate),
              graduationRate: cleanText(schoolData.graduationRate || ''),
              graduationNum: extractPct(schoolData.graduationRate),
              ranking: cleanText(schoolData.ranking || ''),
              employmentRate: cleanText(schoolData.employmentRate || ''),
              employmentNum: extractPct(schoolData.employmentRate),
              avgSalary: cleanText(schoolData.avgSalary || ''),
              scholarships: cleanText(schoolData.scholarships || ''),
              deadline: cleanText(schoolData.deadline || ''),
              matchScore,
              favorited: match.favorited
            });
            
            setIsFavorite(match.favorited || false);
          }
        }
      } catch (error) {
        console.error('Error fetching school details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, decodedName, router]);

  const toggleFavorite = async () => {
    if (!school || !user) return;
    
    const newFavStatus = !isFavorite;
    setIsFavorite(newFavStatus);
    
    const supabase = createClient();
    await supabase.from('matches').update({ favorited: newFavStatus }).eq('id', school.id);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl text-white">School not found</h1>
        <Button onClick={() => router.back()} variant="outline" className="border-white/10 text-white hover:bg-white/5">
          Go Back
        </Button>
      </div>
    );
  }

  // Ring Calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (school.matchScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* ── Navbar ── */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-full transition-all ${
                isFavorite
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Image Background ── */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-24 relative z-10">
        
        {/* ── Hero Section ── */}
        <div className="flex flex-col md:flex-row gap-12 items-end justify-between pt-10">
          <div className="space-y-6 flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90 uppercase tracking-widest font-medium shadow-2xl">
              <MapPin className="w-4 h-4" />
              {school.location || 'Location Unknown'}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter leading-none text-white drop-shadow-2xl">
              {school.name}
            </h1>
            
            <div className="flex items-center gap-3 text-xl md:text-2xl text-white/80 font-light drop-shadow-lg">
              <GraduationCap className="w-6 h-6" />
              {school.program || 'General Admission'}
            </div>
          </div>

          {/* Activity Ring (Match Score) */}
          <div className="flex-shrink-0 relative flex flex-col items-center bg-black/40 p-8 rounded-[3rem] backdrop-blur-2xl border border-white/10 shadow-2xl">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <filter id="glowScore" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke={school.matchScore >= 80 ? '#4ade80' : school.matchScore >= 60 ? '#facc15' : '#f87171'}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#glowScore)"
                  style={{
                    strokeDasharray: 2 * Math.PI * 80,
                    strokeDashoffset: 2 * Math.PI * 80 - (school.matchScore / 100) * (2 * Math.PI * 80),
                    transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-semibold tracking-tighter text-white">{school.matchScore}</span>
                <span className="text-sm text-white/60 uppercase tracking-widest mt-1 font-medium">Match</span>
              </div>
            </div>
            <div className="mt-6 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold tracking-wider uppercase text-white shadow-lg backdrop-blur-md">
              {getMatchScoreLabel(school.matchScore)}
            </div>
          </div>
        </div>

        {/* ── AI Consultant Analysis (Visual Chart) ── */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-3xl font-light tracking-tight text-white">AI Consultant Analysis</h2>
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              Real-time Profile Synthesis
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 bg-white/[0.01] border border-white/[0.05] p-8 md:p-12 rounded-[2.5rem]">
            {/* Logic for Strengths/Weaknesses */}
            {(() => {
              const strengths = [];
              const weaknesses = [];
              
              if (school.tuitionNum) {
                if (school.tuitionNum < 25000) strengths.push({ label: 'High Affordability', pct: 90 });
                else if (school.tuitionNum > 50000) weaknesses.push({ label: 'High Cost Barrier', pct: 85 });
              }
              if (school.admissionNum) {
                if (school.admissionNum < 20) weaknesses.push({ label: 'Highly Competitive', pct: 95 });
                else if (school.admissionNum > 60) strengths.push({ label: 'Accessible Admission', pct: 80 });
              }
              if (school.graduationNum) {
                if (school.graduationNum > 85) strengths.push({ label: 'Excellent Outcomes', pct: 95 });
                else if (school.graduationNum < 50) weaknesses.push({ label: 'Low Graduation Rate', pct: 70 });
              }
              if (school.employmentNum) {
                if (school.employmentNum > 90) strengths.push({ label: 'Strong Employment Base', pct: 98 });
              }
              if (school.matchScore >= 80) strengths.push({ label: 'Core Profile Alignment', pct: school.matchScore });
              else if (school.matchScore < 60) weaknesses.push({ label: 'Profile Mismatch', pct: 100 - school.matchScore });

              if (strengths.length === 0) strengths.push({ label: 'Academic Prestige', pct: 75 });
              if (weaknesses.length === 0) weaknesses.push({ label: 'Program Intensity', pct: 60 });

              return (
                <>
                  <div className="space-y-8">
                    <h3 className="text-xl font-medium text-emerald-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> Key Strengths
                    </h3>
                    <div className="space-y-6">
                      {strengths.map((s, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-white/80">{s.label}</span>
                            <span className="text-emerald-400/80">Impact</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full" style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h3 className="text-xl font-medium text-rose-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 transform rotate-180" /> Risk Factors
                    </h3>
                    <div className="space-y-6">
                      {weaknesses.map((w, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-white/80">{w.label}</span>
                            <span className="text-rose-400/80">Severity</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-rose-500/50 to-rose-400 rounded-full" style={{ width: `${w.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ── Key Metrics Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.04] transition-colors">
            <DollarSign className="w-6 h-6 text-emerald-400 mb-4" />
            <p className="text-sm text-white/40 mb-1">Estimated Tuition</p>
            <p className="text-2xl font-semibold">{school.tuition || 'N/A'}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.04] transition-colors">
            <TrendingUp className="w-6 h-6 text-indigo-400 mb-4" />
            <p className="text-sm text-white/40 mb-1">Acceptance Rate</p>
            <p className="text-2xl font-semibold">{school.admissionRate || 'N/A'}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.04] transition-colors">
            <Award className="w-6 h-6 text-purple-400 mb-4" />
            <p className="text-sm text-white/40 mb-1">Graduation Rate</p>
            <p className="text-2xl font-semibold">{school.graduationRate || 'N/A'}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.04] transition-colors">
            <Briefcase className="w-6 h-6 text-amber-400 mb-4" />
            <p className="text-sm text-white/40 mb-1">Employment Rate</p>
            <p className="text-2xl font-semibold">{school.employmentRate || 'N/A'}</p>
          </div>
        </div>

        {/* ── REAL-TIME AI COUNSELOR SECTION ── */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-white">Strategic Intelligence</h2>
              <p className="text-white/40 max-w-xl">
                Consult with our AI Advisor to get real-time briefings on campus culture, city safety, and local student life. 
                <span className="text-indigo-400 font-medium"> Powered by real-time web-scouring.</span>
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
               <Zap className="w-5 h-5 animate-pulse" />
               <span className="text-sm font-black uppercase tracking-widest">Active Search</span>
            </div>
          </div>
          
          <SchoolAdvisor 
            schoolName={school.name} 
            location={school.location} 
            program={school.program} 
          />
        </div>

        {/* ── Detailed Breakdown ── */}
        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-12">
            {/* Why it's a match */}
            <div className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight">Why It's a Match</h2>
              <div className="grid gap-3">
                {school.highlights.length > 0 ? school.highlights.map((highlight: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="mt-0.5 bg-indigo-500/20 p-1 rounded-full text-indigo-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-white/80 leading-relaxed">{highlight}</p>
                  </div>
                )) : (
                  <p className="text-white/40 italic">No specific highlights extracted.</p>
                )}
              </div>
            </div>

            {/* Program Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight">Program Details</h2>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-white/40 mb-1">Intended Major</p>
                    <p className="text-lg font-medium">{school.program || 'Undeclared'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Minimum GPA</p>
                    <p className="text-lg font-medium">{school.gpaMinimum || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Application Deadline</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      {school.deadline || 'Rolling'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/40 mb-1">Ranking</p>
                    <p className="text-lg font-medium">{school.ranking || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight">Outcomes & Affordability</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden">
                <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/10" />
                <div className="relative">
                  <p className="text-sm text-indigo-300/80 mb-2 font-medium uppercase tracking-widest">Average Salary</p>
                  <p className="text-4xl font-semibold text-white tracking-tight">{school.avgSalary || 'N/A'}</p>
                  <p className="text-sm text-white/50 mt-2">Post-graduation median</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-sm text-white/40 mb-2 font-medium uppercase tracking-widest">Net Price</p>
                <p className="text-2xl font-medium tracking-tight">{school.netPrice || school.tuition || 'N/A'}</p>
                <p className="text-xs text-white/40 mt-1">Average after aid</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-sm text-white/40 mb-3 font-medium uppercase tracking-widest">Scholarships</p>
                {school.scholarships ? (
                  <p className="text-white/80 text-sm leading-relaxed">{school.scholarships}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">No specific scholarship data.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
