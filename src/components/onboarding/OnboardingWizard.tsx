'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, ArrowLeft, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

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

const MODES = [
  {
    value: 'international' as const,
    icon: '🌐',
    label: 'International Student',
    tagline: 'Applying from abroad',
    desc: 'From another country, targeting US, UK, Canada, Australia, Germany, or beyond.',
    bullets: ['Visa pathway & acceptance rates','IELTS / TOEFL school cutoffs','International merit scholarships','Cross-border ROI analysis'],
    accentColor: '#6366f1', accentBg: 'rgba(99,102,241,0.08)', accentBorder: 'rgba(99,102,241,0.45)',
    tagColor: '#818cf8', selectedBg: 'rgba(99,102,241,0.1)',
  },
  {
    value: 'domestic' as const,
    icon: '🏛️',
    label: 'US Domestic Student',
    tagline: 'Applying within America',
    desc: 'US citizen or permanent resident applying to American colleges and universities.',
    bullets: ['In-state vs out-of-state tuition','FAFSA & need-based aid','SAT / ACT school matching','State scholarship programs'],
    accentColor: '#10b981', accentBg: 'rgba(16,185,129,0.07)', accentBorder: 'rgba(16,185,129,0.4)',
    tagColor: '#34d399', selectedBg: 'rgba(16,185,129,0.08)',
  },
];

const EDUCATION_LEVELS = [
  { id: 'hs-9', label: 'Grade 9', sub: 'High School, Freshman' },
  { id: 'hs-10', label: 'Grade 10', sub: 'High School, Sophomore' },
  { id: 'hs-11', label: 'Grade 11', sub: 'High School, Junior' },
  { id: 'hs-12', label: 'Grade 12', sub: 'High School, Senior' },
  { id: 'gap', label: 'Gap Year', sub: 'Between schools' },
  { id: 'bachelors', label: "Bachelor's Student", sub: 'Currently enrolled' },
  { id: 'bachelors-grad', label: "Bachelor's Graduate", sub: 'Degree completed' },
  { id: 'masters', label: "Master's / Graduate", sub: 'Enrolled or completed' },
  { id: 'professional', label: 'Working Professional', sub: 'Career advancement' },
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
  { id: 'urban', label: 'Major City', sub: 'NYC, LA, London, Toronto', icon: '🏙' },
  { id: 'college-town', label: 'College Town', sub: 'Campus is the town', icon: '🎓' },
  { id: 'suburban', label: 'Suburban', sub: 'Quiet, safe, focused', icon: '🏡' },
  { id: 'anywhere', label: 'No Preference', sub: 'Location is flexible', icon: '🌐' },
];

const SCHOOL_SIZES = [
  { id: 'small', label: 'Small', sub: '< 5,000 students' },
  { id: 'medium', label: 'Medium', sub: '5,000 – 20,000' },
  { id: 'large', label: 'Large', sub: '20,000 +' },
  { id: 'any', label: 'Any Size', sub: "Doesn't matter" },
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
  { id: 'this-fall', label: 'This Fall', sub: 'Next intake cycle' },
  { id: 'next-year', label: 'Next Year', sub: '12 months away' },
  { id: '2-years', label: 'In 2 Years', sub: 'Still planning ahead' },
  { id: 'exploring', label: 'Just Exploring', sub: 'No fixed timeline' },
];

const ENGLISH_PROFICIENCY_TYPES = [
  { id: 'ielts', label: 'IELTS' },
  { id: 'toefl', label: 'TOEFL' },
  { id: 'det', label: 'Duolingo (DET)' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'native', label: 'Native Speaker' },
];

const STEPS = ['Profile', 'You', 'Academic', 'Vision', 'Budget', 'Location'];

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingData {
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

// ─── Shared UI primitives — DEFINED OUTSIDE the main component so they are
//     stable across renders. If defined inside, every keystroke re-creates
//     them as new component types, causing React to unmount the input. ─────────

const INPUT_CLS = "w-full h-12 px-4 rounded-2xl text-sm font-light placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all";
const INPUT_STYLE = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f8' };
const LABEL_CLS = "block text-[10px] font-black uppercase tracking-[0.25em] mb-2";
const LABEL_STYLE = { color: 'rgba(240,240,248,0.4)' };

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={LABEL_CLS} style={LABEL_STYLE}>
        {label}
        {required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 mt-1">
          <AlertCircle style={{ width: '12px', height: '12px', color: '#f87171', flexShrink: 0 }} />
          <p style={{ fontSize: '11px', color: '#f87171' }}>{error}</p>
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLS}
      style={INPUT_STYLE}
    />
  );
}


function OSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${INPUT_CLS} appearance-none pr-10`}
        style={{ ...INPUT_STYLE, color: value ? '#f0f0f8' : 'rgba(240,240,248,0.25)' }}
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

function Chip({ label, selected, onClick, accentColor = '#6366f1' }: {
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

function OptionCard({ selected, onClick, children, accentColor = '#6366f1' }: {
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

function Toggle({ checked, onChange, label, sub, accentColor = '#6366f1' }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string; accentColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      onClick={() => onChange(!checked)}
    >
      <div>
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

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<OnboardingData>({
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

  const upd = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleCountry = (name: string) =>
    upd('preferredCountries',
      data.preferredCountries.includes(name)
        ? data.preferredCountries.filter(c => c !== name)
        : [...data.preferredCountries, name]
    );

  // ── Validation ───────────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 2) {
      if (!data.firstName.trim()) errs.firstName = 'Please enter your first name.';
      if (data.mode !== 'domestic') {
        if (!data.citizenshipCountry) errs.citizenshipCountry = 'Please select your citizenship country.';
        if (!data.residenceCountry) errs.residenceCountry = 'Please select your current country.';
      } else {
        if (!data.residenceState) errs.residenceState = 'Please select your home state.';
      }
    }

    if (step === 3) {
      if (!data.currentEducation) errs.currentEducation = 'Please select your education level.';
      if (!data.gpa.trim()) errs.gpa = 'Please enter your GPA.';
      if (!data.major.trim()) errs.major = 'Please enter your intended major.';
    }

    if (step === 4) {
      if (!data.careerField) errs.careerField = 'Please select a career field.';
      if (!data.studyTimeline) errs.studyTimeline = 'Please select your study timeline.';
    }

    if (step === 6) {
      if (!data.campusEnvironment) errs.campusEnvironment = 'Please select a campus environment.';
      if (data.mode === 'domestic' && !data.preferredUSStatesText.trim() && data.preferredCountries.length === 0) {
        errs.preferredUSStatesText = 'Please enter at least one preferred state or location.';
      }
      if (data.mode !== 'domestic' && data.preferredCountries.length === 0) {
        errs.preferredCountries = 'Please select at least one preferred country.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length) setCurrentStep(p => p + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep(p => p - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const usStates = data.preferredUSStatesText
        .split(',').map(s => s.trim()).filter(Boolean);

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
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
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (upsertError) throw new Error(upsertError.message);

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accent = data.mode === 'domestic' ? '#10b981' : '#6366f1';

  // ── Step renderer ────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {

      // ── Step 1: Profile Mode ─────────────────────────────────────────────
      case 1: return (
        <div className="space-y-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>What describes you best?</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>This shapes your entire intelligence profile and unlocks the right tools.</p>
          </div>
          <div className="space-y-3">
            {MODES.map(m => {
              const isSelected = data.mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => upd('mode', m.value)}
                  className="w-full p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.99]"
                  style={isSelected
                    ? { background: m.selectedBg, border: `1px solid ${m.accentBorder}`, boxShadow: `0 0 20px ${m.accentColor}18` }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5 flex-shrink-0">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base font-bold" style={{ color: isSelected ? m.accentColor : '#f0f0f8' }}>{m.label}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ color: m.tagColor, background: `${m.accentColor}18` }}>{m.tagline}</span>
                      </div>
                      <p className="text-xs font-light mb-3" style={{ color: 'rgba(240,240,248,0.5)' }}>{m.desc}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {m.bullets.map(b => (
                          <div key={b} className="flex items-center gap-1.5">
                            <span className="text-[8px]" style={{ color: m.tagColor }}>✦</span>
                            <span className="text-[11px] font-light" style={{ color: 'rgba(240,240,248,0.55)' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                        style={isSelected ? { borderColor: m.accentColor, background: m.accentColor } : { borderColor: 'rgba(255,255,255,0.2)', background: 'transparent' }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );

      // ── Step 2: You ──────────────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Tell us about yourself.</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>This helps us personalize every recommendation.</p>
          </div>

          <Field label="First Name" required error={errors.firstName}>
            <TextInput value={data.firstName} onChange={v => upd('firstName', v)} placeholder="Your first name" />
          </Field>

          {data.mode !== 'domestic' && (
            <>
              <Field label="Citizenship / Nationality" required error={errors.citizenshipCountry}>
                <OSelect
                  value={data.citizenshipCountry}
                  onChange={v => upd('citizenshipCountry', v)}
                  placeholder="Which country are you a citizen of?"
                  options={COUNTRIES.map(c => ({ value: c.name, label: `${c.flag}  ${c.name}` }))}
                />
              </Field>

              <div className="space-y-3">
                <Field label="Country You Currently Live In" required error={errors.residenceCountry}>
                  <OSelect
                    value={data.residenceCountry}
                    onChange={v => { upd('residenceCountry', v); upd('residenceState', ''); upd('residenceCity', ''); }}
                    placeholder="Select your current country"
                    options={COUNTRIES.map(c => ({ value: c.name, label: `${c.flag}  ${c.name}` }))}
                  />
                </Field>

                <AnimatePresence>
                  {data.residenceCountry && STATES[data.residenceCountry] && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <Field label={data.residenceCountry === 'Canada' ? 'Province' : 'State'}>
                        <OSelect
                          value={data.residenceState}
                          onChange={v => { upd('residenceState', v); upd('residenceCity', ''); }}
                          placeholder={`Which ${data.residenceCountry === 'Canada' ? 'province' : 'state'}?`}
                          options={STATES[data.residenceCountry].map(s => ({ value: s, label: s }))}
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {data.residenceCountry && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, delay: 0.05 }}>
                      <Field label="City">
                        <TextInput
                          value={data.residenceCity}
                          onChange={v => upd('residenceCity', v)}
                          placeholder={`Your city in ${data.residenceState || data.residenceCountry}`}
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {data.mode === 'domestic' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#34d399' }}>
                  🏛️ Domestic Profile — US citizen or permanent resident applying to American universities.
                </p>
              </div>
              <Field label="Home State" required error={errors.residenceState}>
                <OSelect
                  value={data.residenceState}
                  onChange={v => { upd('residenceState', v); upd('residenceCountry', 'United States'); upd('residenceCity', ''); }}
                  placeholder="Which state are you from?"
                  options={STATES['United States'].map(s => ({ value: s, label: s }))}
                />
              </Field>
              <AnimatePresence>
                {data.residenceState && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Field label="City / Town">
                      <TextInput
                        value={data.residenceCity}
                        onChange={v => upd('residenceCity', v)}
                        placeholder={`Your city in ${data.residenceState}`}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      );

      // ── Step 3: Academic ─────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Your academic profile.</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>Be specific — this directly impacts your match quality.</p>
          </div>

          <Field label="Current Education Level" required error={errors.currentEducation}>
            <div className="grid grid-cols-2 gap-2">
              {EDUCATION_LEVELS.map(e => (
                <OptionCard key={e.id} selected={data.currentEducation === e.id} onClick={() => upd('currentEducation', e.id)} accentColor={accent}>
                  <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{e.label}</div>
                  <div className="text-xs font-light mt-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{e.sub}</div>
                </OptionCard>
              ))}
            </div>
          </Field>

          <Field label="School / Institution Name">
            <TextInput value={data.schoolName} onChange={v => upd('schoolName', v)} placeholder="e.g., Lincoln High School, UCLA" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="GPA" required error={errors.gpa}>
              <TextInput value={data.gpa} onChange={v => upd('gpa', v)} placeholder="e.g., 3.8" type="number" />
            </Field>
            <Field label="GPA Scale">
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
            </Field>
          </div>

          {data.mode === 'domestic' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="SAT Score">
                  <TextInput value={data.satScore} onChange={v => upd('satScore', v)} placeholder="400 – 1600" type="number" />
                </Field>
                <Field label="ACT Score">
                  <TextInput value={data.actScore} onChange={v => upd('actScore', v)} placeholder="1 – 36" type="number" />
                </Field>
              </div>
              <Toggle checked={data.firstGenStudent} onChange={v => upd('firstGenStudent', v)}
                label="First-Generation College Student"
                sub="Neither parent has a 4-year college degree — unlocks major aid opportunities"
                accentColor="#10b981"
              />
            </>
          )}

          {data.mode !== 'domestic' && (
            <>
              <Field label="English Proficiency Test">
                <div className="flex flex-wrap gap-2">
                  {ENGLISH_PROFICIENCY_TYPES.map(e => (
                    <Chip key={e.id} label={e.label} selected={data.englishProficiencyType === e.id}
                      onClick={() => upd('englishProficiencyType', e.id)} accentColor={accent} />
                  ))}
                </div>
              </Field>

              <AnimatePresence>
                {data.englishProficiencyType && data.englishProficiencyType !== 'native' && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    <Field label={`${ENGLISH_PROFICIENCY_TYPES.find(e => e.id === data.englishProficiencyType)?.label || 'Test'} Score`}>
                      <TextInput
                        value={data.ieltsToeflScore}
                        onChange={v => upd('ieltsToeflScore', v)}
                        placeholder={data.englishProficiencyType === 'ielts' ? 'e.g., 7.5' : data.englishProficiencyType === 'toefl' ? 'e.g., 105' : 'Your score'}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <Field label="IB Score (optional)">
                  <TextInput value={data.ibScore} onChange={v => upd('ibScore', v)} placeholder="e.g., 38 / 45" />
                </Field>
                <Field label="SAT Score (optional)">
                  <TextInput value={data.satScore} onChange={v => upd('satScore', v)} placeholder="400 – 1600" type="number" />
                </Field>
              </div>
            </>
          )}

          <Field label="Intended Major / Field of Study" required error={errors.major}>
            <TextInput value={data.major} onChange={v => upd('major', v)} placeholder="e.g., Computer Science, Biochemistry, Business" />
          </Field>
        </div>
      );

      // ── Step 4: Vision ───────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>What's your vision?</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>Think big. The AI uses this to calculate your ROI on every school.</p>
          </div>

          <Field label="Dream Job Title">
            <TextInput value={data.dreamJob} onChange={v => upd('dreamJob', v)} placeholder="e.g., Neurosurgeon, AI Research Scientist, VC Partner" />
          </Field>

          <Field label="Dream Company or Sector">
            <TextInput value={data.dreamCompany} onChange={v => upd('dreamCompany', v)} placeholder="e.g., Google DeepMind, McKinsey, my own startup" />
          </Field>

          <Field label="Career Field" required error={errors.careerField}>
            <div className="grid grid-cols-2 gap-2">
              {CAREER_FIELDS.map(f => (
                <OptionCard key={f.id} selected={data.careerField === f.id} onClick={() => upd('careerField', f.id)} accentColor={accent}>
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm font-medium ml-2" style={{ color: '#f0f0f8' }}>{f.label}</span>
                </OptionCard>
              ))}
            </div>
          </Field>

          <Field label="When Do You Plan to Start?" required error={errors.studyTimeline}>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_TIMELINES.map(t => (
                <OptionCard key={t.id} selected={data.studyTimeline === t.id} onClick={() => upd('studyTimeline', t.id)} accentColor={accent}>
                  <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{t.label}</div>
                  <div className="text-xs font-light mt-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{t.sub}</div>
                </OptionCard>
              ))}
            </div>
          </Field>
        </div>
      );

      // ── Step 5: Budget ───────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Budget & support.</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>Honest numbers = better matches. We never share your data.</p>
          </div>

          <Field label="Annual Budget (USD per year, all-in)">
            <div className="space-y-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black" style={{ color: accent }}>
                  ${data.budgetPerYear >= 100000 ? '100K+' : data.budgetPerYear.toLocaleString()}
                </span>
                <span className="text-sm font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>/year</span>
              </div>
              <input
                type="range" min={5000} max={100000} step={2500}
                value={data.budgetPerYear}
                onChange={e => upd('budgetPerYear', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: accent, background: `linear-gradient(to right, ${accent} ${((data.budgetPerYear - 5000) / 95000) * 100}%, rgba(255,255,255,0.1) 0%)` }}
              />
              <div className="flex justify-between text-xs font-light" style={{ color: 'rgba(240,240,248,0.3)' }}>
                <span>$5K</span><span>$100K+</span>
              </div>
            </div>
          </Field>

          <Field label="Who's Covering the Cost?">
            <div className="grid grid-cols-2 gap-2">
              {(data.mode === 'domestic' ? FUNDING_SOURCES_DOMESTIC : FUNDING_SOURCES_INTL).map(f => (
                <OptionCard key={f.id} selected={data.fundingSource === f.id} onClick={() => upd('fundingSource', f.id)} accentColor={accent}>
                  <span className="text-xl">{f.icon}</span>
                  <div className="text-sm font-medium mt-1.5" style={{ color: '#f0f0f8' }}>{f.label}</div>
                </OptionCard>
              ))}
            </div>
          </Field>

          <div className="space-y-2">
            {data.mode === 'domestic' ? (
              <>
                <Toggle checked={data.fafsaFiled} onChange={v => upd('fafsaFiled', v)}
                  label="I've filed or plan to file FAFSA"
                  sub="Federal aid eligibility — highly recommended for US students"
                  accentColor="#10b981" />
                <Toggle checked={data.inStateTuition} onChange={v => upd('inStateTuition', v)}
                  label="Prioritize in-state tuition savings"
                  sub="Show me schools where I qualify for in-state rates"
                  accentColor="#10b981" />
                <Toggle checked={data.financialAid} onChange={v => upd('financialAid', v)}
                  label="I need financial aid"
                  sub="Prioritize schools with generous need-based aid"
                  accentColor="#10b981" />
              </>
            ) : (
              <>
                <Toggle checked={data.scholarshipNeeded} onChange={v => upd('scholarshipNeeded', v)}
                  label="I need international scholarship opportunities"
                  sub="Show me schools with merit-based scholarships for international students"
                  accentColor={accent} />
                <Toggle checked={data.financialAid} onChange={v => upd('financialAid', v)}
                  label="I need need-based financial aid"
                  sub="Prioritize schools with strong international aid programs"
                  accentColor={accent} />
              </>
            )}
          </div>
        </div>
      );

      // ── Step 6: Location ─────────────────────────────────────────────────
      case 6: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Where do you want to study?</h2>
            <p className="text-sm font-light mt-1" style={{ color: 'rgba(240,240,248,0.45)' }}>
              {data.mode === 'domestic' ? 'Tell us which states and areas you want to study in.' : "Select countries and type your preferred US states or cities."}
            </p>
          </div>

          {data.mode === 'domestic' ? (
            <>
              <Field label="Target US States / Locations" required error={errors.preferredUSStatesText}>
                <TextInput
                  value={data.preferredUSStatesText}
                  onChange={v => upd('preferredUSStatesText', v)}
                  placeholder="e.g., California, Texas, New York"
                />
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(240,240,248,0.3)' }}>Separate multiple states with commas</p>
              </Field>

              <Field label="Specific City or Area (optional)">
                <TextInput
                  value={data.preferredLocations}
                  onChange={v => upd('preferredLocations', v)}
                  placeholder="e.g., Bay Area, Austin TX, Chicago IL"
                />
              </Field>

              <Field label="Open to Other Countries? (optional)">
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter(c => c.code !== 'US' && c.code !== 'OTHER').map(c => (
                    <Chip
                      key={c.code}
                      label={`${c.flag} ${c.name}`}
                      selected={data.preferredCountries.includes(c.name)}
                      onClick={() => toggleCountry(c.name)}
                      accentColor="#10b981"
                    />
                  ))}
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Preferred Study Countries" required error={errors.preferredCountries}>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter(c => c.code !== 'OTHER').map(c => (
                    <Chip
                      key={c.code}
                      label={`${c.flag} ${c.name}`}
                      selected={data.preferredCountries.includes(c.name)}
                      onClick={() => toggleCountry(c.name)}
                      accentColor={accent}
                    />
                  ))}
                </div>
              </Field>

              <AnimatePresence>
                {data.preferredCountries.includes('United States') && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                    <Field label="Preferred US States / Cities">
                      <TextInput
                        value={data.preferredUSStatesText}
                        onChange={v => upd('preferredUSStatesText', v)}
                        placeholder="e.g., California, New York, Texas"
                      />
                      <p className="text-[10px] mt-1.5" style={{ color: 'rgba(240,240,248,0.3)' }}>Separate multiple states or cities with commas</p>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Specific Areas or Cities (optional)">
                <TextInput
                  value={data.preferredLocations}
                  onChange={v => upd('preferredLocations', v)}
                  placeholder="e.g., Boston MA, London UK, Toronto Ontario"
                />
              </Field>

              <Toggle checked={data.visaNeeded} onChange={v => upd('visaNeeded', v)}
                label="I will need visa assistance"
                sub="Show visa acceptance rates and F-1 / student visa pathways"
                accentColor={accent} />
            </>
          )}

          <Field label="Campus Environment" required error={errors.campusEnvironment}>
            <div className="grid grid-cols-2 gap-2">
              {CAMPUS_ENVIRONMENTS.map(env => (
                <OptionCard key={env.id} selected={data.campusEnvironment === env.id} onClick={() => upd('campusEnvironment', env.id)} accentColor={accent}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{env.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{env.label}</div>
                      <div className="text-xs font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>{env.sub}</div>
                    </div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </Field>

          <Field label="Preferred School Size">
            <div className="grid grid-cols-2 gap-2">
              {SCHOOL_SIZES.map(s => (
                <OptionCard key={s.id} selected={data.schoolSize === s.id} onClick={() => upd('schoolSize', s.id)} accentColor={accent}>
                  <div className="text-sm font-bold" style={{ color: '#f0f0f8' }}>{s.label}</div>
                  <div className="text-xs font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>{s.sub}</div>
                </OptionCard>
              ))}
            </div>
          </Field>
        </div>
      );

      default: return null;
    }
  };

  // ── Layout ───────────────────────────────────────────────────────────────

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-10 pb-16" style={{ background: '#080810' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />

      <div className="w-full max-w-2xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-3" style={{ color: accent }}>RIVERNOVA</p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Build your intelligence profile</h1>
          <p className="text-sm font-light mt-2" style={{ color: 'rgba(240,240,248,0.4)' }}>The more you share, the smarter your AI advisor becomes.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Progress bar */}
          <div className="h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: i + 1 < currentStep ? accent : i + 1 === currentStep ? `${accent}cc` : 'rgba(255,255,255,0.12)',
                      transform: i + 1 === currentStep ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                </div>
              ))}
            </div>
            <span className="text-xs font-light" style={{ color: 'rgba(240,240,248,0.35)' }}>
              {currentStep} of {STEPS.length} · <span style={{ color: accent, fontWeight: 700 }}>{STEPS[currentStep - 1]}</span>
            </span>
          </div>

          {/* Validation error banner */}
          <AnimatePresence>
            {hasErrors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-8 mb-2"
              >
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <AlertCircle style={{ width: '14px', height: '14px', color: '#f87171', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#f87171' }}>Please fill in the required fields marked with * before continuing.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="px-8 pb-6" style={{ minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-20 hover:opacity-70"
              style={{ color: 'rgba(240,240,248,0.55)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-bold h-12 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: '#fff', boxShadow: `0 0 24px ${accent}40` }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === STEPS.length ? (
                'Complete Profile'
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs font-light mt-5" style={{ color: 'rgba(240,240,248,0.2)' }}>
          Zero commission. Your data stays private. Always.
        </p>
      </div>
    </div>
  );
}
