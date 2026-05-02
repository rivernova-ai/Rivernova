'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Check, GraduationCap, Target, DollarSign, Globe, Sparkles, AlertCircle } from 'lucide-react';
import {
  validateGPA,
  validateSATScore,
  validateACTScore,
  validateDreamJob,
  validateCareerField,
  validateBudgetRange,
} from '@/lib/validation';

interface Profile {
  id: string;
  full_name: string;
  academic_background: {
    currentEducation: string;
    gpa: string;
    satScore?: string;
    actScore?: string;
    major: string;
  };
  career_goals: {
    careerField: string;
    dreamJob: string;
    industries: string;
  };
  budget: {
    min: string;
    max: string;
    scholarshipNeeded: boolean;
    financialAid: boolean;
  };
  location_preferences: {
    preferredCountries: string;
    visaNeeded: boolean;
  };
  mode: 'domestic' | 'international' | 'lifelong';
}

interface FieldErrors {
  [key: string]: string;
}

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

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

      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user, authLoading, router]);

  const updateField = (section: string, field: string, value: any) => {
    if (!profile) return;

    setProfile(prev => {
      if (!prev) return prev;
      if (section === 'mode') {
        return { ...prev, mode: value };
      }
      return {
        ...prev,
        [section]: {
          ...(prev[section as keyof Profile] as object),
          [field]: value,
        },
      };
    });
    setHasChanges(true);
    
    // Clear error for this field when user starts typing
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${section}.${field}`];
      return newErrors;
    });
    
    // Validate field on change
    validateField(section, field, value);
  };

  const validateField = (section: string, field: string, value: string) => {
    const fieldKey = `${section}.${field}`;
    let error: string | undefined;

    if (section === 'academic_background') {
      if (field === 'gpa') {
        const validation = validateGPA(value);
        error = validation.error;
      } else if (field === 'satScore') {
        const validation = validateSATScore(value);
        error = validation.error;
      } else if (field === 'actScore') {
        const validation = validateACTScore(value);
        error = validation.error;
      }
    } else if (section === 'career_goals') {
      if (field === 'dreamJob') {
        const validation = validateDreamJob(value);
        error = validation.error;
      } else if (field === 'careerField') {
        const validation = validateCareerField(value);
        error = validation.error;
      }
    }

    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [fieldKey]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      }
    });
  };

  const validateBudgetFields = () => {
    if (!profile) return true;
    
    const validation = validateBudgetRange(profile.budget.min, profile.budget.max);
    if (!validation.isValid) {
      setFieldErrors(prev => ({
        ...prev,
        'budget.range': validation.error || 'Invalid budget range',
      }));
      return false;
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['budget.range'];
        return newErrors;
      });
      return true;
    }
  };

  const saveAllChanges = async () => {
    if (!profile || !user) return;

    // Validate all fields before saving
    if (!validateBudgetFields()) {
      return;
    }

    // Check for any existing errors
    if (Object.keys(fieldErrors).length > 0) {
      alert('Please fix all validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({
          academic_background: profile.academic_background,
          career_goals: profile.career_goals,
          budget: profile.budget,
          location_preferences: profile.location_preferences,
          mode: profile.mode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setHasChanges(false);
      setSavedField('all');
      setTimeout(() => setSavedField(null), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!profile) return null;

  const renderFormField = ({ label, field, section, type = 'text', placeholder, hint, error }: any) => (
    <div className="space-y-2">
      <Label className="text-sm text-white/60 font-light">{label}</Label>
      {type === 'textarea' ? (
        <Textarea
          value={(profile as any)[section]?.[field] || ''}
          onChange={(e) => updateField(section, field, e.target.value)}
          placeholder={placeholder}
          className={`bg-white/5 border rounded-xl min-h-[100px] font-light text-white placeholder:text-white/30 ${
            error ? 'border-red-500/50' : 'border-white/10'
          }`}
        />
      ) : (
        <Input
          type={type}
          value={(profile as any)[section]?.[field] || ''}
          onChange={(e) => updateField(section, field, e.target.value)}
          placeholder={placeholder}
          className={`bg-white/5 border h-11 rounded-xl font-light text-white placeholder:text-white/30 ${
            error ? 'border-red-500/50' : 'border-white/10'
          }`}
        />
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm font-light">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {hint && !error && <p className="text-xs text-white/40 font-light">{hint}</p>}
    </div>
  );

  const renderEditSection = ({ title, icon: Icon, fields, section }: any) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-light text-white">{title}</h2>
      </div>

      <div className="space-y-4">
        {fields.map((field: any) => (
          <div key={field.key}>
            {renderFormField({
              label: field.label,
              field: field.key,
              section: section,
              type: field.type,
              placeholder: field.placeholder,
              hint: field.hint,
              error: fieldErrors[`${section}.${field.key}`]
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </button>
            <div>
              <p className="text-xs text-white/40 font-light uppercase tracking-wider">Edit</p>
              <h1 className="text-2xl font-light text-white">Your Profile</h1>
            </div>
          </div>
          {hasChanges && (
            <Button
              onClick={saveAllChanges}
              disabled={saving || Object.keys(fieldErrors).length > 0}
              className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium h-10 px-6 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 md:px-8 py-12 space-y-16">
        {/* Academic Background */}
        {renderEditSection({
          title: "Academic Background",
          icon: GraduationCap,
          section: "academic_background",
          fields: [
            { key: 'currentEducation', label: 'Current Education Level', placeholder: 'e.g., High School Senior' },
            { key: 'gpa', label: 'GPA / Grade', type: 'number', placeholder: '0.0 - 4.0', hint: 'Enter a number between 0.0 and 4.0' },
            { key: 'satScore', label: 'SAT Score (Optional)', type: 'number', placeholder: '400 - 1600', hint: 'Enter a number between 400 and 1600' },
            { key: 'actScore', label: 'ACT Score (Optional)', type: 'number', placeholder: '1 - 36', hint: 'Enter a number between 1 and 36' },
            { key: 'major', label: 'Intended Major / Field of Study', placeholder: 'e.g., Computer Science' },
          ]
        })}

        {/* Career Goals */}
        {renderEditSection({
          title: "Career Goals",
          icon: Target,
          section: "career_goals",
          fields: [
            { key: 'careerField', label: 'Career Field', placeholder: 'e.g., Technology, Healthcare', hint: 'Text only, no numbers' },
            { key: 'dreamJob', label: 'Dream Job', placeholder: 'e.g., Software Engineer', hint: 'Text only, minimum 3 characters, no numbers' },
            { key: 'industries', label: 'Industries of Interest', type: 'textarea', placeholder: 'Tell us about your interests...' },
          ]
        })}

        {/* Budget & Financial */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-light text-white">Budget & Financial</h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderFormField({
                label: "Minimum Budget (USD/year)",
                field: "min",
                section: "budget",
                type: "number",
                placeholder: "e.g., 10000",
                hint: "Numbers only",
                error: fieldErrors['budget.min']
              })}
              {renderFormField({
                label: "Maximum Budget (USD/year)",
                field: "max",
                section: "budget",
                type: "number",
                placeholder: "e.g., 50000",
                hint: "Must be greater than minimum",
                error: fieldErrors['budget.max'] || fieldErrors['budget.range']
              })}
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={profile.budget.scholarshipNeeded || false}
                onChange={(e) => updateField('budget', 'scholarshipNeeded', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500"
              />
              <span className="text-white/80 font-light">I need scholarship opportunities</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={profile.budget.financialAid || false}
                onChange={(e) => updateField('budget', 'financialAid', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500"
              />
              <span className="text-white/80 font-light">I need financial aid</span>
            </label>
          </div>
        </div>

        {/* Location Preferences */}
        {renderEditSection({
          title: "Location Preferences",
          icon: Globe,
          section: "location_preferences",
          fields: [
            { key: 'preferredCountries', label: 'Preferred Countries', type: 'textarea', placeholder: 'e.g., United States, United Kingdom, Canada', hint: 'Separate multiple countries with commas' },
          ]
        })}

        <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <input
            type="checkbox"
            checked={profile.location_preferences.visaNeeded || false}
            onChange={(e) => updateField('location_preferences', 'visaNeeded', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500"
          />
          <span className="text-white/80 font-light">I will need visa assistance</span>
        </label>

        {/* Mode Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-light text-white">Study Mode</h2>
          </div>

          <div className="grid gap-3">
            {[
              { value: 'domestic', label: '🇺🇸 Domestic (US)', desc: 'Focus on US universities' },
              { value: 'international', label: '🌍 International', desc: 'Global university matching' },
              { value: 'lifelong', label: '🚀 Lifelong / Career', desc: 'Professional upskilling' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => updateField('mode', '', mode.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  profile.mode === mode.value
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="font-light text-white">{mode.label}</div>
                <div className="text-sm text-white/50 font-light">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Indicator */}
        {savedField && (
          <div className="fixed bottom-6 right-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 flex items-center gap-2 text-emerald-400 text-sm font-light animate-in fade-in slide-in-from-bottom-4">
            <Check className="w-4 h-4" />
            Changes saved
          </div>
        )}
      </div>
    </div>
  );
}
