'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepIndicator } from './StepIndicator';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, ArrowLeft, Loader2, GraduationCap, Target, DollarSign, Globe, Sparkles } from 'lucide-react';

const STEPS = ['Academic', 'Goals', 'Budget', 'Location', 'Mode'];

interface OnboardingData {
  // Step 1: Academic
  currentEducation: string;
  gpa: string;
  testScores: string;
  major: string;
  
  // Step 2: Career Goals
  careerField: string;
  dreamJob: string;
  industries: string;
  
  // Step 3: Budget
  budgetMin: string;
  budgetMax: string;
  scholarshipNeeded: boolean;
  financialAid: boolean;
  
  // Step 4: Location
  preferredCountries: string;
  visaNeeded: boolean;
  
  // Step 5: Mode
  mode: 'domestic' | 'international' | 'lifelong';
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    currentEducation: '',
    gpa: '',
    testScores: '',
    major: '',
    careerField: '',
    dreamJob: '',
    industries: '',
    budgetMin: '',
    budgetMax: '',
    scholarshipNeeded: false,
    financialAid: false,
    preferredCountries: '',
    visaNeeded: false,
    mode: 'international',
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in first');
        router.push('/');
        return;
      }

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          academic_background: {
            currentEducation: data.currentEducation,
            gpa: data.gpa,
            testScores: data.testScores,
            major: data.major,
          },
          career_goals: {
            careerField: data.careerField,
            dreamJob: data.dreamJob,
            industries: data.industries,
          },
          budget: {
            min: data.budgetMin,
            max: data.budgetMax,
            scholarshipNeeded: data.scholarshipNeeded,
            financialAid: data.financialAid,
          },
          location_preferences: {
            preferredCountries: data.preferredCountries,
            visaNeeded: data.visaNeeded,
          },
          mode: data.mode,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Force a small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            Let's Get Started
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Build Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-white/60 text-lg">Help us find your perfect matches</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
          <StepIndicator currentStep={currentStep} totalSteps={5} steps={STEPS} />

          {/* Step 1: Academic Background */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Academic Background</h2>
                  <p className="text-white/60 text-sm">Tell us about your education</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80">Current Education Level</Label>
                  <Input
                    value={data.currentEducation}
                    onChange={(e) => updateData('currentEducation', e.target.value)}
                    placeholder="e.g., High School Senior, Bachelor's Degree"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">GPA / Grade</Label>
                    <Input
                      value={data.gpa}
                      onChange={(e) => updateData('gpa', e.target.value)}
                      placeholder="e.g., 3.8 / 4.0"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Test Scores (Optional)</Label>
                    <Input
                      value={data.testScores}
                      onChange={(e) => updateData('testScores', e.target.value)}
                      placeholder="e.g., SAT 1450, IELTS 7.5"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/80">Intended Major / Field of Study</Label>
                  <Input
                    value={data.major}
                    onChange={(e) => updateData('major', e.target.value)}
                    placeholder="e.g., Computer Science, Business, Medicine"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Career Goals */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Career Goals</h2>
                  <p className="text-white/60 text-sm">What's your dream career?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80">Career Field</Label>
                  <Input
                    value={data.careerField}
                    onChange={(e) => updateData('careerField', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label className="text-white/80">Dream Job</Label>
                  <Input
                    value={data.dreamJob}
                    onChange={(e) => updateData('dreamJob', e.target.value)}
                    placeholder="e.g., Software Engineer, Doctor, Investment Banker"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label className="text-white/80">Industries of Interest</Label>
                  <Textarea
                    value={data.industries}
                    onChange={(e) => updateData('industries', e.target.value)}
                    placeholder="Tell us about the industries you're interested in..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl mt-2 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Budget & Financial</h2>
                  <p className="text-white/60 text-sm">What's your budget range?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Minimum Budget (USD/year)</Label>
                    <Input
                      type="number"
                      value={data.budgetMin}
                      onChange={(e) => updateData('budgetMin', e.target.value)}
                      placeholder="e.g., 10000"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Maximum Budget (USD/year)</Label>
                    <Input
                      type="number"
                      value={data.budgetMax}
                      onChange={(e) => updateData('budgetMax', e.target.value)}
                      placeholder="e.g., 50000"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.scholarshipNeeded}
                      onChange={(e) => updateData('scholarshipNeeded', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-white font-medium">I need scholarship opportunities</div>
                      <div className="text-white/60 text-sm">Show me schools with scholarship programs</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.financialAid}
                      onChange={(e) => updateData('financialAid', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-white font-medium">I need financial aid</div>
                      <div className="text-white/60 text-sm">Include schools with financial aid options</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Location Preferences</h2>
                  <p className="text-white/60 text-sm">Where do you want to study?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80">Preferred Countries</Label>
                  <Textarea
                    value={data.preferredCountries}
                    onChange={(e) => updateData('preferredCountries', e.target.value)}
                    placeholder="e.g., United States, United Kingdom, Canada, Australia, Germany"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl mt-2 min-h-[100px]"
                  />
                  <p className="text-white/40 text-xs mt-2">Separate multiple countries with commas</p>
                </div>

                <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={data.visaNeeded}
                    onChange={(e) => updateData('visaNeeded', e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-white font-medium">I will need visa assistance</div>
                    <div className="text-white/60 text-sm">Show me visa success rates and requirements</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Mode Selection */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Choose Your Mode</h2>
                  <p className="text-white/60 text-sm">Select your primary focus</p>
                </div>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => updateData('mode', 'domestic')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.mode === 'domestic'
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">🇺🇸 Domestic (US)</h3>
                  <p className="text-white/60">Focus on US universities with in-state tuition, local scholarships, and domestic ROI analysis.</p>
                </button>

                <button
                  onClick={() => updateData('mode', 'international')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.mode === 'international'
                      ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">🌍 International</h3>
                  <p className="text-white/60">Global university matching with visa pathways, international scholarships, and cross-border opportunities.</p>
                </button>

                <button
                  onClick={() => updateData('mode', 'lifelong')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.mode === 'lifelong'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">🚀 Lifelong / Career</h3>
                  <p className="text-white/60">Professional upskilling, bootcamps, certifications, and job matching for career advancement.</p>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-white/40 text-sm">
              Step {currentStep} of {STEPS.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="rounded-xl h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentStep === 5 ? (
                'Complete'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
