'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface ApplicationWizardProps {
  mode: 'international' | 'domestic' | 'career';
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function ApplicationWizard({ mode, onComplete, onCancel }: ApplicationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fieldOfInterest: '',
    budget: '',
    locationPref: '',
    careerGoals: '',
    currentEdu: '',
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call delay for effect
    await new Promise(r => setTimeout(r, 1500));
    onComplete(formData);
    setLoading(false);
  };

  return (
    <div className="bg-[#0c0c10] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="mb-10 flex justify-between items-center">
        <div>
          <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Step {step} of 3</span>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
            {mode} <span className="gradient-text">Application</span>
          </h2>
        </div>
        <Button variant="ghost" onClick={onCancel} className="text-white/40 hover:text-white">Cancel</Button>
      </div>

      <div className="space-y-8 min-h-[300px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">What are you looking to study/pursue?</Label>
              <Input 
                placeholder="e.g. Computer Science, MBA, UI Design..." 
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                value={formData.fieldOfInterest}
                onChange={(e) => setFormData({...formData, fieldOfInterest: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Current Education Level</Label>
              <Select 
                value={formData.currentEdu} 
                onValueChange={(v) => setFormData({...formData, currentEdu: v})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                  <SelectItem value="high_school">High School / GED</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="professional">Professional Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Preferred Locations</Label>
              <Input 
                placeholder="e.g. Europe, USA, Remote, Berlin..." 
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                value={formData.locationPref}
                onChange={(e) => setFormData({...formData, locationPref: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Budget Range (Annual Tuition)</Label>
              <Select 
                value={formData.budget} 
                onValueChange={(v) => setFormData({...formData, budget: v})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                  <SelectValue placeholder="Select budget..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                  <SelectItem value="under_10k">Under $10,000</SelectItem>
                  <SelectItem value="10k_30k">$10,000 - $30,000</SelectItem>
                  <SelectItem value="30k_60k">$30,000 - $60,000</SelectItem>
                  <SelectItem value="over_60k">Over $60,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Long-term Career Goals</Label>
              <Textarea 
                placeholder="Where do you want to be in 5 years?" 
                className="bg-white/5 border-white/10 text-white min-h-[160px] rounded-2xl p-4"
                value={formData.careerGoals}
                onChange={(e) => setFormData({...formData, careerGoals: e.target.value})}
              />
              <p className="text-[10px] text-white/30 italic">Rivernova matching engine uses this to predict ROI and career fit.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-between">
        <Button 
          variant="outline" 
          disabled={step === 1 || loading}
          onClick={handleBack}
          className="rounded-xl border-white/10 hover:bg-white/5 text-white/60"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step < 3 ? (
          <Button 
            onClick={handleNext}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white h-12 px-8"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            disabled={loading}
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white h-12 px-8 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? 'Powering Research...' : 'Submit & Research'}
          </Button>
        )}
      </div>
    </div>
  );
}
