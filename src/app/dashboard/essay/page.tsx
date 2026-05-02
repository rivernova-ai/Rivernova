'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, FileText, Save, CheckCircle2, AlertCircle, Lightbulb, Target, XCircle, School } from 'lucide-react';

interface EssayAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

interface EssayStrategy {
  content: string;
  created_at: string;
}

const QUESTIONS = [
  {
    id: 'q1',
    icon: Lightbulb,
    question: 'Describe 3 experiences that changed how you think about the world',
    placeholder: 'Share specific moments that shifted your perspective...',
    hint: 'Be specific about what changed and why it matters',
  },
  {
    id: 'q2',
    icon: Target,
    question: 'What do you want to study and why? Be specific.',
    placeholder: 'Go beyond "I like science" — what specific problem or question drives you?',
    hint: 'Connect your passion to real experiences or observations',
  },
  {
    id: 'q3',
    icon: Sparkles,
    question: "What's something about you that your transcript and grades cannot show?",
    placeholder: 'Your personality, values, quirks, or hidden talents...',
    hint: 'This is your chance to show who you are beyond academics',
  },
  {
    id: 'q4',
    icon: FileText,
    question: 'What do you do on a Saturday with zero obligations?',
    placeholder: 'Be honest — what genuinely brings you joy or curiosity?',
    hint: 'Admissions officers want to see the real you',
  },
  {
    id: 'q5',
    icon: AlertCircle,
    question: 'What problem in the world makes you angry enough to want to fix it?',
    placeholder: 'What issue keeps you up at night? Why does it matter to you personally?',
    hint: 'Connect it to your own experiences or observations',
  },
];

export default function EssayPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<EssayAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });
  const [strategy, setStrategy] = useState<EssayStrategy | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/');
        return;
      }

      const supabase = createClient();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (!profile?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      const { data: essayData } = await supabase
        .from('essay_strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (essayData) {
        setAnswers(essayData.answers || {
          q1: '',
          q2: '',
          q3: '',
          q4: '',
          q5: '',
        });
        if (essayData.strategy) {
          setStrategy({
            content: essayData.strategy,
            created_at: essayData.created_at,
          });
        }
      }

      setLoading(false);
    };

    init();
  }, [user, authLoading, router]);

  const handleGenerate = async () => {
    const unanswered = QUESTIONS.filter(q => !answers[q.id as keyof EssayAnswers]?.trim());
    if (unanswered.length > 0) {
      setError(`Please answer all questions before generating your strategy.`);
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const response = await fetch('/api/essay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate strategy');
      }

      setStrategy({
        content: data.strategy,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate essay strategy. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!strategy) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: saveError } = await supabase
        .from('essay_strategies')
        .upsert({
          user_id: user!.id,
          answers,
          strategy: strategy.content,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (saveError) throw saveError;

      const btn = document.getElementById('save-btn');
      if (btn) {
        btn.textContent = 'Saved!';
        setTimeout(() => {
          btn.textContent = 'Save My Essay Strategy';
        }, 2000);
      }
    } catch (err: any) {
      setError('Failed to save strategy. Please try again.');
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

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-tight">Essay Positioning</h1>
              <p className="text-xs text-white/40 mt-0.5">Find your unique essay angle</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 space-y-12">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white mb-2">$5,000 Consultant Strategy — Free</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Answer 5 strategic questions and get a personalized essay positioning strategy from AI trained on successful Harvard, Stanford, and MIT applications.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {QUESTIONS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <div key={q.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.08] transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-white/30 font-light">Question {idx + 1}</span>
                    </div>
                    <h3 className="text-base font-light text-white leading-relaxed">{q.question}</h3>
                    <p className="text-xs text-white/40 mt-2">{q.hint}</p>
                  </div>
                </div>
                <Textarea
                  value={answers[q.id as keyof EssayAnswers]}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder}
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl min-h-[120px] focus:border-indigo-500/30 transition-all"
                />
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 px-8 h-12 text-base font-normal shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Your Story...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Essay Strategy
              </>
            )}
          </Button>
        </div>

        {strategy && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-light text-white">Your Essay Strategy</h2>
              </div>
              <Button
                id="save-btn"
                onClick={handleSave}
                disabled={saving}
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-6 text-sm font-light"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save My Essay Strategy
                  </>
                )}
              </Button>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] border border-indigo-500/10 rounded-2xl p-8">
              <div className="prose prose-invert max-w-none">
                <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-light">
                  {strategy.content}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-light text-white">Your Angle</h3>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  The strategy above identifies your strongest essay topic based on what makes you unique.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-light text-white">Avoid These</h3>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Common essay traps that admissions officers see hundreds of times.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <School className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-light text-white">School Fit</h3>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  How this angle aligns with your target schools' values and culture.
                </p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-base font-light text-white mb-4">Next Steps</h3>
              <ul className="space-y-3">
                {[
                  'Write your first draft using the opening sentence provided',
                  'Focus on showing, not telling — use specific details and moments',
                  'Have someone who knows you well read it and ask: "Does this sound like you?"',
                  'Revise based on the "avoid" list — cut any clichés or generic statements',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/60 text-sm font-light">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-indigo-400">{i + 1}</span>
                    </div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
