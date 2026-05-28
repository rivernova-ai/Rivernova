'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';
import { cleanText, calculateMatchScore, getMatchScoreLabel } from '@/lib/utils';
import {
  ArrowLeft, MapPin, GraduationCap, DollarSign, TrendingUp, Award,
  Calendar, Heart, ShieldCheck, CheckCircle2,
  Sparkles, ChevronRight, BarChart2, Star, Building2,
  AlertTriangle, ChevronDown, Globe, Home,
} from 'lucide-react';
import { SchoolAdvisor } from '@/components/chat/SchoolAdvisor';

const TIER_CONFIG = {
  safety: { label: 'Safety',  icon: '🛡️', color: '#34d399', rgb: '52,211,153',   bg: 'rgba(52,211,153,0.07)',   border: 'rgba(52,211,153,0.22)'  },
  target: { label: 'Target',  icon: '🎯', color: '#fb923c', rgb: '251,146,60',  bg: 'rgba(251,146,60,0.07)',  border: 'rgba(251,146,60,0.22)'  },
  reach:  { label: 'Reach',   icon: '🚀', color: '#a78bfa', rgb: '167,139,250', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.22)' },
} as const;

const APP_STATUS_CONFIG = [
  { value: 'considering', label: 'Considering', color: '#818cf8' },
  { value: 'applying',    label: 'Applying',    color: '#60a5fa' },
  { value: 'submitted',   label: 'Submitted',   color: '#fb923c' },
  { value: 'accepted',    label: 'Accepted',    color: '#34d399' },
  { value: 'waitlisted',  label: 'Waitlisted',  color: '#fbbf24' },
  { value: 'rejected',    label: 'Rejected',    color: '#f87171' },
];

export default function SchoolProfile() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileMode, setProfileMode] = useState<'international' | 'domestic'>('international');
  const [appStatus, setAppStatus] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const slug = params.slug as string;
  const decodedName = decodeURIComponent(slug);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) { router.push('/'); return; }

      try {
        const supabase = createClient();
        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();

        const mode = profileData?.mode === 'domestic' ? 'domestic' : 'international';
        setProfileMode(mode);

        const { data: matches } = await supabase
          .from('matches').select('*').eq('user_id', user.id);

        if (matches) {
          const match = matches.find(m => cleanText(m.school_name) === decodedName);
          if (match) {
            const s = match.school_data || {};

            const matchScore = calculateMatchScore({
              userGPA: profileData?.academic_background?.gpa ? parseFloat(profileData.academic_background.gpa) : undefined,
              userBudgetMax: profileData?.budget?.max ? Number(profileData.budget.max) : undefined,
              userMajor: profileData?.academic_background?.major || '',
              schoolMinGPA: s.gpaMinimum ? parseFloat(s.gpaMinimum) : undefined,
              schoolNetPrice: s.netPrice ? parseInt((s.netPrice || '').replace(/[^0-9]/g, '') || '0') : undefined,
              schoolTuition: parseInt((s.tuition || '').replace(/[^0-9]/g, '') || '0'),
              schoolAcceptanceRate: s.admissionRate ? parseFloat((s.admissionRate || '').replace(/[^0-9.]/g, '') || '0') : undefined,
              schoolGraduationRate: s.graduationRate ? parseFloat((s.graduationRate || '').replace(/[^0-9.]/g, '') || '0') : undefined,
              schoolProgram: s.programName || '',
            });

            const extractPct = (str: string) => { const m = str?.match(/(\d+\.?\d*)/); return m ? parseFloat(m[1]) : 0; };
            const extractNum = (str: string) => { const m = str?.match(/\$?([\d,]+)/); return m ? parseInt(m[1].replace(/,/g, '')) : 0; };

            const rawTier = s.tier;
            const validTier = rawTier && ['safety', 'target', 'reach'].includes(rawTier) ? rawTier : null;
            const derivedTier = matchScore >= 80 ? 'safety' : matchScore >= 65 ? 'target' : 'reach';

            const schoolName = cleanText(match.school_name);
            setSchool({
              id: match.id,
              name: schoolName,
              location: cleanText(s.location || ''),
              program: cleanText(s.programName || ''),
              tuition: cleanText(s.tuition || ''),
              tuitionNum: extractNum(s.tuition),
              netPrice: cleanText(s.netPrice || ''),
              netPriceNum: extractNum(s.netPrice),
              gpaMinimum: cleanText(s.gpaMinimum ? String(s.gpaMinimum) : ''),
              highlights: (s.highlights || []).map((h: string) => cleanText(h)),
              admissionRate: cleanText(s.admissionRate || ''),
              admissionNum: extractPct(s.admissionRate),
              graduationRate: cleanText(s.graduationRate || ''),
              graduationNum: extractPct(s.graduationRate),
              ranking: cleanText(s.ranking || ''),
              employmentRate: cleanText(s.employmentRate || ''),
              employmentNum: extractPct(s.employmentRate),
              avgSalary: cleanText(s.avgSalary || ''),
              scholarships: cleanText(s.scholarships || ''),
              deadline: cleanText(s.deadline || ''),
              matchScore,
              favorited: match.favorited,
              why_matched: cleanText(s.why_matched || ''),
              program_rank: cleanText(s.program_rank || ''),
              median_earnings_10yr: s.median_earnings_10yr || 0,
              net_price_raw: s.net_price || 0,
              acceptance_rate: s.acceptance_rate || 0,
              top_employers: Array.isArray(s.top_employers) ? s.top_employers : [],
              tier: validTier || derivedTier,
              test_policy: cleanText(s.test_policy || (s.test_optional ? 'Test-Optional' : '')),
              concern: cleanText(s.concern || ''),
              deadline_type: cleanText(s.deadline_type || ''),
            });
            setIsFavorite(match.favorited || false);

            try {
              const statuses = JSON.parse(localStorage.getItem('rv_app_statuses') || '{}');
              setAppStatus(statuses[schoolName] || '');
            } catch {}
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

  useEffect(() => {
    if (school) {
      const t = setTimeout(() => setMounted(true), 280);
      return () => clearTimeout(t);
    }
  }, [school]);

  const toggleFavorite = async () => {
    if (!school || !user) return;
    const next = !isFavorite;
    setIsFavorite(next);
    await createClient().from('matches').update({ favorited: next }).eq('id', school.id);
  };

  const updateAppStatus = (status: string) => {
    const next = appStatus === status ? '' : status;
    setAppStatus(next);
    setShowStatusMenu(false);
    try {
      const existing = JSON.parse(localStorage.getItem('rv_app_statuses') || '{}');
      if (next) existing[school.name] = next;
      else delete existing[school.name];
      localStorage.setItem('rv_app_statuses', JSON.stringify(existing));
    } catch {}
  };

  if (loading || authLoading) {
    return (
      <div style={{
        background: '#080810', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 44%, rgba(99,102,241,0.08) 0%, transparent 55%)',
        }} />
        <div style={{ position: 'relative', width: '88px', height: '88px', marginBottom: '36px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.07)' }} />
          <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.045)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#818cf8', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: 'rgba(129,140,248,0.35)', animation: 'spin 1.5s linear infinite reverse' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#818cf8', boxShadow: '0 0 12px rgba(129,140,248,0.9)',
            animation: 'dotPulse 2s ease-in-out infinite',
          }} />
        </div>
        <h2 style={{
          fontSize: 'clamp(22px,3.8vw,44px)', fontWeight: 700,
          color: '#f0f0f8', letterSpacing: '-0.035em', lineHeight: 0.95,
          textAlign: 'center', margin: '0 0 14px', padding: '0 32px',
        }}>
          {decodedName}
        </h2>
        <p style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(240,240,248,0.2)',
          margin: 0,
        }}>
          Analyzing your profile match…
        </p>
        <style>{`
          @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
          @keyframes dotPulse { 0%,100% { opacity:1; transform:translate(-50%,-50%) scale(1); } 50% { opacity:0.4; transform:translate(-50%,-50%) scale(0.7); } }
        `}</style>
      </div>
    );
  }

  if (!school) {
    return (
      <div style={{ background: '#080810', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h1 style={{ color: '#f0f0f8', fontSize: '22px', fontWeight: 300, margin: 0 }}>School not found</h1>
        <button onClick={() => router.back()} style={{ padding: '9px 22px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,248,0.6)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
          Go Back
        </button>
      </div>
    );
  }

  const scoreColor = school.matchScore >= 80 ? '#34d399' : school.matchScore >= 60 ? '#fb923c' : '#f87171';
  const scoreRGB = school.matchScore >= 80 ? '52,211,153' : school.matchScore >= 60 ? '251,146,60' : '248,113,113';
  const ringR = 96;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = mounted ? ringC - (school.matchScore / 100) * ringC : ringC;

  const tier = school.tier as 'safety' | 'target' | 'reach';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.target;

  const currentStatusCfg = APP_STATUS_CONFIG.find(s => s.value === appStatus);

  const strengths: { label: string; pct: number }[] = [];
  const risks: { label: string; pct: number }[] = [];
  if (school.tuitionNum < 25000 && school.tuitionNum > 0) strengths.push({ label: 'High Affordability', pct: 92 });
  else if (school.tuitionNum > 50000) risks.push({ label: 'High Tuition Cost', pct: 85 });
  if (school.admissionNum > 0 && school.admissionNum < 15) risks.push({ label: 'Highly Competitive', pct: 95 });
  else if (school.admissionNum > 60) strengths.push({ label: 'Accessible Admission', pct: 82 });
  if (school.graduationNum > 85) strengths.push({ label: 'Excellent Outcomes', pct: 94 });
  else if (school.graduationNum > 0 && school.graduationNum < 50) risks.push({ label: 'Low Graduation Rate', pct: 72 });
  if (school.employmentNum > 90) strengths.push({ label: 'Strong Job Placement', pct: 97 });
  if (school.matchScore >= 80) strengths.push({ label: 'Strong Profile Fit', pct: school.matchScore });
  else if (school.matchScore < 60) risks.push({ label: 'Profile Mismatch', pct: 100 - school.matchScore });
  if (strengths.length === 0) strengths.push({ label: 'Academic Prestige', pct: 78 });
  if (risks.length === 0) risks.push({ label: 'Program Intensity', pct: 58 });

  const statsRail = [
    { label: 'Tuition', value: school.tuition || '—', color: '#f0f0f8', sub: '/year' },
    { label: 'Admission Rate', value: school.admissionRate || (school.acceptance_rate ? `${Number(school.acceptance_rate).toFixed(0)}%` : '—'), color: '#fb923c', sub: null },
    { label: 'Graduation Rate', value: school.graduationRate || '—', color: '#818cf8', sub: null },
    { label: '10yr Salary', value: school.avgSalary || (school.median_earnings_10yr ? `$${(school.median_earnings_10yr / 1000).toFixed(0)}k` : '—'), color: '#34d399', sub: null },
    { label: 'Net Price', value: school.netPrice || (school.net_price_raw ? `$${(school.net_price_raw / 1000).toFixed(0)}k` : '—'), color: '#c084fc', sub: 'after aid' },
  ];

  const hasTopEmployers = school.top_employers?.length > 0;
  const hasConcern = Boolean(school.concern);

  let sectionCounter = 0;
  const nextSection = () => { sectionCounter++; return String(sectionCounter).padStart(2, '0'); };

  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#f0f0f8', paddingBottom: '80px' }}>

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      }} />

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 50% 40% at 72% 12%, rgba(${scoreRGB},0.065) 0%, transparent 55%)`,
        transition: 'background 1.4s ease',
      }} />

      {/* ─── Navbar ─── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,16,0.86)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 500, color: 'rgba(240,240,248,0.38)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'color 0.18s ease', fontFamily: 'inherit',
              padding: '6px 10px', borderRadius: '8px', marginLeft: '-10px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,240,248,0.78)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,248,0.38)')}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {school.program_rank && (
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#fbbf24',
                background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)',
                padding: '4px 11px', borderRadius: '100px',
              }}>
                {school.program_rank}
              </span>
            )}
            {/* Tier badge */}
            <span style={{
              fontSize: '11px', fontWeight: 600, color: tierCfg.color,
              background: tierCfg.bg, border: `1px solid ${tierCfg.border}`,
              padding: '4px 11px', borderRadius: '100px',
            }}>
              {tierCfg.icon} {tierCfg.label}
            </span>
            {/* Test policy */}
            {school.test_policy && (
              <span style={{
                fontSize: '11px', fontWeight: 500,
                color: school.test_policy === 'Test-Free' ? '#a78bfa' : school.test_policy === 'Test-Optional' ? '#34d399' : 'rgba(240,240,248,0.45)',
                background: school.test_policy === 'Test-Free' ? 'rgba(167,139,250,0.07)' : school.test_policy === 'Test-Optional' ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.04)',
                border: school.test_policy === 'Test-Free' ? '1px solid rgba(167,139,250,0.2)' : school.test_policy === 'Test-Optional' ? '1px solid rgba(52,211,153,0.16)' : '1px solid rgba(255,255,255,0.07)',
                padding: '4px 11px', borderRadius: '100px',
              }}>
                {school.test_policy}
              </span>
            )}
            <button
              onClick={toggleFavorite}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isFavorite ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isFavorite ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.08)'}`,
                color: isFavorite ? '#fb7185' : 'rgba(240,240,248,0.32)',
                cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={e => { if (!isFavorite) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,240,248,0.65)'; } }}
              onMouseLeave={e => { if (!isFavorite) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,240,248,0.32)'; } }}
            >
              <Heart style={{ width: '15px', height: '15px', fill: isFavorite ? 'currentColor' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-6%',
          width: '900px', height: '700px', pointerEvents: 'none',
          background: `radial-gradient(ellipse, rgba(${scoreRGB},0.055) 0%, transparent 60%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: '-25%', left: '-8%',
          width: '600px', height: '500px', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(99,102,241,0.045) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '84px 28px 68px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '52px', flexWrap: 'wrap' }}>

            {/* Left: Identity */}
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '22px', animation: 'heroIn 0.75s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start',
                padding: '5px 13px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px', fontWeight: 400, color: 'rgba(240,240,248,0.42)',
              }}>
                <MapPin style={{ width: '11px', height: '11px', color: 'rgba(129,140,248,0.7)' }} />
                {school.location || 'Location Unknown'}
              </div>

              <h1 style={{
                fontSize: 'clamp(34px, 5.8vw, 74px)',
                fontWeight: 700,
                color: '#f0f0f8',
                letterSpacing: '-0.04em',
                lineHeight: 0.92,
                margin: 0,
              }}>
                {school.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap style={{ width: '17px', height: '17px', color: 'rgba(129,140,248,0.55)', flexShrink: 0 }} />
                <span style={{ fontSize: '17px', fontWeight: 300, color: 'rgba(240,240,248,0.42)', letterSpacing: '-0.01em' }}>
                  {school.program || 'General Admission'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Tier badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '100px',
                  background: tierCfg.bg, border: `1px solid ${tierCfg.border}`,
                  fontSize: '12px', fontWeight: 700, color: tierCfg.color,
                }}>
                  <span>{tierCfg.icon}</span>
                  {tierCfg.label} School
                </div>
                {/* Profile mode indicator */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '100px',
                  background: profileMode === 'international' ? 'rgba(99,102,241,0.07)' : 'rgba(16,185,129,0.07)',
                  border: `1px solid ${profileMode === 'international' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  fontSize: '11px', fontWeight: 600,
                  color: profileMode === 'international' ? '#818cf8' : '#10b981',
                }}>
                  {profileMode === 'international'
                    ? <Globe style={{ width: '11px', height: '11px' }} />
                    : <Home style={{ width: '11px', height: '11px' }} />}
                  {profileMode === 'international' ? 'International' : 'Domestic'} Profile
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '100px',
                  background: 'rgba(52,211,153,0.065)', border: '1px solid rgba(52,211,153,0.16)',
                  fontSize: '11px', fontWeight: 600, color: '#34d399',
                }}>
                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                  $0.00 Commission · Rivernova Verified
                </div>
              </div>
            </div>

            {/* Right: Score Ring */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', animation: 'heroIn 0.95s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '-36px', borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(${scoreRGB},0.09) 0%, transparent 58%)`,
                  animation: 'haloPulse 3.2s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: '-14px', borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(${scoreRGB},0.11) 0%, transparent 55%)`,
                }} />

                <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <filter id="ring-glow" x="-25%" y="-25%" width="150%" height="150%">
                      <feGaussianBlur stdDeviation="4.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="ring-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={scoreColor} stopOpacity="1" />
                      <stop offset="100%" stopColor={scoreColor} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <circle cx="120" cy="120" r="112" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 9" />
                  <circle cx="120" cy="120" r={ringR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="120" cy="120" r={ringR - 18} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
                  <circle
                    cx="120" cy="120" r={ringR}
                    fill="none"
                    stroke="url(#ring-grad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ringC}
                    strokeDashoffset={ringOffset}
                    filter="url(#ring-glow)"
                    style={{ transition: 'stroke-dashoffset 1.9s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                  {[Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((angle, i) => (
                    <circle key={i}
                      cx={120 + (ringR + 14) * Math.cos(angle)}
                      cy={120 + (ringR + 14) * Math.sin(angle)}
                      r="2"
                      fill="rgba(255,255,255,0.1)"
                    />
                  ))}
                </svg>

                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '66px', fontWeight: 700, color: '#f0f0f8',
                    letterSpacing: '-0.05em', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {school.matchScore}
                  </span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'rgba(240,240,248,0.22)', marginTop: '7px',
                  }}>
                    Match Score
                  </span>
                </div>
              </div>

              <div style={{
                padding: '7px 22px', borderRadius: '100px',
                background: `rgba(${scoreRGB},0.09)`, border: `1px solid rgba(${scoreRGB},0.28)`,
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: scoreColor,
                boxShadow: `0 0 22px rgba(${scoreRGB},0.18)`,
              }}>
                {getMatchScoreLabel(school.matchScore)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Rail ─── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.012)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${statsRail.length},1fr)` }}>
          {statsRail.map((s, i) => (
            <div key={i}
              style={{
                padding: '22px 18px', textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                transition: 'background 0.18s ease', cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.018)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.18)', margin: '0 0 8px' }}>
                {s.label}
              </p>
              <p style={{ fontSize: '20px', fontWeight: 600, color: s.color, margin: 0, letterSpacing: '-0.025em', lineHeight: 1 }}>
                {s.value}
              </p>
              {s.sub && (
                <p style={{ fontSize: '9px', color: 'rgba(240,240,248,0.16)', margin: '5px 0 0', fontWeight: 400, letterSpacing: '0.05em' }}>{s.sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '80px 28px 100px', display: 'flex', flexDirection: 'column', gap: '88px', position: 'relative', zIndex: 1 }}>

        {/* 01 — Personalized Insight */}
        {school.why_matched && (
          <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.08s' }}>
            <SectionLabel num={nextSection()}>Personalized Insight</SectionLabel>
            <div style={{
              marginTop: '24px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.065) 0%, rgba(139,92,246,0.035) 100%)',
              border: '1px solid rgba(99,102,241,0.17)',
              borderRadius: '24px',
              padding: '32px 36px',
              display: 'flex', alignItems: 'flex-start', gap: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles style={{ width: '19px', height: '19px', color: '#818cf8' }} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(129,140,248,0.75)', margin: '0 0 12px' }}>
                  Why this school matches your profile
                </p>
                <p style={{ fontSize: '15px', fontWeight: 300, color: 'rgba(240,240,248,0.8)', lineHeight: 1.82, margin: 0, letterSpacing: '-0.01em' }}>
                  {school.why_matched}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Honest Assessment (concern) — the #1 consulting firm differentiator */}
        {hasConcern && (
          <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.11s' }}>
            <SectionLabel num={nextSection()}>Honest Assessment</SectionLabel>
            <div style={{
              marginTop: '24px',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.055) 0%, rgba(245,158,11,0.025) 100%)',
              border: '1px solid rgba(251,191,36,0.18)',
              borderRadius: '24px',
              padding: '28px 32px',
              display: 'flex', alignItems: 'flex-start', gap: '18px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px',
                background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle style={{ width: '17px', height: '17px', color: '#fbbf24' }} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.65)', margin: '0 0 10px' }}>
                  What your advisor would actually tell you
                </p>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(240,240,248,0.78)', lineHeight: 1.82, margin: 0, letterSpacing: '-0.01em' }}>
                  {school.concern}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Intelligence (AI Advisor) */}
        <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.14s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <SectionLabel num={nextSection()}>Strategic Intelligence</SectionLabel>
              <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 0', letterSpacing: '-0.025em' }}>
                AI Advisor
              </h2>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(240,240,248,0.36)', margin: '10px 0 0', lineHeight: 1.65, maxWidth: '420px' }}>
                Real-time intel on safety, culture, and campus life.{' '}
                <span style={{ color: 'rgba(129,140,248,0.65)' }}>No consultant. No commission.</span>
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 13px', borderRadius: '9px',
              background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
              flexShrink: 0,
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818cf8', animation: 'haloPulse 2s infinite', boxShadow: '0 0 6px rgba(129,140,248,0.9)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#818cf8' }}>Live</span>
            </div>
          </div>
          <SchoolAdvisor schoolName={school.name} location={school.location} program={school.program} />
        </div>

        {/* Match Highlights */}
        {school.highlights.length > 0 && (
          <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.2s' }}>
            <SectionLabel num={nextSection()}>Match Highlights</SectionLabel>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 30px', letterSpacing: '-0.025em' }}>
              Why It&apos;s a Match
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {school.highlights.map((highlight: string, i: number) => (
                <div key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '52px 1fr',
                    background: 'rgba(255,255,255,0.018)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px', overflow: 'hidden',
                    transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.032)'; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.transform = 'translateX(5px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.018)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(99,102,241,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.045)',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(129,140,248,0.45)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <CheckCircle2 style={{ width: '15px', height: '15px', color: `rgba(${scoreRGB},0.65)`, flexShrink: 0 }} />
                    <p style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(240,240,248,0.76)', lineHeight: 1.68, margin: 0 }}>
                      {highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Employers */}
        {hasTopEmployers && (
          <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.26s' }}>
            <SectionLabel num={nextSection()}>Career Outcomes</SectionLabel>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 28px', letterSpacing: '-0.025em' }}>
              Top Employers
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {school.top_employers.map((emp: string, i: number) => (
                <div key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 18px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.065)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.11)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.028)'; el.style.borderColor = 'rgba(255,255,255,0.065)'; }}
                >
                  <Building2 style={{ width: '13px', height: '13px', color: 'rgba(129,140,248,0.45)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(240,240,248,0.62)' }}>{emp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Analysis */}
        <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.3s' }}>
          <SectionLabel num={nextSection()}>Profile Analysis</SectionLabel>
          <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 28px', letterSpacing: '-0.025em' }}>
            Strengths & Risk Factors
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <AnalysisCard title="Strengths" color="#34d399" colorRGB="52,211,153" items={strengths}
              icon={<TrendingUp style={{ width: '14px', height: '14px', color: '#34d399' }} />} />
            <AnalysisCard title="Risk Factors" color="#f87171" colorRGB="248,113,113" items={risks}
              icon={<TrendingUp style={{ width: '14px', height: '14px', color: '#f87171', transform: 'rotate(180deg)' }} />} />
          </div>
        </div>

        {/* Financial Picture */}
        <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.36s' }}>
          <SectionLabel num={nextSection()}>Financial Picture</SectionLabel>
          <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 28px', letterSpacing: '-0.025em' }}>
            Affordability & Outcomes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            <div style={{
              padding: '28px', borderRadius: '20px', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(52,211,153,0.08), rgba(16,185,129,0.04))',
              border: '1px solid rgba(52,211,153,0.16)',
            }}>
              <div style={{ position: 'absolute', right: '-14px', bottom: '-14px', opacity: 0.07 }}>
                <BarChart2 style={{ width: '90px', height: '90px', color: '#34d399' }} />
              </div>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.55)', margin: '0 0 16px' }}>10yr Avg Salary</p>
              <p style={{ fontSize: '38px', fontWeight: 700, color: '#f0f0f8', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
                {school.avgSalary || (school.median_earnings_10yr ? `$${(school.median_earnings_10yr / 1000).toFixed(0)}k` : '—')}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.28)', margin: '10px 0 0', fontWeight: 300 }}>Post-graduation median</p>
            </div>
            <div style={{ padding: '28px', borderRadius: '20px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'rgba(192,132,252,0.55)', margin: '0 0 16px' }}>Net Price After Aid</p>
              <p style={{ fontSize: '38px', fontWeight: 700, color: '#c084fc', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
                {school.netPrice || (school.net_price_raw ? `$${(school.net_price_raw / 1000).toFixed(0)}k` : '—')}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.28)', margin: '10px 0 0', fontWeight: 300 }}>Average after grants</p>
            </div>
            <div style={{ padding: '28px', borderRadius: '20px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.2)', margin: '0 0 16px' }}>Scholarships & Aid</p>
              {school.scholarships && school.scholarships.toLowerCase() !== 'none' ? (
                <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(240,240,248,0.68)', lineHeight: 1.72, margin: 0 }}>{school.scholarships}</p>
              ) : (
                <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(240,240,248,0.26)', fontStyle: 'italic', margin: 0 }}>No specific scholarship data.</p>
              )}
            </div>
          </div>
          <div style={{
            marginTop: '12px', padding: '15px 22px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.11)',
          }}>
            <ShieldCheck style={{ width: '17px', height: '17px', color: '#34d399', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>$0.00 Commission Received </span>
              <span style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(52,211,153,0.5)' }}>· Cryptographically verified · No kickbacks · No conflicts of interest</span>
            </div>
          </div>
        </div>

        {/* Program Details */}
        <div style={{ animation: 'sectionIn 0.65s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.42s' }}>
          <SectionLabel num={nextSection()}>Program Details</SectionLabel>
          <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 300, color: '#f0f0f8', margin: '10px 0 28px', letterSpacing: '-0.025em' }}>
            Admissions & Academics
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
            {([
              { label: 'Intended Major / Program', value: school.program || 'Undeclared', icon: GraduationCap, color: '#818cf8' },
              { label: 'Minimum GPA Required', value: school.gpaMinimum || 'Not Specified', icon: Award, color: '#34d399' },
              { label: 'Application Deadline', value: school.deadline || 'Rolling Admission', icon: Calendar, color: '#fb923c' },
              ...(school.deadline_type ? [{ label: 'Deadline Type', value: school.deadline_type, icon: Calendar, color: '#60a5fa' }] : []),
              { label: 'National Ranking', value: school.ranking || school.program_rank || 'N/A', icon: Star, color: '#fbbf24' },
              { label: 'Sticker Tuition', value: school.tuition || '—', icon: DollarSign, color: '#c084fc' },
              ...(school.test_policy ? [{ label: 'Test Policy', value: school.test_policy, icon: CheckCircle2, color: school.test_policy === 'Test-Free' ? '#a78bfa' : school.test_policy === 'Test-Optional' ? '#34d399' : '#818cf8' }] : []),
            ] as { label: string; value: string; icon: React.ElementType; color: string }[]).map((row, i, arr) => {
              const Icon = row.icon;
              return (
                <div key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 24px',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.042)' : undefined,
                    transition: 'background 0.14s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.016)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                    background: `${row.color}0e`, border: `1px solid ${row.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '14px', height: '14px', color: row.color }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(240,240,248,0.36)', flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(240,240,248,0.84)' }}>{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── Sticky Bottom Bar ─── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,16,0.9)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderTop: '1px solid rgba(255,255,255,0.065)',
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '11px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f8', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {school.name}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(240,240,248,0.36)', marginTop: '1px' }}>
              {school.program || 'General Admission'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Tier badge */}
            <div style={{
              padding: '6px 12px', borderRadius: '8px',
              background: tierCfg.bg, border: `1px solid ${tierCfg.border}`,
              fontSize: '11px', fontWeight: 700, color: tierCfg.color, letterSpacing: '0.02em',
            }}>
              {tierCfg.icon} {tierCfg.label}
            </div>

            <div style={{
              padding: '6px 14px', borderRadius: '8px',
              background: `rgba(${scoreRGB},0.09)`, border: `1px solid rgba(${scoreRGB},0.2)`,
              fontSize: '12px', fontWeight: 700, color: scoreColor, letterSpacing: '0.04em',
            }}>
              {school.matchScore}% Match
            </div>

            {/* Application status */}
            <div style={{ position: 'relative' }} ref={statusMenuRef}>
              <button
                onClick={() => setShowStatusMenu(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '9px',
                  background: currentStatusCfg ? `rgba(${hexToRGB(currentStatusCfg.color)},0.1)` : 'rgba(255,255,255,0.055)',
                  border: `1px solid ${currentStatusCfg ? `rgba(${hexToRGB(currentStatusCfg.color)},0.25)` : 'rgba(255,255,255,0.09)'}`,
                  color: currentStatusCfg ? currentStatusCfg.color : 'rgba(240,240,248,0.55)',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
                }}
              >
                {currentStatusCfg ? (
                  <>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentStatusCfg.color, flexShrink: 0 }} />
                    {currentStatusCfg.label}
                  </>
                ) : 'Track Application'}
                <ChevronDown style={{ width: '12px', height: '12px', opacity: 0.6, transform: showStatusMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {showStatusMenu && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
                  background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '12px', overflow: 'hidden',
                  boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
                  minWidth: '160px', zIndex: 200,
                }}>
                  {APP_STATUS_CONFIG.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateAppStatus(s.value)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', background: appStatus === s.value ? `rgba(${hexToRGB(s.color)},0.08)` : 'transparent',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '13px', fontWeight: appStatus === s.value ? 600 : 400,
                        color: appStatus === s.value ? s.color : 'rgba(240,240,248,0.55)',
                        transition: 'all 0.14s ease', textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (appStatus !== s.value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (appStatus !== s.value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFavorite}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '9px',
                background: isFavorite ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.055)',
                border: `1px solid ${isFavorite ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.09)'}`,
                color: isFavorite ? '#fb7185' : 'rgba(240,240,248,0.55)',
                cursor: 'pointer', transition: 'all 0.18s ease',
                fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
              }}
            >
              <Heart style={{ width: '13px', height: '13px', fill: isFavorite ? 'currentColor' : 'none' }} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '8px 20px', borderRadius: '9px',
                background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(240,240,248,0.6)',
                cursor: 'pointer', transition: 'all 0.18s ease',
                fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.09)'; el.style.color = 'rgba(240,240,248,0.9)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.055)'; el.style.color = 'rgba(240,240,248,0.6)'; }}
            >
              <ChevronRight style={{ width: '13px', height: '13px', transform: 'rotate(180deg)' }} />
              Back
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes haloPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(1.06); } }
        @keyframes heroIn { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sectionIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        * { scrollbar-width:thin; scrollbar-color:rgba(99,102,241,0.18) transparent; }
      `}</style>
    </div>
  );
}

function hexToRGB(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function SectionLabel({ children, num }: { children: React.ReactNode; num?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {num && (
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(240,240,248,0.1)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
          {num}
        </span>
      )}
      <p style={{
        fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'rgba(240,240,248,0.2)',
        margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

function AnalysisCard({
  title, color, colorRGB, items, icon,
}: {
  title: string;
  color: string;
  colorRGB: string;
  items: { label: string; pct: number }[];
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: `rgba(${colorRGB},0.032)`,
      border: `1px solid rgba(${colorRGB},0.1)`,
      borderRadius: '20px',
      padding: '26px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {items.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(240,240,248,0.68)' }}>{s.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.03em' }}>{s.pct}%</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${s.pct}%`,
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                boxShadow: `0 0 5px rgba(${colorRGB},0.35)`,
                transition: 'width 1.7s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
