'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
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
    accent: '#818cf8',
  },
  {
    id: 'q2',
    icon: Target,
    question: 'What do you want to study and why? Be specific.',
    placeholder: 'Go beyond "I like science" — what specific problem or question drives you?',
    hint: 'Connect your passion to real experiences or observations',
    accent: '#34d399',
  },
  {
    id: 'q3',
    icon: Sparkles,
    question: "What's something about you that your transcript and grades cannot show?",
    placeholder: 'Your personality, values, quirks, or hidden talents...',
    hint: 'This is your chance to show who you are beyond academics',
    accent: '#c084fc',
  },
  {
    id: 'q4',
    icon: FileText,
    question: 'What do you do on a Saturday with zero obligations?',
    placeholder: 'Be honest — what genuinely brings you joy or curiosity?',
    hint: 'Admissions officers want to see the real you',
    accent: '#fb923c',
  },
  {
    id: 'q5',
    icon: AlertCircle,
    question: 'What problem in the world makes you angry enough to want to fix it?',
    placeholder: 'What issue keeps you up at night? Why does it matter to you personally?',
    hint: 'Connect it to your own experiences or observations',
    accent: '#f472b6',
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
  const [savedFlash, setSavedFlash] = useState(false);

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
        setAnswers(essayData.answers || { q1: '', q2: '', q3: '', q4: '', q5: '' });
        if (essayData.strategy) {
          setStrategy({ content: essayData.strategy, created_at: essayData.created_at });
        }
      }

      setLoading(false);
    };

    init();
  }, [user, authLoading, router]);

  const handleGenerate = async () => {
    const unanswered = QUESTIONS.filter(q => !answers[q.id as keyof EssayAnswers]?.trim());
    if (unanswered.length > 0) {
      setError('Please answer all questions before generating your strategy.');
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

      setStrategy({ content: data.strategy, created_at: new Date().toISOString() });
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
        }, { onConflict: 'user_id' });

      if (saveError) throw saveError;

      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err: any) {
      setError('Failed to save strategy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ background: '#080810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366f1' }} />
      </div>
    );
  }

  const answeredCount = QUESTIONS.filter(q => answers[q.id as keyof EssayAnswers]?.trim()).length;
  const progressPct = (answeredCount / QUESTIONS.length) * 100;

  return (
    <div style={{ background: '#080810', minHeight: '100vh' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)',
        }} />
      </div>

      {/* Navbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,16,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px) saturate(160%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText style={{ width: '18px', height: '18px', color: '#818cf8' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 300, color: '#f0f0f8', letterSpacing: '-0.01em', margin: 0 }}>
                Essay Positioning
              </h1>
              <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.35)', margin: 0 }}>Find your unique essay angle</p>
            </div>

            {/* Progress indicator */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(240,240,248,0.35)' }}>{answeredCount}/{QUESTIONS.length} answered</span>
              <div style={{
                width: '80px', height: '3px', borderRadius: '2px',
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Value banner */}
        <div style={{
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(251,191,36,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 400, color: '#f0f0f8', margin: 0, marginBottom: '4px' }}>
              $5,000 Consultant Strategy — Free
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(240,240,248,0.45)', margin: 0, lineHeight: 1.6 }}>
              Answer 5 strategic questions and get a personalized essay positioning strategy from AI trained on successful Harvard, Stanford, and MIT applications.
            </p>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {QUESTIONS.map((q, idx) => {
            const Icon = q.icon;
            const answered = !!answers[q.id as keyof EssayAnswers]?.trim();
            return (
              <div
                key={q.id}
                style={{
                  background: answered
                    ? `linear-gradient(135deg, ${q.accent}08, rgba(255,255,255,0.02))`
                    : 'rgba(255,255,255,0.03)',
                  border: answered
                    ? `1px solid ${q.accent}28`
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: `${q.accent}14`,
                    border: `1px solid ${q.accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '16px', height: '16px', color: q.accent }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: q.accent, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Question {idx + 1}
                      </span>
                      {answered && (
                        <CheckCircle2 style={{ width: '12px', height: '12px', color: '#34d399' }} />
                      )}
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 300, color: '#f0f0f8', margin: 0, lineHeight: 1.5 }}>{q.question}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.3)', margin: '6px 0 0' }}>{q.hint}</p>
                  </div>
                </div>
                <textarea
                  value={answers[q.id as keyof EssayAnswers]}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={q.placeholder}
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${answered ? q.accent + '30' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: '#f0f0f8',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = q.accent + '60'; }}
                  onBlur={(e) => { e.target.style.borderColor = answered ? q.accent + '30' : 'rgba(255,255,255,0.08)'; }}
                />
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Generate button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0 32px', height: '48px',
              borderRadius: '100px',
              background: generating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 400,
              cursor: generating ? 'not-allowed' : 'pointer',
              boxShadow: generating ? 'none' : '0 0 32px rgba(99,102,241,0.4)',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit',
            }}
          >
            {generating ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                Analyzing Your Story...
              </>
            ) : (
              <>
                <Sparkles style={{ width: '18px', height: '18px' }} />
                Generate My Essay Strategy
              </>
            )}
          </button>
        </div>

        {/* Strategy output */}
        {strategy && (
          <div style={{ animation: 'fadeSlideUp 0.6s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 300, color: '#f0f0f8', margin: 0 }}>Your Essay Strategy</h2>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '0 20px', height: '38px',
                  borderRadius: '100px',
                  background: savedFlash ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                  border: savedFlash ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: savedFlash ? '#34d399' : 'rgba(240,240,248,0.6)',
                  fontSize: '12px',
                  fontWeight: 400,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : savedFlash ? (
                  <>
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save style={{ width: '14px', height: '14px' }} />
                    Save My Essay Strategy
                  </>
                )}
              </button>
            </div>

            {/* Strategy content */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05))',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '13px', fontWeight: 300,
                color: 'rgba(240,240,248,0.85)',
                lineHeight: 1.85,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {strategy.content}
              </p>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: Target, color: '#34d399', label: 'Your Angle', desc: 'The strategy above identifies your strongest essay topic based on what makes you unique.' },
                { icon: XCircle, color: '#f87171', label: 'Avoid These', desc: 'Common essay traps that admissions officers see hundreds of times.' },
                { icon: School, color: '#818cf8', label: 'School Fit', desc: "How this angle aligns with your target schools' values and culture." },
              ].map(({ icon: Icon, color, label, desc }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Icon style={{ width: '15px', height: '15px', color }} />
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#f0f0f8' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.4)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 300, color: '#f0f0f8', margin: '0 0 16px' }}>Next Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Write your first draft using the opening sentence provided',
                  'Focus on showing, not telling — use specific details and moments',
                  'Have someone who knows you well read it and ask: "Does this sound like you?"',
                  'Revise based on the "avoid" list — cut any clichés or generic statements',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 500 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: 'rgba(240,240,248,0.5)', fontWeight: 300, lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder { color: rgba(240,240,248,0.25); }
        textarea:focus { outline: none; }
        textarea { color-scheme: dark; }
        * { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.3) transparent; }
      `}</style>
    </div>
  );
}
