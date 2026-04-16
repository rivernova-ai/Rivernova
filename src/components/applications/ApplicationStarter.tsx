'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Calendar, Sparkles, Loader2 } from 'lucide-react';

interface ApplicationStarterProps {
  schoolName: string;
  programName: string;
  userProfile: any;
}

export function ApplicationStarter({ schoolName, programName, userProfile }: ApplicationStarterProps) {
  const [generating, setGenerating] = useState(false);
  const [essayOutline, setEssayOutline] = useState<string | null>(null);

  const generateEssay = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/applications/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          programName,
          userProfile,
        }),
      });

      const data = await response.json();
      setEssayOutline(data.outline);
    } catch (error) {
      console.error('Error generating essay:', error);
      alert('Failed to generate essay outline');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Checklist */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-indigo-400" />
          Application Checklist
        </h3>

        <div className="space-y-3">
          {[
            'Complete online application form',
            'Submit official transcripts',
            'Provide test scores (SAT/ACT/IELTS)',
            'Write personal statement essay',
            'Obtain 2-3 letters of recommendation',
            'Pay application fee',
            'Submit financial documents (if required)',
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-white/80">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Essay Starter */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FileText className="w-7 h-7 text-purple-400" />
          Essay Starter
        </h3>
        <p className="text-white/60 mb-6">
          Get AI-generated essay outlines tailored to {schoolName}'s application requirements.
        </p>

        {!essayOutline ? (
          <Button
            onClick={generateEssay}
            disabled={generating}
            className="rounded-xl h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white border-0"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Essay Outline
              </>
            )}
          </Button>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {essayOutline}
            </pre>
          </div>
        )}
      </div>

      {/* Important Dates */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-emerald-400" />
          Important Dates
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center flex-shrink-0">
              <div className="text-2xl font-bold text-indigo-400">15</div>
              <div className="text-xs text-indigo-400/60">JAN</div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Early Decision Deadline</h4>
              <p className="text-white/60 text-sm">Submit all materials by this date for early consideration</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center flex-shrink-0">
              <div className="text-2xl font-bold text-purple-400">01</div>
              <div className="text-xs text-purple-400/60">MAR</div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Regular Decision Deadline</h4>
              <p className="text-white/60 text-sm">Final deadline for regular admission applications</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center flex-shrink-0">
              <div className="text-2xl font-bold text-emerald-400">15</div>
              <div className="text-xs text-emerald-400/60">APR</div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Decision Notification</h4>
              <p className="text-white/60 text-sm">Admission decisions will be released</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
