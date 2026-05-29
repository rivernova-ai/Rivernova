'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Check, ChevronDown } from 'lucide-react';

// ─── Data (mirrors OnboardingWizard) ─────────────────────────────────────────

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', hasStates: true },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', hasStates: true },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', hasStates: true },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', hasStates: false },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', hasStates: false },
  { code: 'FR', name: 'France', flag: '🇫🇷', hasStates: false },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', hasStates: false },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', hasStates: false },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', hasStates: false },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', hasStates: false },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', hasStates: false },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', hasStates: false },
  { code: 'CN', name: 'China', flag: '🇨🇳', hasStates: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', hasStates: false },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', hasStates: false },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', hasStates: false },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', hasStates: false },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', hasStates: false },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', hasStates: false },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', hasStates: false },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', hasStates: false },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', hasStates: false },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', hasStates: false },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', hasStates: false },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', hasStates: false },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', hasStates: false },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', hasStates: false },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', hasStates: false },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', hasStates: false },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', hasStates: false },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', hasStates: false },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', hasStates: false },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', hasStates: false },
  { code: 'OTHER', name: 'Other', flag: '🌐', hasStates: false },
];

const STATES: Record<string, string[]> = {
  'United States': [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
    'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
    'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
    'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
    'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
    'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
    'Wisconsin','Wyoming',
  ],
  'Canada': [
    'Alberta','British Columbia','Manitoba','New Brunswick',
    'Newfoundland and Labrador','Nova Scotia','Ontario',
    'Prince Edward Island','Quebec','Saskatchewan',
  ],
  'Australia': [
    'New South Wales','Victoria','Queensland','Western Australia',
    'South Australia','Tasmania','Australian Capital Territory','Northern Territory',
  ],
};

const EDUCATION_LEVELS = [
  { id: 'hs-9', label: 'Grade 9' },
  { id: 'hs-10', label: 'Grade 10' },
  { id: 'hs-11', label: 'Grade 11' },
  { id: 'hs-12', label: 'Grade 12' },
  { id: 'gap', label: 'Gap Year' },
  { id: 'bachelors', label: "Bachelor's Student" },
  { id: 'bachelors-grad', label: "Bachelor's Graduate" },
  { id: 'masters', label: "Master's / Graduate" },
  { id: 'professional', label: 'Working Professional' },
];

const CAREER_FIELDS = [
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'medicine', label: 'Medicine & Health', icon: '🏥' },
  { id: 'business', label: 'Business & Finance', icon: '📈' },
  { id: 'law', label: 'Law', icon: '⚖️' },
  { id: 'engineering', label: 'Engineering', icon: '⚙️' },
  { id: 'science', label: 'Science & Research', icon: '🔬' },
  { id: 'arts', label: 'Arts & Design', icon: '🎨' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'policy', label: 'Government & Policy', icon: '🏛' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', icon: '🚀' },
  { id: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { id: 'social', label: 'Social Impact / NGO', icon: '🌍' },
];

const CAMPUS_ENVIRONMENTS = [
  { id: 'urban', label: 'Major City', icon: '🏙' },
  { id: 'college-town', label: 'College Town', icon: '🎓' },
  { id: 'suburban', label: 'Suburban', icon: '🏡' },
  { id: 'anywhere', label: 'No Preference', icon: '🌐' },
];

const SCHOOL_SIZES = [
  { id: 'small', label: 'Small', sub: '< 5,000' },
  { id: 'medium', label: 'Medium', sub: '5K – 20K' },
  { id: 'large', label: 'Large', sub: '20,000+' },
  { id: 'any', label: 'Any Size', sub: "No pref" },
];

const ENGLISH_PROFICIENCY_TYPES = [
  { id: 'ielts', label: 'IELTS' },
  { id: 'toefl', label: 'TOEFL' },
  { id: 'det', label: 'Duolingo (DET)' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'native', label: 'Native Speaker' },
];

const FUNDING_SOURCES_INTL = [
  { id: 'parents', label: 'Parents / Family', icon: '👨‍👩‍👧' },
  { id: 'self', label: 'Self-funded', icon: '💪' },
  { id: 'home-scholarship', label: 'Home Gov. Scholarship', icon: '🏛️' },
  { id: 'full-aid', label: 'Full Merit Scholarship', icon: '🎯' },
];

const FUNDING_SOURCES_DOMESTIC = [
  { id: 'parents', label: 'Parents / Family', icon: '👨‍👩‍👧' },
  { id: 'self', label: 'Self-funded', icon: '💪' },
  { id: 'partial-aid', label: 'Partial Aid Needed', icon: '🤝' },
  { id: 'full-aid', label: 'Full Scholarship Required', icon: '🎯' },
];

const STUDY_TIMELINES = [
  { id: 'this-fall', label: 'This Fall' },
  { id: 'next-year', label: 'Next Year' },
  { id: '2-years', label: 'In 2 Years' },
  { id: 'exploring', label: 'Just Exploring' },
];

const MODES = [
  { value: 'international' as const, icon: '🌐', label: 'International Student', tagline: 'Applying from abroad', accentColor: '#6366f1', tagColor: '#818cf8' },
  { value: 'domestic' as const, icon: '🏛️', label: 'US Domestic Student', tagline: 'Applying within America', accentColor: '#10b981', tagColor: '#34d399' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditData {
  firstName: string;
  citizenshipCountry: string;
  residenceCountry: string;
  residenceState: string;
  residenceCity: string;
  currentEducation: string;
  schoolName: string;
  gpa: string;
  gpaScale: string;
  satScore: string;
  actScore: string;
  ibScore: string;
  ieltsToeflScore: string;
  englishProficiencyType: string;
  firstGenStudent: boolean;
  major: string;
  dreamJob: string;
  dreamCompany: string;
  careerField: string;
  studyTimeline: string;
  budgetPerYear: number;
  fundingSource: string;
  scholarshipNeeded: boolean;
  financialAid: boolean;
  fafsaFiled: boolean;
  inStateTuition: boolean;
  preferredCountries: string[];
  preferredUSStates: string[];
  preferredUSStatesText: string;
  preferredLocations: string;
  campusEnvironment: string;
  visaNeeded: boolean;
  mode: 'domestic' | 'international';
  schoolSize: string;
}

// ─── Stable UI primitives — defined OUTSIDE the component to prevent
//     re-mount on each keystroke (would lose focus after every character) ────

const EP_INPUT_CLS = "w-full h-12 px-4 rounded-2xl text-sm font-light placeholder:text-white/20 focus:outline-none transition-all";
const EP_INPUT_STYLE = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f8' };
const EP_LABEL_CLS = "block text-[10px] font-black uppercase tracking-[0.25em] mb-2";
const EP_LABEL_STYLE = { color: 'rgba(240,240,248,0.38)' };

function EPField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={EP_LABEL_CLS} style={EP_LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

function EPTextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={EP_INPUT_CLS}
      style={EP_INPUT_STYLE}
    />
  );
}

function EPSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${EP_INPUT_CLS} appearance-none pr-10`}
        style={{ ...EP_INPUT_STYLE, color: value ? '#f0f0f8' : 'rgba(240,240,248,0.25)' }}
      >
        <option value="" disabled style={{ background: '#0d0d1a', color: 'rgba(240,240,248,0.4)' }}>{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#0d0d1a', color: '#f0f0f8' }}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(240,240,248,0.3)' }} />
    </div>
  );
}

function EPChip({ label, selected, onClick, accentColor = '#6366f1' }: {
  label: string; selected: boolean; onClick: () => void; accentColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
      style={selected
        ? { background: `${accentColor}22`, border: `1px solid ${accentColor}99`, color: accentColor }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.45)' }
      }
    >
      {label}
    </button>
  );
}

function EPOptionCard({ selected, onClick, children, accentColor = '#6366f1' }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; accentColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
      style={selected
        ? { background: `${accentColor}14`, border: `1px solid ${accentColor}66` }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
      }
    >
      {children}
    </button>
  );
}

function EPToggle({ checked, onChange, label, sub, accentColor = '#6366f1' }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string; accentColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      onClick={() => onChange(!checked)}
    >
      <div className="pr-4">
        <div className="text-sm font-medium" style={{ color: '#f0f0f8' }}>{label}</div>
        {sub && <div className="text-xs font-light mt-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{sub}</div>}
      </div>
      <div className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200"
        style={{ background: checked ? accentColor : 'rgba(255,255,255,0.1)' }}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<EditData>({
    firstName: '',
    citizenshipCountry: '',
    residenceCountry: '',
    residenceState: '',
    residenceCity: '',
    currentEducation: '',
    schoolName: '',
    gpa: '',
    gpaScale: '4.0',
    satScore: '',
    actScore: '',
    ibScore: '',
    ieltsToeflScore: '',
    englishProficiencyType: '',
    firstGenStudent: false,
    major: '',
    dreamJob: '',
    dreamCompany: '',
    careerField: '',
    studyTimeline: '',
    budgetPerYear: 30000,
    fundingSource: '',
    scholarshipNeeded: false,
    financialAid: false,
    fafsaFiled: false,
    inStateTuition: false,
    preferredCountries: [],
    preferredUSStates: [],
    preferredUSStatesText: '',
    preferredLocations: '',
    campusEnvironment: '',
    visaNeeded: false,
    mode: 'international',
    schoolSize: 'any',
  });

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;
      if (!user) { router.push('/'); return; }

      const supabase = createClient();
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (p) {
        const ab = p.academic_background || {};
        const cg = p.career_goals || {};
        const b = p.budget || {};
        const lp = p.location_preferences || {};

        setData({
          firstName: p.full_name || '',
          citizenshipCountry: lp.citizenshipCountry || '',
          residenceCountry: lp.residenceCountry || '',
          residenceState: lp.residenceState || '',
          residenceCity: lp.residenceCity || '',
          currentEducation: ab.currentEducation || '',
          schoolName: ab.schoolName || '',
          gpa: ab.gpa || '',
          gpaScale: ab.gpaScale || '4.0',
          satScore: ab.satScore || '',
          actScore: ab.actScore || '',
          ibScore: ab.ibScore || '',
          ieltsToeflScore: ab.ieltsToeflScore || '',
          englishProficiencyType: ab.englishProficiencyType || '',
          firstGenStudent: ab.firstGenStudent || false,
          major: ab.major || '',
          dreamJob: cg.dreamJob || '',
          dreamCompany: cg.dreamCompany || '',
          careerField: cg.careerField || '',
          studyTimeline: cg.studyTimeline || '',
          budgetPerYear: b.perYear ?? (b.max ? parseInt(b.max) : 30000),
          fundingSource: b.fundingSource || '',
          scholarshipNeeded: b.scholarshipNeeded || false,
          financialAid: b.financialAid || false,
          fafsaFiled: b.fafsaFiled || false,
          inStateTuition: b.inStateTuition || false,
          preferredCountries: Array.isArray(lp.preferredCountries) ? lp.preferredCountries : [],
          preferredUSStates: Array.isArray(lp.preferredUSStates) ? lp.preferredUSStates : [],
          preferredUSStatesText: lp.preferredUSStatesText || (Array.isArray(lp.preferredUSStates) ? lp.preferredUSStates.join(', ') : ''),
          preferredLocations: lp.preferredLocations || '',
          campusEnvironment: lp.campusEnvironment || '',
          visaNeeded: lp.visaNeeded || false,
          mode: (p.mode === 'domestic' ? 'domestic' : 'international') as 'domestic' | 'international',
          schoolSize: lp.schoolSize || 'any',
        });
      }
      setPageLoading(false);
    };
    load();
  }, [user, authLoading, router]);

  const upd = (field: keyof EditData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleCountry = (name: string) =>
    upd('preferredCountries',
      data.preferredCountries.includes(name)
        ? data.preferredCountries.filter(c => c !== name)
        : [...data.preferredCountries, name]
    );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const usStates = data.preferredUSStatesText
        .split(',').map(s => s.trim()).filter(Boolean);
      const { error: saveError } = await supabase.from('profiles').update({
        full_name: data.firstName,
        academic_background: {
          currentEducation: data.currentEducation,
          schoolName: data.schoolName,
          gpa: data.gpa,
          gpaScale: data.gpaScale,
          satScore: data.satScore,
          actScore: data.actScore,
          ibScore: data.ibScore,
          ieltsToeflScore: data.ieltsToeflScore,
          englishProficiencyType: data.englishProficiencyType,
          firstGenStudent: data.firstGenStudent,
          major: data.major,
        },
        career_goals: {
          careerField: data.careerField,
          dreamJob: data.dreamJob,
          dreamCompany: data.dreamCompany,
          studyTimeline: data.studyTimeline,
          industries: data.careerField,
        },
        budget: {
          perYear: data.budgetPerYear,
          min: String(Math.round(data.budgetPerYear * 0.85)),
          max: String(data.budgetPerYear),
          fundingSource: data.fundingSource,
          scholarshipNeeded: data.scholarshipNeeded,
          financialAid: data.financialAid,
          fafsaFiled: data.fafsaFiled,
          inStateTuition: data.inStateTuition,
        },
        location_preferences: {
          citizenshipCountry: data.citizenshipCountry,
          residenceCountry: data.residenceCountry,
          residenceState: data.residenceState,
          residenceCity: data.residenceCity,
          preferredCountries: data.preferredCountries,
          preferredCountriesStr: (Array.isArray(data.preferredCountries) ? data.preferredCountries : []).join(', '),
          preferredUSStates: usStates,
          preferredUSStatesText: data.preferredUSStatesText,
          preferredLocations: data.preferredLocations,
          campusEnvironment: data.campusEnvironment,
          visaNeeded: data.visaNeeded,
          schoolSize: data.schoolSize,
        },
        mode: data.mode,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (saveError) throw new Error(saveError.message);
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const accent = data.mode === 'domestic' ? '#10b981' : '#6366f1';

  const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex items-center gap-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold" style={{ color: '#f0f0f8' }}>{title}</h2>
    </div>
  );

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080810' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accent }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#080810' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />

      {/* Sticky header */}
      <div className="sticky top-0 z-50" style={{ background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl transition-all"
              style={{ color: 'rgba(240,240,248,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.3)' }}>RIVERNOVA</p>
              <h1 className="text-lg font-bold leading-tight" style={{ color: '#f0f0f8' }}>Edit Profile</h1>
            </div>
          </div>

          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-bold h-10 px-6 rounded-2xl transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: '#fff', boxShadow: `0 0 20px ${accent}35` }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6 py-10 space-y-12 relative">

        {/* ── Profile Type ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionHeader icon="🎯" title="Profile Type" />
          <div className="grid grid-cols-3 gap-3">
            {MODES.map(m => {
              const isSelected = data.mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => upd('mode', m.value)}
                  className="p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
                  style={isSelected
                    ? { background: `${m.accentColor}12`, border: `1px solid ${m.accentColor}55`, boxShadow: `0 0 16px ${m.accentColor}18` }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  <div className="text-xl mb-2">{m.icon}</div>
                  <div className="text-xs font-bold leading-tight mb-0.5" style={{ color: isSelected ? m.accentColor : '#f0f0f8' }}>{m.label}</div>
                  <div className="text-[10px] font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>{m.tagline}</div>
                  <div className="mt-2 flex items-center justify-center">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                      style={isSelected ? { borderColor: m.accentColor, background: m.accentColor } : { borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Identity ──────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <SectionHeader icon="👤" title="Identity & Location" />

          <EPField label="First Name">
            <EPTextInput value={data.firstName} onChange={(v: string) => upd('firstName', v)} placeholder="Your first name" />
          </EPField>

          {data.mode !== 'domestic' ? (
            <>
              <EPField label="Citizenship / Nationality">
                <EPSelect
                  value={data.citizenshipCountry}
                  onChange={v => upd('citizenshipCountry', v)}
                  placeholder="Which country are you a citizen of?"
                  options={COUNTRIES.map(c => ({ value: c.name, label: `${c.flag}  ${c.name}` }))}
                />
              </EPField>

              <EPField label="Country You Currently Live In">
                <EPSelect
                  value={data.residenceCountry}
                  onChange={v => { upd('residenceCountry', v); upd('residenceState', ''); upd('residenceCity', ''); }}
                  placeholder="Select your current country"
                  options={COUNTRIES.map(c => ({ value: c.name, label: `${c.flag}  ${c.name}` }))}
                />
              </EPField>

              <AnimatePresence>
                {data.residenceCountry && STATES[data.residenceCountry] && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <EPField label={data.residenceCountry === 'Canada' ? 'Province' : 'State'}>
                      <EPSelect
                        value={data.residenceState}
                        onChange={v => upd('residenceState', v)}
                        placeholder="Select your state"
                        options={STATES[data.residenceCountry].map(s => ({ value: s, label: s }))}
                      />
                    </EPField>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {data.residenceCountry && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <EPField label="City">
                      <EPTextInput value={data.residenceCity} onChange={(v: string) => upd('residenceCity', v)} placeholder="Your city" />
                    </EPField>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <EPField label="Home State">
                <EPSelect
                  value={data.residenceState}
                  onChange={v => { upd('residenceState', v); upd('residenceCountry', 'United States'); }}
                  placeholder="Which state are you from?"
                  options={STATES['United States'].map(s => ({ value: s, label: s }))}
                />
              </EPField>
              <AnimatePresence>
                {data.residenceState && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <EPField label="City / Town">
                      <EPTextInput value={data.residenceCity} onChange={(v: string) => upd('residenceCity', v)} placeholder={`Your city in ${data.residenceState}`} />
                    </EPField>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* ── Academic ──────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <SectionHeader icon="🎓" title="Academic Profile" />

          <EPField label="Current Education Level">
            <div className="grid grid-cols-3 gap-2">
              {EDUCATION_LEVELS.map(e => (
                <EPOptionCard key={e.id} selected={data.currentEducation === e.id} onClick={() => upd('currentEducation', e.id)} accentColor={accent}>
                  <div className="text-xs font-bold" style={{ color: '#f0f0f8' }}>{e.label}</div>
                </EPOptionCard>
              ))}
            </div>
          </EPField>

          <EPField label="School / Institution Name">
            <EPTextInput value={data.schoolName} onChange={(v: string) => upd('schoolName', v)} placeholder="e.g., Lincoln High School, UCLA" />
          </EPField>

          <div className="grid grid-cols-2 gap-4">
            <EPField label="GPA">
              <EPTextInput value={data.gpa} onChange={(v: string) => upd('gpa', v)} placeholder="e.g., 3.8" type="number" />
            </EPField>
            <EPField label="GPA Scale">
              <div className="flex gap-2 h-12 items-center">
                {['4.0', '5.0', '100', 'Letter'].map(scale => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => upd('gpaScale', scale)}
                    className="flex-1 h-full rounded-xl text-xs font-bold transition-all"
                    style={data.gpaScale === scale
                      ? { background: `${accent}28`, border: `1px solid ${accent}80`, color: accent }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.4)' }
                    }
                  >{scale}</button>
                ))}
              </div>
            </EPField>
          </div>

          {data.mode === 'domestic' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <EPField label="SAT Score">
                  <EPTextInput value={data.satScore} onChange={(v: string) => upd('satScore', v)} placeholder="400 – 1600" type="number" />
                </EPField>
                <EPField label="ACT Score">
                  <EPTextInput value={data.actScore} onChange={(v: string) => upd('actScore', v)} placeholder="1 – 36" type="number" />
                </EPField>
              </div>
              <EPToggle
                checked={data.firstGenStudent}
                onChange={(v: boolean) => upd('firstGenStudent', v)}
                label="First-Generation College Student"
                sub="Neither parent completed a 4-year degree — unlocks major aid opportunities"
                accentColor="#10b981"
              />
            </>
          ) : (
            <>
              <EPField label="English Proficiency Test">
                <div className="flex flex-wrap gap-2">
                  {ENGLISH_PROFICIENCY_TYPES.map(e => (
                    <EPChip key={e.id} label={e.label} selected={data.englishProficiencyType === e.id} onClick={() => upd('englishProficiencyType', e.id)} accentColor={accent} />
                  ))}
                </div>
              </EPField>

              <AnimatePresence>
                {data.englishProficiencyType && data.englishProficiencyType !== 'native' && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <EPField label={`${ENGLISH_PROFICIENCY_TYPES.find(e => e.id === data.englishProficiencyType)?.label || 'Test'} Score`}>
                      <EPTextInput
                        value={data.ieltsToeflScore}
                        onChange={(v: string) => upd('ieltsToeflScore', v)}
                        placeholder={data.englishProficiencyType === 'ielts' ? 'e.g., 7.5' : data.englishProficiencyType === 'toefl' ? 'e.g., 105' : 'Your score'}
                      />
                    </EPField>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <EPField label="IB Score (optional)">
                  <EPTextInput value={data.ibScore} onChange={(v: string) => upd('ibScore', v)} placeholder="e.g., 38 / 45" />
                </EPField>
                <EPField label="SAT Score (optional)">
                  <EPTextInput value={data.satScore} onChange={(v: string) => upd('satScore', v)} placeholder="400 – 1600" type="number" />
                </EPField>
              </div>
            </>
          )}

          <EPField label="Intended Major / Field of Study">
            <EPTextInput value={data.major} onChange={(v: string) => upd('major', v)} placeholder="e.g., Computer Science, Biochemistry" />
          </EPField>
        </div>

        {/* ── Career Vision ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          <SectionHeader icon="🚀" title="Career Vision" />

          <EPField label="Dream Job Title">
            <EPTextInput value={data.dreamJob} onChange={(v: string) => upd('dreamJob', v)} placeholder="e.g., AI Research Scientist, Neurosurgeon, VC Partner" />
          </EPField>

          <EPField label="Dream Company or Sector">
            <EPTextInput value={data.dreamCompany} onChange={(v: string) => upd('dreamCompany', v)} placeholder="e.g., Google DeepMind, McKinsey, my own startup" />
          </EPField>

          <EPField label="Career Field">
            <div className="grid grid-cols-2 gap-2">
              {CAREER_FIELDS.map(f => (
                <EPOptionCard key={f.id} selected={data.careerField === f.id} onClick={() => upd('careerField', f.id)} accentColor={accent}>
                  <span className="text-base">{f.icon}</span>
                  <span className="text-sm font-medium ml-2" style={{ color: '#f0f0f8' }}>{f.label}</span>
                </EPOptionCard>
              ))}
            </div>
          </EPField>

          <EPField label="When Do You Plan to Start?">
            <div className="grid grid-cols-2 gap-2">
              {STUDY_TIMELINES.map(t => (
                <EPOptionCard key={t.id} selected={data.studyTimeline === t.id} onClick={() => upd('studyTimeline', t.id)} accentColor={accent}>
                  <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{t.label}</div>
                </EPOptionCard>
              ))}
            </div>
          </EPField>
        </div>

        {/* ── Budget ────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <SectionHeader icon="💰" title="Budget & Funding" />

          <EPField label="Annual Budget (USD per year, all-in)">
            <div className="space-y-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black" style={{ color: accent }}>
                  ${data.budgetPerYear >= 100000 ? '100K+' : data.budgetPerYear.toLocaleString()}
                </span>
                <span className="text-sm font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>/year</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={2500}
                value={data.budgetPerYear}
                onChange={e => upd('budgetPerYear', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: accent, background: `linear-gradient(to right, ${accent} ${((data.budgetPerYear - 5000) / 95000) * 100}%, rgba(255,255,255,0.1) 0%)` }}
              />
              <div className="flex justify-between text-xs font-light" style={{ color: 'rgba(240,240,248,0.3)' }}>
                <span>$5K</span><span>$100K+</span>
              </div>
            </div>
          </EPField>

          <EPField label="Who's Covering the Cost?">
            <div className="grid grid-cols-2 gap-2">
              {(data.mode === 'domestic' ? FUNDING_SOURCES_DOMESTIC : FUNDING_SOURCES_INTL).map(f => (
                <EPOptionCard key={f.id} selected={data.fundingSource === f.id} onClick={() => upd('fundingSource', f.id)} accentColor={accent}>
                  <span className="text-xl">{f.icon}</span>
                  <div className="text-sm font-medium mt-1.5" style={{ color: '#f0f0f8' }}>{f.label}</div>
                </EPOptionCard>
              ))}
            </div>
          </EPField>

          <div className="space-y-2">
            {data.mode === 'domestic' ? (
              <>
                <EPToggle checked={data.fafsaFiled} onChange={(v: boolean) => upd('fafsaFiled', v)} label="I've filed or plan to file FAFSA" sub="Federal aid eligibility — highly recommended for US students" accentColor="#10b981" />
                <EPToggle checked={data.inStateTuition} onChange={(v: boolean) => upd('inStateTuition', v)} label="Prioritize in-state tuition savings" sub="Show me schools where I qualify for in-state rates" accentColor="#10b981" />
                <EPToggle checked={data.financialAid} onChange={(v: boolean) => upd('financialAid', v)} label="I need financial aid" sub="Prioritize schools with generous need-based aid" accentColor="#10b981" />
              </>
            ) : (
              <>
                <EPToggle checked={data.scholarshipNeeded} onChange={(v: boolean) => upd('scholarshipNeeded', v)} label="I need international scholarship opportunities" sub="Show schools with merit-based scholarships for international students" accentColor={accent} />
                <EPToggle checked={data.financialAid} onChange={(v: boolean) => upd('financialAid', v)} label="I need need-based financial aid" sub="Prioritize schools with strong international aid programs" accentColor={accent} />
              </>
            )}
          </div>
        </div>

        {/* ── Location Preferences ──────────────────────────────────────── */}
        <div className="space-y-5">
          <SectionHeader icon="📍" title="Location Preferences" />

          {data.mode === 'domestic' ? (
            <>
              <EPField label="Target US States / Locations">
                <EPTextInput
                  value={data.preferredUSStatesText}
                  onChange={v => upd('preferredUSStatesText', v)}
                  placeholder="e.g., California, Texas, New York"
                />
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(240,240,248,0.3)' }}>Separate multiple states with commas</p>
              </EPField>

              <EPField label="Specific City or Area (optional)">
                <EPTextInput
                  value={data.preferredLocations}
                  onChange={v => upd('preferredLocations', v)}
                  placeholder="e.g., Bay Area, Austin TX, Chicago IL"
                />
              </EPField>

              <EPField label="Open to Other Countries? (optional)">
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter(c => c.code !== 'US' && c.code !== 'OTHER').map(c => (
                    <EPChip key={c.code} label={`${c.flag} ${c.name}`} selected={data.preferredCountries.includes(c.name)} onClick={() => toggleCountry(c.name)} accentColor="#10b981" />
                  ))}
                </div>
              </EPField>
            </>
          ) : (
            <>
              <EPField label="Preferred Study Countries">
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter(c => c.code !== 'OTHER').map(c => (
                    <EPChip key={c.code} label={`${c.flag} ${c.name}`} selected={data.preferredCountries.includes(c.name)} onClick={() => toggleCountry(c.name)} accentColor={accent} />
                  ))}
                </div>
              </EPField>

              <AnimatePresence>
                {data.preferredCountries.includes('United States') && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <EPField label="Preferred US States / Cities">
                      <EPTextInput
                        value={data.preferredUSStatesText}
                        onChange={v => upd('preferredUSStatesText', v)}
                        placeholder="e.g., California, New York, Texas"
                      />
                      <p className="text-[10px] mt-1.5" style={{ color: 'rgba(240,240,248,0.3)' }}>Separate multiple states or cities with commas</p>
                    </EPField>
                  </motion.div>
                )}
              </AnimatePresence>

              <EPField label="Specific Areas or Cities (optional)">
                <EPTextInput
                  value={data.preferredLocations}
                  onChange={v => upd('preferredLocations', v)}
                  placeholder="e.g., Boston MA, London UK, Toronto Ontario"
                />
              </EPField>

              <EPToggle checked={data.visaNeeded} onChange={(v: boolean) => upd('visaNeeded', v)} label="I will need visa assistance" sub="Show visa acceptance rates and F-1 / student visa pathways" accentColor={accent} />
            </>
          )}

          <EPField label="Campus Environment">
            <div className="grid grid-cols-2 gap-2">
              {CAMPUS_ENVIRONMENTS.map(env => (
                <EPOptionCard key={env.id} selected={data.campusEnvironment === env.id} onClick={() => upd('campusEnvironment', env.id)} accentColor={accent}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{env.icon}</span>
                    <span className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{env.label}</span>
                  </div>
                </EPOptionCard>
              ))}
            </div>
          </EPField>

          <EPField label="Preferred School Size">
            <div className="grid grid-cols-4 gap-2">
              {SCHOOL_SIZES.map(s => (
                <EPOptionCard key={s.id} selected={data.schoolSize === s.id} onClick={() => upd('schoolSize', s.id)} accentColor={accent}>
                  <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{s.label}</div>
                  <div className="text-xs font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>{s.sub}</div>
                </EPOptionCard>
              ))}
            </div>
          </EPField>
        </div>

        {/* Bottom save button for scroll convenience */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="pb-4"
            >
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: '#fff', boxShadow: `0 0 32px ${accent}35` }}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Changes</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-full"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
          >
            <Check className="w-4 h-4" />
            Changes saved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

