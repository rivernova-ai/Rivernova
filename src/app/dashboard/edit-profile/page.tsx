'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Check, GraduationCap, Target, DollarSign, Globe, Sparkles } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  academic_background: {
    currentEducation: string;
    gpa: string;
    testScores: string;
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

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);

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
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof Profile],
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const saveAllChanges = async () => {
    if (!profile || !user) return;

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

  const EditSection = ({ title, icon: Icon, fields, section }: any) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-light text-white">{title}</h2>
      </div>

      <div className="space-y-4">
        {fields.map((field: any) => (
          <div key={field.key} className="space-y-2">
            <Label className="text-sm text-white/60 font-light">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={profile[section as keyof Profile][field.key] || ''}
                onChange={(e) => updateField(section, field.key, e.target.value)}
                placeholder={field.placeholder}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl min-h-[100px] font-light"
              />
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={profile[section as keyof Profile][field.key] || false}
                  onChange={(e) => updateField(section, field.key, e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500"
                />
                <span className="text-white/80 font-light">{field.label}</span>
              </label>
            ) : (
              <Input
                type={field.type || 'text'}
                value={profile[section as keyof Profile][field.key] || ''}
                onChange={(e) => updateField(section, field.key, e.target.value)}
                placeholder={field.placeholder}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl font-light"
              />
            )}
            {field.hint && <p className="text-xs text-white/40 font-light">{field.hint}</p>}
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
              disabled={saving}
              className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium h-10 px-6 transition-all"
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
        <EditSection
          title="Academic Background"
          icon={GraduationCap}
          section="academic_background"
          fields={[
            { key: 'currentEducation', label: 'Current Education Level', placeholder: 'e.g., High School Senior' },
            { key: 'gpa', label: 'GPA / Grade', placeholder: 'e.g., 3.8 / 4.0' },
            { key: 'testScores', label: 'Test Scores (Optional)', placeholder: 'e.g., SAT 1450, IELTS 7.5' },
            { key: 'major', label: 'Intended Major / Field of Study', placeholder: 'e.g., Computer Science' },
          ]}
        />

        {/* Career Goals */}
        <EditSection
          title="Career Goals"
          icon={Target}
          section="career_goals"
          fields={[
            { key: 'careerField', label: 'Career Field', placeholder: 'e.g., Technology, Healthcare' },
            { key: 'dreamJob', label: 'Dream Job', placeholder: 'e.g., Software Engineer' },
            { key: 'industries', label: 'Industries of Interest', type: 'textarea', placeholder: 'Tell us about your interests...' },
          ]}
        />

        {/* Budget & Financial */}
        <EditSection
          title="Budget & Financial"
          icon={DollarSign}
          section="budget"
          fields={[
            { key: 'min', label: 'Minimum Budget (USD/year)', type: 'number', placeholder: 'e.g., 10000' },
            { key: 'max', label: 'Maximum Budget (USD/year)', type: 'number', placeholder: 'e.g., 50000' },
            { key: 'scholarshipNeeded', label: 'I need scholarship opportunities', type: 'checkbox' },
            { key: 'financialAid', label: 'I need financial aid', type: 'checkbox' },
          ]}
        />

        {/* Location Preferences */}
        <EditSection
          title="Location Preferences"
          icon={Globe}
          section="location_preferences"
          fields={[
            { key: 'preferredCountries', label: 'Preferred Countries', type: 'textarea', placeholder: 'e.g., United States, United Kingdom, Canada', hint: 'Separate multiple countries with commas' },
            { key: 'visaNeeded', label: 'I will need visa assistance', type: 'checkbox' },
          ]}
        />

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
