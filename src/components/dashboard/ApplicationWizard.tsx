'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';

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
    await new Promise(r => setTimeout(r, 1500));
    onComplete(formData);
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0f0f8',
    borderRadius: '14px',
    height: '52px',
  };

  return (
    <div className="rounded-[28px] p-8 md:p-10 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)' }}>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#818cf8' }}>Step {step} of 3</span>
          <h2 className="text-2xl font-light mt-1 tracking-tight capitalize" style={{ color: '#f0f0f8' }}>
            {mode} <span className="font-semibold">Application</span>
          </h2>
        </div>
        <button onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,248,0.4)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f0f0f8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,240,248,0.4)'; }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 min-h-[260px]">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="space-y-2">
              <Label className="text-[11px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.45)' }}>
                What are you looking to study / pursue?
              </Label>
              <Input
                placeholder="e.g. Computer Science, MBA, UI Design…"
                style={inputStyle}
                className="placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500/50"
                value={formData.fieldOfInterest}
                onChange={(e) => setFormData({ ...formData, fieldOfInterest: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.45)' }}>
                Current Education Level
              </Label>
              <Select value={formData.currentEdu || undefined} onValueChange={(v) => setFormData({ ...formData, currentEdu: v ?? '' })}>
                <SelectTrigger style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)' }} className="placeholder:text-white/20">
                  <SelectValue placeholder="Select level…" />
                </SelectTrigger>
                <SelectContent style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8' }}>
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
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="space-y-2">
              <Label className="text-[11px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.45)' }}>
                Preferred Locations
              </Label>
              <Input
                placeholder="e.g. Europe, USA, Remote, Berlin…"
                style={inputStyle}
                className="placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500/50"
                value={formData.locationPref}
                onChange={(e) => setFormData({ ...formData, locationPref: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.45)' }}>
                Budget Range (Annual Tuition)
              </Label>
              <Select value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v || '' })}>
                <SelectTrigger style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)' }} className="placeholder:text-white/20">
                  <SelectValue placeholder="Select budget…" />
                </SelectTrigger>
                <SelectContent style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8' }}>
                  <SelectItem value="under_10k">Under $10,000</SelectItem>
                  <SelectItem value="10k_30k">$10,000 – $30,000</SelectItem>
                  <SelectItem value="30k_60k">$30,000 – $60,000</SelectItem>
                  <SelectItem value="over_60k">Over $60,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="space-y-2">
              <Label className="text-[11px] font-light uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.45)' }}>
                Long-term Career Goals
              </Label>
              <Textarea
                placeholder="Where do you want to be in 5 years?"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f0f0f8',
                  borderRadius: '14px',
                  minHeight: '160px',
                }}
                className="p-4 placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500/50"
                value={formData.careerGoals}
                onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
              />
              <p className="text-[11px] font-light italic" style={{ color: 'rgba(240,240,248,0.3)' }}>
                Rivernova matching engine uses this to predict ROI and career fit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="mt-10 flex justify-between items-center">
        <button
          disabled={step === 1 || loading}
          onClick={handleBack}
          className="flex items-center gap-2 text-[13px] font-medium h-10 px-5 rounded-xl transition-all disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.6)' }}
          onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {step < 3 ? (
          <button onClick={handleNext}
            className="flex items-center gap-2 text-[13px] font-medium h-10 px-6 rounded-xl transition-all duration-200"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'; }}>
            Next Step <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button disabled={loading} onClick={handleSubmit}
            className="flex items-center gap-2 text-[13px] font-medium h-10 px-6 rounded-xl transition-all duration-300 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Analyzing…' : 'Submit & Research'}
          </button>
        )}
      </div>
    </div>
  );
}
