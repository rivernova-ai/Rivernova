'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { matchScoreToTier } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import {
  Loader2, Search, MapPin, Award, Calendar,
  Heart, ArrowRight, Plus, Check, Globe, Home,
  ShieldCheck, Sparkles, ChevronRight, ChevronDown, ChevronUp, AlertTriangle,
  Activity, Clock,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import MatchFilters, { FilterOptions } from '@/components/matches/MatchFilters';
import { calculateMatchScore, isValidMatchScore, stripMarkdown, cleanText, toSlug } from '@/lib/utils';
import { parseSchoolJSON, validateSchoolData } from '@/lib/schoolParser';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { ComparisonModal } from '@/components/comparison/ComparisonModal';
import { ComparisonSchool } from '@/lib/comparison';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  mode: 'domestic' | 'international' | 'lifelong';
  onboarding_completed: boolean;
  full_name: string;
  academic_background: any;
  career_goals: any;
  budget: any;
  location_preferences: any;
  school_preferences: any;
}

interface SchoolMatch {
  name: string;
  location: string;
  program: string;
  tuition: string;
  highlights?: string[];
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
  why_matched?: string;
  concern?: string;
  program_rank?: string;
  tier?: 'safety' | 'target' | 'reach';
  test_policy?: string;
  deadline_type?: string;
  net_price?: number;
  acceptance_rate?: number;
  median_earnings_10yr?: number;
  tuition_instate?: number;
  tuition_outofstate?: number;
  top_employers?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SEARCH_STEPS = [
  { label: 'Querying 15,000+ programs', sub: 'Searching accredited universities worldwide' },
  { label: 'Building your tier strategy', sub: 'Calculating Safety, Target & Reach schools' },
  { label: 'Verifying financial data', sub: 'Cross-referencing College Scorecard & NCES' },
  { label: 'Ranking your matches', sub: 'Personalizing your final list of 20 schools' },
];

const TIER_CONFIG = {
  safety: {
    label: 'Safety Schools',
    desc: 'Your profile is well above their typical admit — high probability of acceptance',
    color: '#8C2D35',
    rgb: '140,45,53',
    bg: 'rgba(140,45,53,0.05)',
    border: 'rgba(140,45,53,0.14)',
  },
  target: {
    label: 'Target Schools',
    desc: "You're in range — competitive but highly achievable with a strong application",
    color: '#8C2D35',
    rgb: '140,45,53',
    bg: 'rgba(140,45,53,0.05)',
    border: 'rgba(140,45,53,0.14)',
  },
  reach: {
    label: 'Reach Schools',
    desc: 'Selective and ambitious — worth every application, expect competition',
    color: 'rgba(28,10,12,0.65)',
    rgb: '28,10,12',
    bg: 'rgba(28,10,12,0.04)',
    border: 'rgba(28,10,12,0.12)',
  },
} as const;

const APP_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  considering:  { label: 'Considering',  color: 'rgba(28,10,12,0.55)', bg: 'rgba(28,10,12,0.05)',  border: 'rgba(28,10,12,0.15)' },
  applying:     { label: 'Applying',     color: '#8C2D35',             bg: 'rgba(140,45,53,0.07)',  border: 'rgba(140,45,53,0.20)' },
  submitted:    { label: 'Submitted',    color: 'rgba(28,10,12,0.7)',  bg: 'rgba(28,10,12,0.05)',  border: 'rgba(28,10,12,0.15)' },
  accepted:     { label: 'Accepted',     color: '#8C2D35',             bg: 'rgba(140,45,53,0.07)',  border: 'rgba(140,45,53,0.20)' },
  waitlisted:   { label: 'Waitlisted',   color: 'rgba(28,10,12,0.55)', bg: 'rgba(28,10,12,0.05)',  border: 'rgba(28,10,12,0.15)' },
  rejected:     { label: 'Not Selected', color: 'rgba(28,10,12,0.4)',  bg: 'rgba(28,10,12,0.04)',  border: 'rgba(28,10,12,0.12)' },
};

const TRACKER_DOCS = [
  { key: 'sop', label: 'Statement of Purpose' },
  { key: 'lor', label: 'Letters of Rec.' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'english_test', label: 'English Test' },
  { key: 'financial', label: 'Financial Docs' },
];

const TRACKER_ACTIVE_STATUSES = ['applying', 'submitted', 'accepted', 'waitlisted', 'rejected'];

const DEFAULT_FILTERS: FilterOptions = {
  budgetRange: 'all', location: 'all', successRate: 'all',
  programType: 'all', tier: 'all', testPolicy: 'all',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [results, setResults] = useState<SchoolMatch[]>([]);
  const [filteredResults, setFilteredResults] = useState<SchoolMatch[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [comparison, setComparison] = useState<{ isOpen: boolean; schools: ComparisonSchool[] }>({ isOpen: false, schools: [] });
  const [sortBy, setSortBy] = useState<'match' | 'tuition' | 'admit'>('match');
  const [loadingSchool, setLoadingSchool] = useState<{ name: string; program: string; matchScore: number; location: string } | null>(null);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [trackerOpen, setTrackerOpen] = useState<Set<string>>(new Set());
  const [appDocuments, setAppDocuments] = useState<Record<string, Record<string, boolean>>>({});
  const [appDeadlines, setAppDeadlines] = useState<Record<string, string>>({});
  const [appNotes, setAppNotes] = useState<Record<string, string>>({});
  const [trackerStripOpen, setTrackerStripOpen] = useState(true);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDeadlineInfo = (deadline: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (days < 0)  return { days, label: 'Overdue',     color: '#991B1B', bg: 'rgba(153,27,27,0.08)',  border: 'rgba(153,27,27,0.25)' };
    if (days < 14) return { days, label: `${days}d left`, color: '#DC2626', bg: 'rgba(220,38,38,0.07)',  border: 'rgba(220,38,38,0.25)' };
    if (days < 30) return { days, label: `${days}d left`, color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.28)' };
    return           { days, label: `${days}d left`, color: '#059669', bg: 'rgba(5,150,105,0.07)',  border: 'rgba(5,150,105,0.22)' };
  };

  // Load applicationStatuses from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rv_app_statuses');
      if (stored) setApplicationStatuses(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Load tracker data from Supabase applications table
  useEffect(() => {
    if (!user) return;
    createClient().from('applications').select('*').eq('user_id', user.id).then(({ data }) => {
      if (!data) return;
      const statuses: Record<string, string> = {};
      const docs: Record<string, Record<string, boolean>> = {};
      const deadlines: Record<string, string> = {};
      const notes: Record<string, string> = {};
      data.forEach((row: any) => {
        if (row.status) statuses[cleanText(row.school_name)] = row.status;
        if (row.documents != null) docs[row.school_slug] = row.documents;
        if (row.deadline) deadlines[row.school_slug] = row.deadline;
        if (row.notes) notes[row.school_slug] = row.notes;
      });
      if (Object.keys(statuses).length > 0) setApplicationStatuses(prev => ({ ...prev, ...statuses }));
      setAppDocuments(docs);
      setAppDeadlines(deadlines);
      setAppNotes(notes);
    });
  }, [user]);

  // Close status dropdown on outside click
  useEffect(() => {
    const close = () => setStatusDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (loading) return;
      if (!user) { router.push('/'); return; }

      const supabase = createClient();
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!p?.onboarding_completed) { router.push('/onboarding'); return; }
      setProfile(p);

      const { data: rawMatches } = await supabase.from('matches').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      // Deduplicate by school name — keep most recent per school (handles legacy accumulated data)
      const seen = new Set<string>();
      const m = (rawMatches || []).filter(match => {
        const key = (match.school_name || '').toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (m && m.length > 0) {
        const ep = (t: string) => { if (!t) return ''; const x = t.match(/(\d+\.?\d*)\s*%/); return x ? `${parseFloat(x[1])}%` : ''; };
        const fmt = m.map(match => {
          const s = match.school_data || {};
          const ms = calculateMatchScore({
            userGPA: p?.academic_background?.gpa ? parseFloat(p.academic_background.gpa) : undefined,
            userBudgetMax: p?.budget?.perYear || (p?.budget?.max ? Number(p.budget.max) : undefined),
            userMajor: p?.academic_background?.major || '',
            schoolMinGPA: s.gpaMinimum ? parseFloat(s.gpaMinimum) : undefined,
            schoolNetPrice: s.netPrice ? parseInt(s.netPrice.replace(/[^0-9]/g, '') || '0') : undefined,
            schoolTuition: parseInt((s.tuition || '').replace(/[^0-9]/g, '') || '0'),
            schoolAcceptanceRate: s.admissionRate ? parseFloat(s.admissionRate.replace(/[^0-9.]/g, '') || '0') : s.acceptance_rate,
            schoolGraduationRate: s.graduationRate ? parseFloat(s.graduationRate.replace(/[^0-9.]/g, '') || '0') : undefined,
            schoolProgram: s.programName || '',
          });
          return {
            id: match.id,
            name: stripMarkdown(match.school_name),
            location: stripMarkdown(s.location || ''),
            program: stripMarkdown(s.programName || ''),
            tuition: stripMarkdown(s.tuition || ''),
            netPrice: stripMarkdown(s.netPrice || ''),
            gpaMinimum: stripMarkdown(s.gpaMinimum ? String(s.gpaMinimum) : ''),
            highlights: (s.highlights || []).map((h: string) => stripMarkdown(h)),
            admissionRate: ep(s.admissionRate || ''),
            graduationRate: ep(s.graduationRate || ''),
            ranking: stripMarkdown(s.ranking || ''),
            employmentRate: ep(s.employmentRate || ''),
            avgSalary: stripMarkdown(s.avgSalary || ''),
            scholarships: stripMarkdown(s.scholarships || ''),
            deadline: stripMarkdown(s.deadline || ''),
            why_matched: s.why_matched || '',
            concern: s.concern || '',
            program_rank: s.program_rank || '',
            tier: s.tier || (matchScoreToTier(ms)) as 'safety' | 'target' | 'reach',
            test_policy: s.test_policy || '',
            acceptance_rate: s.acceptance_rate || 0,
            median_earnings_10yr: s.median_earnings_10yr || 0,
            tuition_instate: s.tuition_instate || 0,
            tuition_outofstate: s.tuition_outofstate || 0,
            matchScore: ms,
          };
        });
        const fav = new Set<string>();
        m.forEach(x => { if (x.favorited) fav.add(stripMarkdown(x.school_name)); });
        setFavorites(fav);
        const f = fmt.filter(x => isValidMatchScore(x.matchScore || 0)).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setResults(f); setFilteredResults(f);
      }
      setChecking(false);
    };
    init();
  }, [user, loading, router]);

  const handleModeChange = async (mode: 'domestic' | 'international') => {
    if (!user) return;
    await createClient().from('profiles').update({ mode }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, mode } : null);
  };

  const searchSchools = async () => {
    if (!profile) return;
    setSearching(true);
    setSearchStep(0);
    setResults([]);
    setFilteredResults([]);

    stepIntervalRef.current = setInterval(() => {
      setSearchStep(prev => Math.min(prev + 1, SEARCH_STEPS.length - 1));
    }, 3500);

    try {
      const a = profile.academic_background || {};
      const c = profile.career_goals || {};
      const b = profile.budget || {};
      const l = profile.location_preferences || {};
      const sp = profile.school_preferences || {};

      const res = await fetch('/api/search-schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Core academic
          major: a.major || '',
          gpa: a.gpa || '',
          gpaScale: a.gpaScale || '4.0',
          // Test scores
          satScore: a.satScore || '',
          actScore: a.actScore || '',
          ieltsToeflScore: a.ieltsToeflScore || '',
          englishProficiencyType: a.englishProficiencyType || '',
          // Budget
          budgetPerYear: b.perYear || (b.max ? parseInt(b.max) : 30000),
          fundingSource: b.fundingSource || '',
          scholarshipNeeded: b.scholarshipNeeded || false,
          fafsaFiled: b.fafsaFiled || false,
          inStateTuition: b.inStateTuition || false,
          // Location
          preferredCountries: l.preferredCountries || [],
          preferredUSStates: l.preferredUSStates || [],
          residenceState: l.residenceState || '',
          citizenshipCountry: l.citizenshipCountry || '',
          // Career
          dreamJob: c.dreamJob || '',
          dreamCompany: c.dreamCompany || '',
          careerField: c.careerField || '',
          studyTimeline: c.studyTimeline || '',
          // Profile mode
          mode: profile.mode === 'lifelong' ? 'international' : profile.mode,
          // School prefs
          schoolSize: sp.schoolSize || 'any',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      if (!data.schools || !Array.isArray(data.schools)) throw new Error('Invalid response');

      const validated = validateSchoolData(parseSchoolJSON(data.schools));
      if (!validated.length) throw new Error('No valid schools found');

      const rawMap = new Map<string, any>();
      data.schools.forEach((r: any) => rawMap.set((r.name || '').toLowerCase().trim(), r));

      const scored = validated.map(s => {
        const raw = rawMap.get((s.name || '').toLowerCase().trim()) || {};
        const np = s.netPrice ? parseInt(s.netPrice.replace(/[^0-9]/g, '') || '0') : (raw.net_price || 0);
        const tp = parseInt((s.tuition || '').replace(/[^0-9]/g, '') || '0') || raw.tuition_instate || 0;
        const ar = raw.acceptance_rate || (s.admissionRate ? parseFloat(s.admissionRate.replace(/[^0-9.]/g, '') || '0') : 0);
        const ms = calculateMatchScore({
          userGPA: profile?.academic_background?.gpa ? parseFloat(profile.academic_background.gpa) : undefined,
          userBudgetMax: profile?.budget?.perYear || (profile?.budget?.max ? Number(profile.budget.max) : undefined),
          userMajor: profile?.academic_background?.major || '',
          schoolMinGPA: s.gpaMinimum ? parseFloat(s.gpaMinimum) : raw.gpa_minimum || undefined,
          schoolNetPrice: np || undefined,
          schoolTuition: tp || undefined,
          schoolAcceptanceRate: ar || undefined,
          schoolGraduationRate: s.graduationRate ? parseFloat(s.graduationRate.replace(/[^0-9.]/g, '') || '0') : raw.graduation_rate || undefined,
          schoolProgram: s.program || '',
        });

        const rawTier = raw.tier;
        const tier: 'safety' | 'target' | 'reach' =
          (rawTier === 'safety' || rawTier === 'target' || rawTier === 'reach')
            ? rawTier
            : matchScoreToTier(ms);

        return {
          ...s,
          why_matched: raw.why_matched || '',
          concern: raw.concern || '',
          program_rank: raw.program_rank || '',
          highlights: raw.highlights || s.highlights || [],
          tier,
          test_policy: raw.test_policy || '',
          deadline_type: raw.deadline_type || '',
          net_price: raw.net_price || 0,
          acceptance_rate: ar,
          median_earnings_10yr: raw.median_earnings_10yr || 0,
          tuition_instate: raw.tuition_instate || 0,
          tuition_outofstate: raw.tuition_outofstate || 0,
          top_employers: raw.top_employers || [],
          matchScore: ms,
        };
      }).filter(s => isValidMatchScore(s.matchScore || 0));

      // Sort: tier order, then match score within tier
      const TIER_ORDER: Record<string, number> = { safety: 0, target: 1, reach: 2 };
      scored.sort((a, b) => {
        const ta = TIER_ORDER[a.tier || 'target'] ?? 1;
        const tb = TIER_ORDER[b.tier || 'target'] ?? 1;
        if (ta !== tb) return ta - tb;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });

      setResults(scored);
      setFilteredResults(scored);

      if (scored.length > 0) {
        await createClient().from('matches').delete().eq('user_id', user!.id);
        await createClient().from('matches').insert(scored.map(s => ({
          user_id: user!.id,
          school_name: s.name,
          school_data: {
            location: s.location || '',
            programName: s.program || '',
            tuition: s.tuition || '',
            netPrice: s.netPrice || '',
            highlights: s.highlights || [],
            admissionRate: s.admissionRate || '',
            graduationRate: s.graduationRate || '',
            gpaMinimum: s.gpaMinimum || '',
            ranking: s.ranking || '',
            employmentRate: s.employmentRate || '',
            avgSalary: s.avgSalary || '',
            scholarships: s.scholarships || '',
            deadline: s.deadline || '',
            matchScore: s.matchScore || 0,
            why_matched: s.why_matched || '',
            concern: s.concern || '',
            program_rank: s.program_rank || '',
            tier: s.tier || 'target',
            test_policy: s.test_policy || '',
            acceptance_rate: s.acceptance_rate || 0,
            median_earnings_10yr: s.median_earnings_10yr || 0,
            tuition_instate: s.tuition_instate || 0,
            tuition_outofstate: s.tuition_outofstate || 0,
          },
          success_probability: s.matchScore || 75,
          reasoning: s.why_matched || 'Match based on your profile',
        })));
        // Seed applications — new rows get 'considering', existing rows untouched
        await createClient().from('applications').upsert(
          scored.map(s => ({
            user_id: user!.id,
            school_name: cleanText(s.name),
            school_slug: toSlug(s.name),
            tier: s.tier || 'target',
            status: 'considering',
          })),
          { onConflict: 'user_id,school_slug', ignoreDuplicates: true }
        );
      }
    } catch (e: any) {
      alert(e.message || 'Failed to search');
    } finally {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setSearching(false);
    }
  };

  const toggleFavorite = async (school: SchoolMatch) => {
    const sb = createClient(), n = cleanText(school.name);
    setFavorites(prev => {
      const f = new Set(prev);
      if (f.has(n)) { f.delete(n); sb.from('matches').update({ favorited: false }).eq('user_id', user!.id).eq('school_name', n).then(); }
      else { f.add(n); sb.from('matches').update({ favorited: true }).eq('user_id', user!.id).eq('school_name', n).then(); }
      return f;
    });
  };

  const toggleCompare = (school: SchoolMatch) => {
    setComparison(prev => {
      if (prev.schools.some(s => s.name === school.name)) return { ...prev, schools: prev.schools.filter(s => s.name !== school.name) };
      if (prev.schools.length >= 5) { alert('Max 5 schools for comparison'); return prev; }
      return { ...prev, schools: [...prev.schools, school as ComparisonSchool] };
    });
  };

  const updateApplicationStatus = (schoolName: string, status: string) => {
    const key = cleanText(schoolName);
    const slug = toSlug(schoolName);
    const updated = { ...applicationStatuses, [key]: status };
    setApplicationStatuses(updated);
    try { localStorage.setItem('rv_app_statuses', JSON.stringify(updated)); } catch { /* ignore */ }
    setStatusDropdown(null);
    if (user) createClient().from('applications').upsert({ user_id: user.id, school_name: cleanText(schoolName), school_slug: slug, status }, { onConflict: 'user_id,school_slug' }).then();
  };

  const toggleTracker = (schoolName: string) => {
    const slug = toSlug(schoolName);
    setTrackerOpen(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const saveTrackerField = async (schoolName: string, fields: Record<string, unknown>) => {
    if (!user) return;
    const slug = toSlug(schoolName);
    const { error } = await createClient()
      .from('applications')
      .update(fields)
      .eq('user_id', user.id)
      .eq('school_slug', slug);
    if (error) {
      // Row might not exist yet (e.g. opened tracker before running a search). Fall back to upsert.
      await createClient().from('applications').upsert(
        { user_id: user.id, school_name: cleanText(schoolName), school_slug: slug, ...fields },
        { onConflict: 'user_id,school_slug' }
      );
    }
  };

  const updateTrackerDoc = (schoolName: string, docKey: string, checked: boolean) => {
    const slug = toSlug(schoolName);
    const updated = { ...(appDocuments[slug] || {}), [docKey]: checked };
    setAppDocuments(prev => ({ ...prev, [slug]: updated }));
    saveTrackerField(schoolName, { documents: updated });
  };

  const updateTrackerDeadline = (schoolName: string, deadline: string) => {
    const slug = toSlug(schoolName);
    setAppDeadlines(prev => ({ ...prev, [slug]: deadline }));
    saveTrackerField(schoolName, { deadline });
  };

  const updateTrackerNote = (schoolName: string, notes: string) => {
    const slug = toSlug(schoolName);
    setAppNotes(prev => ({ ...prev, [slug]: notes }));
    saveTrackerField(schoolName, { notes });
  };

  const applyFiltersAndSort = (list: SchoolMatch[], f: FilterOptions, by: 'match' | 'tuition' | 'admit') => {
    let filtered = list.filter(school => {
      const tuition = parseInt((school.tuition || '').replace(/[^0-9]/g, '') || '0') || school.tuition_instate || 0;
      const location = (school.location || '').toLowerCase();
      const ar = school.acceptance_rate || parseFloat((school.admissionRate || '').replace(/[^0-9.]/g, '') || '50');
      const policy = (school.test_policy || '').toLowerCase();

      if (f.tier !== 'all' && school.tier !== f.tier) return false;
      if (f.budgetRange !== 'all') {
        if (f.budgetRange === 'under30k' && tuition >= 30000) return false;
        if (f.budgetRange === '30k-50k' && (tuition < 30000 || tuition >= 50000)) return false;
        if (f.budgetRange === '50k-70k' && (tuition < 50000 || tuition >= 70000)) return false;
        if (f.budgetRange === 'over70k' && tuition < 70000) return false;
      }
      if (f.location !== 'all') {
        if (f.location === 'usa' && !location.match(/,\s*[a-z]{2}$/i) && !location.includes('united states')) return false;
        if (f.location === 'canada' && !location.includes('canada')) return false;
        if (f.location === 'uk' && !location.includes('uk') && !location.includes('united kingdom') && !location.includes('england')) return false;
        if (f.location === 'europe' && !['germany','france','netherlands','sweden','switzerland'].some(c => location.includes(c))) return false;
        if (f.location === 'australia' && !location.includes('australia')) return false;
      }
      if (f.successRate !== 'all') {
        if (f.successRate === 'accessible' && ar < 50) return false;
        if (f.successRate === 'selective' && (ar < 20 || ar >= 50)) return false;
        if (f.successRate === 'elite' && ar >= 20) return false;
      }
      if (f.testPolicy !== 'all') {
        if (f.testPolicy === 'optional' && !policy.includes('optional')) return false;
        if (f.testPolicy === 'required' && !policy.includes('required')) return false;
        if (f.testPolicy === 'free' && !policy.includes('free')) return false;
      }
      return true;
    });

    if (by === 'match') {
      const TIER_ORDER: Record<string, number> = { safety: 0, target: 1, reach: 2 };
      filtered.sort((a, b) => {
        const ta = TIER_ORDER[a.tier || 'target'] ?? 1;
        const tb = TIER_ORDER[b.tier || 'target'] ?? 1;
        if (ta !== tb) return ta - tb;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
    } else if (by === 'tuition') {
      filtered.sort((a, b) => {
        const ta = parseInt((a.tuition || '').replace(/[^0-9]/g, '') || '0') || a.tuition_instate || 0;
        const tb = parseInt((b.tuition || '').replace(/[^0-9]/g, '') || '0') || b.tuition_instate || 0;
        return ta - tb;
      });
    } else if (by === 'admit') {
      filtered.sort((a, b) => {
        const ra = b.acceptance_rate || parseFloat((b.admissionRate || '').replace(/[^0-9.]/g, '') || '0');
        const rb = a.acceptance_rate || parseFloat((a.admissionRate || '').replace(/[^0-9.]/g, '') || '0');
        return ra - rb;
      });
    }
    return filtered;
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFilteredResults(applyFiltersAndSort(results, newFilters, sortBy));
  };

  const handleSort = (by: 'match' | 'tuition' | 'admit') => {
    setSortBy(by);
    setFilteredResults(applyFiltersAndSort(filteredResults, filters, by));
  };

  const handleSchoolClick = (s: SchoolMatch) => {
    setLoadingSchool({ name: cleanText(s.name), program: cleanText(s.program) || 'General Admission', matchScore: s.matchScore || 0, location: cleanText(s.location) });
    setTimeout(() => router.push('/dashboard/school/' + toSlug(s.name)), 1900);
  };

  const isSel = (n: string) => comparison.schools.some(s => s.name === n);

  const modes = [
    { id: 'domestic' as const, label: 'Domestic', icon: Home },
    { id: 'international' as const, label: 'International', icon: Globe },
  ];

  if (loading || checking) return (
    <div style={{ background: '#F5EDE5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8C2D35' }} />
    </div>
  );
  if (!profile) return null;

  // ── Card renderer ──────────────────────────────────────────────────────────
  const renderCard = (school: SchoolMatch, idx: number) => {
    const sc = school.matchScore || 0;
    const selected = isSel(school.name);
    const fav = favorites.has(cleanText(school.name));
    const budgetMax = profile?.budget?.perYear || (profile?.budget?.max ? Number(profile.budget.max) : null);
    const tuitionNum = parseInt((school.tuition || '').replace(/[^0-9]/g, '') || '0') || school.tuition_instate || 0;
    const withinBudget = budgetMax && tuitionNum > 0 && tuitionNum <= budgetMax;
    const tier = school.tier || 'target';
    const tierCfg = TIER_CONFIG[tier];
    const appStatus = applicationStatuses[cleanText(school.name)] || '';
    const appCfg = APP_STATUS_CONFIG[appStatus];
    const isStatusOpen = statusDropdown === school.name;
    const slug = toSlug(school.name);
    const isTrackerOpen = trackerOpen.has(slug);
    const docs = appDocuments[slug] || {};
    const deadline = appDeadlines[slug] || '';
    const notes = appNotes[slug] || '';
    const daysLeft = deadline ? Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000) : null;
    const incompleteDocs = TRACKER_DOCS.filter(d => !docs[d.key]).length;
    const showDeadlineWarning = daysLeft !== null && daysLeft <= 7 && incompleteDocs > 0;

    return (
      <div
        key={`${school.name}-${idx}`}
        onClick={() => handleSchoolClick(school)}
        style={{
          background: selected ? 'rgba(140,45,53,0.06)' : 'rgba(140,45,53,0.04)',
          border: `1px solid ${selected ? 'rgba(140,45,53,0.25)' : 'rgba(140,45,53,0.10)'}`,
          borderRadius: '20px', overflow: 'hidden',
          cursor: 'pointer', display: 'flex', flexDirection: 'column',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-3px)';
          el.style.boxShadow = '0 12px 32px rgba(140,45,53,0.12)';
          el.style.borderColor = selected ? 'rgba(140,45,53,0.4)' : 'rgba(140,45,53,0.15)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          el.style.borderColor = selected ? 'rgba(140,45,53,0.25)' : 'rgba(140,45,53,0.10)';
        }}
      >
        {/* Tier accent bar */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${tierCfg.color}80, transparent)` }} />

        {/* Card header */}
        <div style={{ padding: '20px 22px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Tier badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.4)' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tierCfg.color, display: 'inline-block', flexShrink: 0 }} />
                  {tier}
                </span>
                {school.test_policy && (
                  <span style={{
                    fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px',
                    color: 'rgba(28,10,12,0.5)',
                    background: 'rgba(140,45,53,0.05)',
                    border: '1px solid rgba(140,45,53,0.12)',
                  }}>
                    {school.test_policy}
                  </span>
                )}
              </div>

              <h3 style={{
                fontSize: '17px', fontWeight: 600, color: '#1C0A0C',
                letterSpacing: '-0.01em', lineHeight: 1.3, margin: '0 0 6px',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {cleanText(school.name)}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {school.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.6)' }}>
                    <MapPin style={{ width: '11px', height: '11px', opacity: 0.7 }} />
                    {cleanText(school.location)}
                  </span>
                )}
                {school.program_rank && (
                  <>
                    <span style={{ color: 'rgba(28,10,12,0.15)', fontSize: '11px' }}>·</span>
                    <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(28,10,12,0.5)', background: 'rgba(140,45,53,0.05)', padding: '2px 7px', borderRadius: '100px', border: '1px solid rgba(140,45,53,0.12)' }}>
                      {cleanText(school.program_rank)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Score badge */}
            <div style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '54px', height: '54px', borderRadius: '14px',
              background: 'rgba(140,45,53,0.05)',
              border: '1px solid rgba(140,45,53,0.12)',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1C0A0C', lineHeight: 1, letterSpacing: '-0.02em' }}>{sc}%</span>
              <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(28,10,12,0.45)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: '4px' }}>match</span>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ height: '1px', background: 'rgba(140,45,53,0.08)', margin: '0 22px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            {
              label: 'Tuition / yr',
              value: school.tuition ? cleanText(school.tuition) : (school.tuition_instate ? `$${(school.tuition_instate / 1000).toFixed(0)}k` : '—'),
              color: '#1C0A0C',
            },
            {
              label: 'Admit Rate',
              value: school.acceptance_rate ? `${school.acceptance_rate.toFixed(0)}%` : (school.admissionRate ? cleanText(school.admissionRate) : '—'),
              color: 'rgba(28,10,12,0.75)',
            },
            {
              label: '10yr Salary',
              value: school.median_earnings_10yr ? `$${(school.median_earnings_10yr / 1000).toFixed(0)}k` : (school.avgSalary ? cleanText(school.avgSalary) : '—'),
              color: 'rgba(28,10,12,0.75)',
            },
          ].map((m, i) => (
            <div key={i} style={{ padding: '12px 0', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(140,45,53,0.08)' : undefined }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.42)', margin: '0 0 5px' }}>{m.label}</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Why matched */}
        {school.why_matched && (
          <>
            <div style={{ height: '1px', background: 'rgba(140,45,53,0.08)', margin: '0 22px' }} />
            <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
              <Sparkles style={{ width: '12px', height: '12px', color: '#8C2D35', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.7)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {school.why_matched}
              </p>
            </div>
          </>
        )}

        {/* Concern */}
        {school.concern && (
          <div style={{ padding: '8px 14px 12px' }}>
            <div style={{ padding: '9px 13px', borderRadius: '10px', background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(140,45,53,0.5)', flexShrink: 0, marginTop: '1px' }}>◈</span>
              <p style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(28,10,12,0.72)', lineHeight: 1.6, margin: 0 }}>
                {school.concern}
              </p>
            </div>
          </div>
        )}

        {/* Badges */}
        {(school.scholarships || withinBudget) && (
          <>
            <div style={{ height: '1px', background: 'rgba(140,45,53,0.08)', margin: '0 22px' }} />
            <div style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(140,45,53,0.07)', color: '#1C0A0C', border: '1px solid rgba(140,45,53,0.18)' }}>
                <ShieldCheck style={{ width: '10px', height: '10px', color: '#8C2D35' }} />$0 Commission
              </span>
              {withinBudget && (
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(140,45,53,0.09)', color: '#8C2D35', border: '1px solid rgba(140,45,53,0.22)' }}>
                  Within Budget
                </span>
              )}
              {school.scholarships && school.scholarships.toLowerCase() !== 'none' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(140,45,53,0.07)', color: '#1C0A0C', border: '1px solid rgba(140,45,53,0.18)' }}>
                  <Award style={{ width: '10px', height: '10px', color: '#8C2D35' }} />{cleanText(school.scholarships)}
                </span>
              )}
              {school.deadline && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'rgba(140,45,53,0.07)', color: '#1C0A0C', border: '1px solid rgba(140,45,53,0.18)' }}>
                  <Calendar style={{ width: '10px', height: '10px', color: '#8C2D35' }} />Due {cleanText(school.deadline)}
                </span>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '12px 22px', borderTop: '1px solid rgba(140,45,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              onClick={e => { e.stopPropagation(); toggleFavorite(school); }}
              style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: fav ? 'rgba(244,114,182,0.12)' : 'rgba(140,45,53,0.05)', border: fav ? '1px solid rgba(244,114,182,0.3)' : '1px solid rgba(140,45,53,0.10)', color: fav ? '#f472b6' : 'rgba(28,10,12,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <Heart style={{ width: '12px', height: '12px', fill: fav ? 'currentColor' : 'none' }} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); toggleCompare(school); }}
              style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected ? 'rgba(140,45,53,0.18)' : 'rgba(140,45,53,0.05)', border: selected ? '1px solid rgba(140,45,53,0.4)' : '1px solid rgba(140,45,53,0.10)', color: selected ? '#8C2D35' : 'rgba(28,10,12,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {selected ? <Check style={{ width: '12px', height: '12px' }} /> : <Plus style={{ width: '12px', height: '12px' }} />}
            </button>

            {/* Application status */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); setStatusDropdown(prev => prev === school.name ? null : school.name); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  height: '30px', padding: '0 10px', borderRadius: '15px',
                  fontSize: '11px', fontWeight: 500,
                  background: appCfg ? appCfg.bg : 'rgba(140,45,53,0.05)',
                  border: `1px solid ${appCfg ? appCfg.border : 'rgba(140,45,53,0.10)'}`,
                  color: appCfg ? appCfg.color : 'rgba(28,10,12,0.3)',
                  cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
                }}>
                {appStatus && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: appCfg?.color, flexShrink: 0, display: 'inline-block' }} />}
                <span>{appStatus ? appCfg?.label : 'Track'}</span>
                <ChevronDown style={{ width: '9px', height: '9px', opacity: 0.6 }} />
              </button>

              {isStatusOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: 'absolute', bottom: '36px', left: 0, zIndex: 200,
                    background: '#FAF5F0', border: '1px solid rgba(140,45,53,0.15)',
                    borderRadius: '12px', padding: '6px', minWidth: '160px',
                    boxShadow: '0 8px 24px rgba(140,45,53,0.12)',
                  }}>
                  {Object.entries(APP_STATUS_CONFIG).map(([val, cfg]) => (
                    <button
                      key={val}
                      onClick={e => { e.stopPropagation(); updateApplicationStatus(school.name, val); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 10px', borderRadius: '8px', border: 'none',
                        background: appStatus === val ? `${cfg.bg}` : 'transparent',
                        color: appStatus === val ? cfg.color : 'rgba(28,10,12,0.6)',
                        fontSize: '12px', fontWeight: appStatus === val ? 600 : 400,
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { if (appStatus !== val) (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.08)'; }}
                      onMouseLeave={e => { if (appStatus !== val) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, flexShrink: 0, display: 'inline-block' }} />
                      <span>{cfg.label}</span>
                    </button>
                  ))}
                  {appStatus && (
                    <>
                      <div style={{ height: '1px', background: 'rgba(140,45,53,0.10)', margin: '4px 0' }} />
                      <button
                        onClick={e => { e.stopPropagation(); updateApplicationStatus(school.name, ''); }}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(28,10,12,0.3)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                        Clear status
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, color: 'rgba(28,10,12,0.55)', transition: 'color 0.2s ease', letterSpacing: '-0.01em' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1C0A0C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.55)')}>
              Deep Dive <ChevronRight style={{ width: '14px', height: '14px' }} />
            </span>
            <button
              onClick={e => { e.stopPropagation(); toggleTracker(school.name); }}
              title="Application tracker"
              style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTrackerOpen ? 'rgba(140,45,53,0.10)' : 'rgba(140,45,53,0.05)', border: `1px solid ${isTrackerOpen ? 'rgba(140,45,53,0.25)' : 'rgba(140,45,53,0.10)'}`, color: isTrackerOpen ? '#8C2D35' : 'rgba(28,10,12,0.3)', cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}>
              {isTrackerOpen ? <ChevronUp style={{ width: '11px', height: '11px' }} /> : <ChevronDown style={{ width: '11px', height: '11px' }} />}
            </button>
          </div>
        </div>

        {/* Application Tracker */}
        {isTrackerOpen && (
          <div
            onClick={e => e.stopPropagation()}
            style={{ borderTop: '1px solid rgba(140,45,53,0.10)', background: 'rgba(250,245,240,0.6)', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {showDeadlineWarning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.40)', color: '#92400E' }}>
                <AlertTriangle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontWeight: 500 }}>
                  {daysLeft! <= 0 ? 'Deadline passed' : `Deadline in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`} — {incompleteDocs} doc{incompleteDocs === 1 ? '' : 's'} still missing
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.38)', flexShrink: 0 }}>Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={e => { e.stopPropagation(); updateTrackerDeadline(school.name, e.target.value); }}
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, fontSize: '12px', color: deadline ? '#1C0A0C' : 'rgba(28,10,12,0.3)', background: 'transparent', border: '1px solid rgba(140,45,53,0.15)', borderRadius: '6px', padding: '5px 8px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
              />
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.38)', margin: '0 0 8px' }}>Documents</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                {TRACKER_DOCS.map(doc => (
                  <label key={doc.key} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!docs[doc.key]}
                      onChange={e => { e.stopPropagation(); updateTrackerDoc(school.name, doc.key, e.target.checked); }}
                      style={{ accentColor: '#8C2D35', width: '13px', height: '13px', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 300, color: docs[doc.key] ? 'rgba(28,10,12,0.38)' : 'rgba(28,10,12,0.7)', textDecoration: docs[doc.key] ? 'line-through' : 'none', lineHeight: 1.3 }}>
                      {doc.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.38)', margin: '0 0 6px' }}>Notes</p>
              <textarea
                placeholder="Add notes..."
                value={notes}
                onClick={e => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); setAppNotes(prev => ({ ...prev, [slug]: e.target.value })); }}
                onBlur={e => updateTrackerNote(school.name, e.target.value)}
                rows={2}
                style={{ width: '100%', resize: 'none', fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.75)', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(140,45,53,0.12)', borderRadius: '8px', padding: '8px 10px', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(28,10,12,0.42)' }}>
                {TRACKER_DOCS.length - incompleteDocs}/{TRACKER_DOCS.length} docs ready
              </span>
              {appStatus && appCfg && (
                <span style={{ fontSize: '11px', fontWeight: 500, color: appCfg.color, background: appCfg.bg, border: `1px solid ${appCfg.border}`, padding: '2px 8px', borderRadius: '100px' }}>
                  {appCfg.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Active Applications command center strip ───────────────────────────────
  const renderTrackerStrip = () => {
    const activeSchools = results.filter(s =>
      TRACKER_ACTIVE_STATUSES.includes(applicationStatuses[cleanText(s.name)] || '')
    );
    if (activeSchools.length === 0) return null;

    return (
      <div style={{ borderRadius: '16px', border: '1px solid rgba(140,45,53,0.14)', background: 'rgba(140,45,53,0.025)', overflow: 'hidden' }}>
        {/* Header — collapses/expands the strip */}
        <button
          onClick={() => setTrackerStripOpen(p => !p)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderBottom: trackerStripOpen ? '1px solid rgba(140,45,53,0.08)' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '13px', height: '13px', color: '#8C2D35' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1C0A0C' }}>Active Applications</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(28,10,12,0.5)', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.12)', padding: '1px 7px', borderRadius: '100px' }}>{activeSchools.length}</span>
          </div>
          {trackerStripOpen
            ? <ChevronUp style={{ width: '13px', height: '13px', color: 'rgba(28,10,12,0.35)' }} />
            : <ChevronDown style={{ width: '13px', height: '13px', color: 'rgba(28,10,12,0.35)' }} />}
        </button>

        {/* Rows */}
        {trackerStripOpen && (
          <div>
            {activeSchools.map((school, idx) => {
              const slug = toSlug(school.name);
              const appStatus = applicationStatuses[cleanText(school.name)] || '';
              const appCfg = APP_STATUS_CONFIG[appStatus];
              const docs = appDocuments[slug] || {};
              const userDeadline = appDeadlines[slug] || '';
              const docsComplete = TRACKER_DOCS.filter(d => !!docs[d.key]).length;
              const missingDocs = TRACKER_DOCS.filter(d => !docs[d.key]);
              const deadlineInfo = userDeadline ? getDeadlineInfo(userDeadline) : null;
              const showUrgency = missingDocs.length > 0 && deadlineInfo !== null && deadlineInfo.days < 30;
              const isStripDropOpen = statusDropdown === school.name + '_strip';
              const tierCfg = TIER_CONFIG[school.tier || 'target'];

              return (
                <div key={slug} style={{ borderTop: idx > 0 ? '1px solid rgba(140,45,53,0.06)' : 'none', padding: showUrgency ? '11px 20px 10px' : '11px 20px' }}>
                  {/* Main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Tier badge + name */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: tierCfg.color, background: `${tierCfg.color}18`, border: `1px solid ${tierCfg.color}28`, padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        {school.tier || 'target'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C0A0C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cleanText(school.name)}
                      </span>
                    </div>

                    {/* Inline status dropdown */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        onClick={e => { e.stopPropagation(); setStatusDropdown(p => p === school.name + '_strip' ? null : school.name + '_strip'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '26px', padding: '0 9px', borderRadius: '13px', fontSize: '11px', fontWeight: 500, background: appCfg ? appCfg.bg : 'rgba(140,45,53,0.05)', border: `1px solid ${appCfg ? appCfg.border : 'rgba(140,45,53,0.12)'}`, color: appCfg ? appCfg.color : 'rgba(28,10,12,0.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: appCfg?.color || 'rgba(28,10,12,0.3)', flexShrink: 0, display: 'inline-block' }} />
                        <span>{appCfg?.label || 'Set status'}</span>
                        <ChevronDown style={{ width: '9px', height: '9px', opacity: 0.6 }} />
                      </button>
                      {isStripDropOpen && (
                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '30px', left: 0, zIndex: 300, background: '#FAF5F0', border: '1px solid rgba(140,45,53,0.15)', borderRadius: '12px', padding: '6px', minWidth: '160px', boxShadow: '0 8px 24px rgba(140,45,53,0.12)' }}>
                          {Object.entries(APP_STATUS_CONFIG).map(([val, cfg]) => (
                            <button key={val} onClick={e => { e.stopPropagation(); updateApplicationStatus(school.name, val); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: appStatus === val ? cfg.bg : 'transparent', color: appStatus === val ? cfg.color : 'rgba(28,10,12,0.6)', fontSize: '12px', fontWeight: appStatus === val ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, flexShrink: 0, display: 'inline-block' }} />
                              <span>{cfg.label}</span>
                            </button>
                          ))}
                          {appStatus && (
                            <>
                              <div style={{ height: '1px', background: 'rgba(140,45,53,0.10)', margin: '4px 0' }} />
                              <button onClick={e => { e.stopPropagation(); updateApplicationStatus(school.name, ''); }}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(28,10,12,0.3)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                                Clear status
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Doc progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <div style={{ width: '44px', height: '3px', background: 'rgba(28,10,12,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(docsComplete / TRACKER_DOCS.length) * 100}%`, background: docsComplete === TRACKER_DOCS.length ? '#059669' : '#8C2D35', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(28,10,12,0.42)', whiteSpace: 'nowrap' }}>{docsComplete}/{TRACKER_DOCS.length}</span>
                    </div>

                    {/* Deadline pill */}
                    <div style={{ flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>
                      {deadlineInfo ? (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: deadlineInfo.color, background: deadlineInfo.bg, border: `1px solid ${deadlineInfo.border}`, padding: '2px 9px', borderRadius: '100px' }}>
                          {deadlineInfo.label}
                        </span>
                      ) : school.deadline ? (
                        <span style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(28,10,12,0.38)' }}>{cleanText(school.deadline)}</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'rgba(28,10,12,0.22)' }}>No deadline</span>
                      )}
                    </div>

                    {/* Deep dive arrow */}
                    <button onClick={() => handleSchoolClick(school)}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(28,10,12,0.28)', borderRadius: '6px', transition: 'color 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.28)')}>
                      <ChevronRight style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>

                  {/* Urgency flag row */}
                  {showUrgency && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px', paddingLeft: '2px' }}>
                      <AlertTriangle style={{ width: '10px', height: '10px', color: '#DC2626', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 400 }}>
                        {missingDocs[0].label} not started{missingDocs.length > 1 ? ` +${missingDocs.length - 1} more` : ''}
                      </span>
                      <button
                        onClick={() => toggleTracker(school.name)}
                        style={{ fontSize: '10px', fontWeight: 500, color: '#8C2D35', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.20)', padding: '2px 9px', borderRadius: '100px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Open tracker
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Tier section renderer ──────────────────────────────────────────────────
  const renderTierSection = (tier: 'safety' | 'target' | 'reach') => {
    const schools = filteredResults.filter(s => s.tier === tier);
    if (schools.length === 0) return null;
    const cfg = TIER_CONFIG[tier];

    return (
      <div key={tier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(140,45,53,0.08)' }}>
          <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: cfg.color, flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1C0A0C' }}>{cfg.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(28,10,12,0.55)' }}>{schools.length}</span>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.52)', margin: '2px 0 0', lineHeight: 1.5 }}>{cfg.desc}</p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: '12px' }}>
          {schools.map((school, idx) => renderCard(school, idx))}
        </div>
      </div>
    );
  };

  const activeTierFilter = filters.tier;

  return (
    <div style={{ background: '#F5EDE5', minHeight: '100vh' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(140,45,53,0.07) 0%, transparent 60%)', zIndex: 0 }} />

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,237,229,0.92)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', borderBottom: '1px solid rgba(140,45,53,0.10)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#1C0A0C', letterSpacing: '-0.01em', margin: 0 }}>
            {profile.full_name || 'Dashboard'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '12px', background: 'rgba(140,45,53,0.10)' }}>
              {modes.map(m => {
                const I = m.icon;
                const active = profile.mode === m.id || (profile.mode === 'lifelong' && m.id === 'international');
                return (
                  <button key={m.id} onClick={() => handleModeChange(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: active ? 'rgba(140,45,53,0.15)' : 'transparent', color: active ? '#1C0A0C' : 'rgba(28,10,12,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}>
                    <I style={{ width: '14px', height: '14px' }} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => router.push('/dashboard/edit-profile')}
              style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(28,10,12,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', transition: 'color 0.2s ease', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1C0A0C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.4)')}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Profile context pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '48px' }}>
          {[
            { label: 'Major', value: profile.academic_background?.major || '—' },
            { label: 'Budget', value: profile.budget?.perYear ? `$${Number(profile.budget.perYear).toLocaleString()}/yr` : profile.budget?.max ? `$${Number(profile.budget.max).toLocaleString()}/yr` : '—' },
            { label: 'GPA', value: profile.academic_background?.gpa || '—' },
            { label: 'Mode', value: profile.mode === 'domestic' ? 'Domestic' : 'International' },
            ...(profile.location_preferences?.residenceState ? [{ label: 'State', value: profile.location_preferences.residenceState }] : []),
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.10)', fontSize: '12px', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'rgba(28,10,12,0.55)' }}>{item.label}</span>
              <span style={{ color: '#1C0A0C', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* ─── EMPTY STATE ─── */}
        {!searching && results.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '56px', paddingTop: '40px' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', marginBottom: '28px', background: 'rgba(140,45,53,0.1)', border: '1px solid rgba(140,45,53,0.25)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8C2D35' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8C2D35', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Matching Engine Ready
              </div>
              <h2 style={{ fontSize: 'clamp(40px,7vw,72px)', fontWeight: 300, color: '#1C0A0C', lineHeight: 1.07, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
                Find your{' '}
                <span style={{ fontWeight: 600, color: '#8C2D35', WebkitTextFillColor: '#8C2D35' }}>
                  perfect school.
                </span>
              </h2>
              <p style={{ fontSize: '17px', fontWeight: 300, color: 'rgba(28,10,12,0.45)', lineHeight: 1.65, margin: 0 }}>
                Real-time matching across 15,000+ programs — 20 personalized schools in three strategic tiers.
              </p>
            </div>

            {/* Tier preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', width: '100%', maxWidth: '520px' }}>
              {(['safety', 'target', 'reach'] as const).map(t => {
                const cfg = TIER_CONFIG[t];
                return (
                  <div key={t} style={{ padding: '20px 16px', textAlign: 'center', background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.09)', borderRadius: '16px' }}>
                    <div style={{ width: '24px', height: '3px', borderRadius: '2px', background: cfg.color, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: '#1C0A0C', margin: '0 0 3px' }}>
                      {t === 'safety' ? '6 Schools' : t === 'target' ? '8 Schools' : '6 Schools'}
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(28,10,12,0.4)', margin: 0, textTransform: 'capitalize' }}>{t}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              {[{ value: '15K+', label: 'Programs' }, { value: '20', label: 'Schools' }, { value: '0%', label: 'Commission' }, { value: 'Live', label: 'Data' }].map((s, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '28px', fontWeight: 300, color: '#1C0A0C', margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.28)', margin: '6px 0 0' }}>{s.label}</p>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: '1px', height: '28px', background: 'rgba(140,45,53,0.12)' }} />}
                </div>
              ))}
            </div>

            <button
              onClick={searchSchools}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '0 36px', height: '56px', borderRadius: '100px', background: '#8C2D35', color: '#F5EDE5', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', boxShadow: '0 0 40px rgba(140,45,53,0.25), 0 4px 24px rgba(0,0,0,0.12)', transition: 'all 0.3s ease', fontFamily: 'inherit' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1.03)'; el.style.boxShadow = '0 0 60px rgba(140,45,53,0.35), 0 8px 32px rgba(0,0,0,0.18)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1)'; el.style.boxShadow = '0 0 40px rgba(140,45,53,0.25), 0 4px 24px rgba(0,0,0,0.12)'; }}>
              <Search style={{ width: '18px', height: '18px', opacity: 0.85 }} />
              Analyze & Match
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}

        {/* ─── LOADING STATE ─── */}
        {searching && (
          <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '52px' }}>
            <div style={{ position: 'relative', width: '88px', height: '88px' }}>
              <div style={{ position: 'absolute', inset: '-16px', borderRadius: '50%', border: '1px solid rgba(140,45,53,0.15)', animation: 'orb-ring 2.4s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid rgba(140,45,53,0.22)', animation: 'orb-ring 2.4s ease-out infinite 0.8s' }} />
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(140,45,53,0.18),rgba(140,45,53,0.12))', border: '1px solid rgba(140,45,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(140,45,53,0.25)' }}>
                <Sparkles style={{ width: '32px', height: '32px', color: '#8C2D35', animation: 'sparkle-rotate 3s linear infinite' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '320px' }}>
              {SEARCH_STEPS.map((step, i) => {
                const completed = i < searchStep, active = i === searchStep, pending = i > searchStep;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: pending ? 0.25 : 1, transition: 'opacity 0.5s ease' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: completed ? 'rgba(140,45,53,0.10)' : active ? 'rgba(140,45,53,0.15)' : 'rgba(140,45,53,0.05)', border: completed ? '1px solid rgba(140,45,53,0.3)' : active ? '1px solid rgba(140,45,53,0.4)' : '1px solid rgba(140,45,53,0.12)', transition: 'all 0.4s ease' }}>
                      {completed ? <Check style={{ width: '12px', height: '12px', color: '#8C2D35' }} /> : active ? <Loader2 style={{ width: '12px', height: '12px', color: '#8C2D35', animation: 'spin 1s linear infinite' }} /> : <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(28,10,12,0.2)' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: active ? 500 : 400, color: completed ? '#8C2D35' : active ? '#1C0A0C' : 'rgba(28,10,12,0.65)', margin: 0, transition: 'color 0.4s ease' }}>{step.label}</p>
                      {active && <p style={{ fontSize: '11px', color: 'rgba(28,10,12,0.5)', margin: '2px 0 0', fontWeight: 300 }}>{step.sub}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {results.length > 0 && !searching && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.5)', margin: '0 0 6px' }}>Rivernova · Zero Commission</p>
                  <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 300, color: '#1C0A0C', letterSpacing: '-0.02em', margin: 0 }}>
                    {filteredResults.length} <strong style={{ fontWeight: 600 }}>matches</strong>
                  </h2>
                </div>
                <button onClick={searchSchools}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 400, color: 'rgba(28,10,12,0.65)', background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.10)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#1C0A0C'; el.style.background = 'rgba(140,45,53,0.10)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(28,10,12,0.65)'; el.style.background = 'rgba(140,45,53,0.05)'; }}>
                  <Search style={{ width: '13px', height: '13px' }} /> Re-analyze
                </button>
              </div>

              {/* Tier summary row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                {(['safety', 'target', 'reach'] as const).map(t => {
                  const cfg = TIER_CONFIG[t];
                  const count = results.filter(s => s.tier === t).length;
                  if (count === 0) return null;
                  return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '10px', border: '1px solid rgba(140,45,53,0.10)', background: 'rgba(140,45,53,0.03)' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C0A0C' }}>{count}</span>
                      <span style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.6)' }}>{t}</span>
                    </div>
                  );
                })}
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C0A0C' }}>{Math.round(results.reduce((a, b) => a + (b.matchScore || 0), 0) / results.length)}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(28,10,12,0.55)' }}>avg match</span>
                </div>
              </div>
            </div>

            {/* Active Applications command center */}
            {renderTrackerStrip()}

            {/* Filters */}
            <MatchFilters onFilterChange={handleFilterChange} />

            {/* Sort row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.45)', marginRight: '4px' }}>Sort</span>
              {[{ key: 'match' as const, label: 'Best Match' }, { key: 'tuition' as const, label: 'Lowest Cost' }, { key: 'admit' as const, label: 'Highest Admit' }].map(s => (
                <button key={s.key} onClick={() => handleSort(s.key)}
                  style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: sortBy === s.key ? 500 : 400, background: sortBy === s.key ? 'rgba(140,45,53,0.14)' : 'transparent', border: sortBy === s.key ? '1px solid rgba(140,45,53,0.4)' : '1px solid rgba(140,45,53,0.10)', color: sortBy === s.key ? '#8C2D35' : 'rgba(28,10,12,0.4)', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Tiered or flat display */}
            {activeTierFilter === 'all' && sortBy === 'match' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                {renderTierSection('safety')}
                {renderTierSection('target')}
                {renderTierSection('reach')}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: '12px' }}>
                {filteredResults.map((school, idx) => renderCard(school, idx))}
              </div>
            )}

            {filteredResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(28,10,12,0.35)' }}>
                <p style={{ fontSize: '15px', fontWeight: 300 }}>No schools match your current filters.</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Try adjusting your filters above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ComparisonBar
        selectedSchools={comparison.schools}
        onViewComparison={() => setComparison(p => ({ ...p, isOpen: true }))}
        onRemoveSchool={n => setComparison(p => ({ ...p, schools: p.schools.filter(s => s.name !== n) }))}
      />
      {comparison.isOpen && profile && (
        <ComparisonModal
          schools={comparison.schools}
          userProfile={profile}
          onClose={() => setComparison(p => ({ ...p, isOpen: false }))}
        />
      )}

      {loadingSchool && <SchoolLoadingOverlay school={loadingSchool} />}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes orb-ring { 0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.5);opacity:0} }
        @keyframes sparkle-rotate { 0%{transform:rotate(0deg)scale(1)}50%{transform:rotate(180deg)scale(1.1)}100%{transform:rotate(360deg)scale(1)} }
        @keyframes overlayIn { from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)} }
        @keyframes textSlideIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes progressFill { from{width:0%}to{width:100%} }
        @keyframes spinSlow { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes spinMed { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes haloPulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.07)} }
        @keyframes floatA { 0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)}50%{transform:translateY(10px)} }
        @keyframes floatC { 0%,100%{transform:translateY(-6px)}50%{transform:translateY(8px)} }
        *{scrollbar-width:thin;scrollbar-color:rgba(140,45,53,0.25) rgba(245,237,229,0.5)}
      `}</style>
    </div>
  );
}

function SchoolLoadingOverlay({ school }: { school: { name: string; program: string; matchScore: number; location: string } }) {
  const [ringFilled, setRingFilled] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRingFilled(true), 80); return () => clearTimeout(t); }, []);

  const sc = school.matchScore;
  const ringR = 80, ringC = 2 * Math.PI * ringR;
  const ringOffset = ringFilled ? ringC - (sc / 100) * ringC : ringC;
  const floatAnims = ['floatA','floatB','floatC','floatB','floatA','floatC'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#F5EDE5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'overlayIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 65% 55% at 50% 44%, rgba(140,45,53,0.07) 0%, transparent 58%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 40% 35% at 50% 44%, rgba(140,45,53,0.04) 0%, transparent 55%)' }} />
      {([{ top:'12%',left:'8%',size:8,opacity:0.07,blur:0,anim:0 },{ top:'18%',right:'12%',size:5,opacity:0.05,blur:1,anim:1 },{ top:'72%',left:'14%',size:6,opacity:0.04,blur:1,anim:2 },{ top:'68%',right:'9%',size:10,opacity:0.06,blur:0,anim:3 },{ top:'40%',left:'5%',size:4,opacity:0.04,blur:2,anim:4 },{ top:'38%',right:'6%',size:7,opacity:0.05,blur:1,anim:5 }] as any[]).map((orb,i)=>(
        <div key={i} style={{ position:'absolute', top:orb.top, left:orb.left, right:orb.right, width:orb.size, height:orb.size, borderRadius:'50%', background:`rgba(140,45,53,${orb.opacity})`, filter:`blur(${orb.blur}px)`, animation:`${floatAnims[orb.anim]} ${3.5+i*0.6}s ease-in-out infinite` }} />
      ))}
      <div style={{ position:'relative', marginBottom:'40px', animation:'textSlideIn 0.5s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ position:'absolute', inset:'-32px', borderRadius:'50%', background:'radial-gradient(circle,rgba(140,45,53,0.08) 0%,transparent 58%)', animation:'haloPulse 2.8s ease-in-out infinite', pointerEvents:'none' }} />
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform:'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ol-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8C2D35" stopOpacity="1"/><stop offset="100%" stopColor="#8C2D35" stopOpacity="0.55"/></linearGradient>
          </defs>
          <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(140,45,53,0.06)" strokeWidth="1" strokeDasharray="3 8" style={{ animation:'spinSlow 12s linear infinite', transformOrigin:'100px 100px' }} />
          <circle cx="100" cy="100" r={ringR} fill="none" stroke="rgba(140,45,53,0.09)" strokeWidth="12" />
          <circle cx="100" cy="100" r={ringR} fill="none" stroke="url(#ol-grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringOffset} style={{ transition:'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }} />
          <circle cx="100" cy="100" r={ringR+13} fill="none" stroke="rgba(140,45,53,0.10)" strokeWidth="1.5" strokeDasharray="28 502" strokeLinecap="round" style={{ animation:'spinMed 3s linear infinite', transformOrigin:'100px 100px' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'52px', fontWeight:700, color:'#1C0A0C', letterSpacing:'-0.05em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{sc}</span>
          <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(28,10,12,0.5)', marginTop:'6px' }}>Match</span>
        </div>
      </div>
      <div style={{ padding:'6px 20px', borderRadius:'100px', background:'rgba(140,45,53,0.07)', border:'1px solid rgba(140,45,53,0.18)', fontSize:'11px', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'#8C2D35', marginBottom:'28px', animation:'textSlideIn 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
        {sc>=80?'Excellent Match':sc>=60?'Good Match':'Reach School'}
      </div>
      <h2 style={{ fontSize:'clamp(24px,4.5vw,56px)', fontWeight:700, color:'#1C0A0C', letterSpacing:'-0.04em', lineHeight:0.93, textAlign:'center', margin:'0 0 14px', padding:'0 40px', animation:'textSlideIn 0.55s 0.18s cubic-bezier(0.16,1,0.3,1) both' }}>{school.name}</h2>
      <p style={{ fontSize:'16px', fontWeight:300, color:'rgba(28,10,12,0.6)', letterSpacing:'-0.01em', margin:'0 0 8px', animation:'textSlideIn 0.5s 0.28s cubic-bezier(0.16,1,0.3,1) both' }}>{school.program}</p>
      {school.location && <p style={{ fontSize:'12px', fontWeight:300, color:'rgba(28,10,12,0.5)', margin:'0 0 44px', animation:'textSlideIn 0.5s 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>{school.location}</p>}
      <div style={{ width:'200px', height:'2px', background:'rgba(140,45,53,0.10)', borderRadius:'1px', overflow:'hidden', animation:'textSlideIn 0.5s 0.42s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#8C2D35,rgba(140,45,53,0.7))', borderRadius:'1px', animation:'progressFill 1.8s 0.45s cubic-bezier(0.4,0,0.2,1) forwards', width:'0%' }} />
      </div>
      <p style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(28,10,12,0.55)', margin:'14px 0 0', animation:'textSlideIn 0.5s 0.52s cubic-bezier(0.16,1,0.3,1) both' }}>Preparing your analysis…</p>
    </div>
  );
}
