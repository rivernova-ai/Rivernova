'use client';

import { useState, useRef, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, Briefcase, ShieldCheck, GraduationCap, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ROIReportModalProps {
  school: any;
  userProfile: any;
  onClose: () => void;
}

export function ROIReportModal({ school, userProfile, onClose }: ROIReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string; role: string; content: string}>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch('/api/roi-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school,
            gpa: userProfile?.academic_background?.gpa,
            citizenship: userProfile?.mode === 'international' ? 'International' : 'Domestic',
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setReport(data);

        if (data.ai_recommendation) {
          setChatMessages([{
            id: 'initial',
            role: 'assistant',
            content: `I've analyzed the financial trajectory for **${school.name}**. Based on your profile, here is my direct assessment:\n\n*${data.ai_recommendation}*\n\nWould you like to explore the specific cost breakdowns or career projections?`,
          }]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [school, userProfile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!school) return null;

  const handleChatSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          context: { schoolName: school.name, reportData: report },
        }),
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getROIColor = (roi: number) => {
    if (roi > 250) return '#34d399';
    if (roi > 150) return '#818cf8';
    if (roi > 80) return '#fb923c';
    return '#f87171';
  };

  const roiColor = report ? getROIColor(report.roi_score) : '#818cf8';

  const totalRevenue = report
    ? report.year1_salary + report.year3_salary * 2 + report.year5_salary * 2
    : 0;
  const total = report ? report.total_cost_4yr + totalRevenue : 1;
  const costPct = report ? (report.total_cost_4yr / total) * 100 : 0;
  const revPct = report ? (totalRevenue / total) * 100 : 0;

  const breakCircumference = 2 * Math.PI * 46;
  const breakOffset = report
    ? breakCircumference - (Math.min(report.breakeven_years, 10) / 10) * breakCircumference
    : breakCircumference;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(16px)',
      padding: '0',
    }}>
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: '1100px',
        height: '88vh',
        background: '#080810',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        margin: '0 16px',
      }}>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px', pointerEvents: 'none',
          background: `radial-gradient(ellipse, ${roiColor}0a 0%, transparent 65%)`,
        }} />

        {/* TOP shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)',
        }} />

        {/* ========== LEFT: REPORT ========== */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '28px 36px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0, marginBottom: '6px' }}>
                Financial Intelligence
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 300, color: '#f0f0f8', margin: 0, letterSpacing: '-0.02em' }}>
                {school.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(240,240,248,0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', minHeight: '300px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.05)',
                  borderTop: '2px solid rgba(99,102,241,0.7)',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0 }}>
                  Analyzing Data
                </p>
              </div>
            ) : error ? (
              <div style={{
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
              </div>
            ) : report && (
              <>
                {report.data_warning && (
                  <div style={{
                    background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '12px', padding: '14px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <AlertCircle style={{ width: '15px', height: '15px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '11px', color: 'rgba(251,191,36,0.8)', margin: 0, lineHeight: 1.6 }}>{report.data_warning}</p>
                  </div>
                )}

                {/* ROI + Breakeven row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* ROI card */}
                  <div style={{
                    background: `${roiColor}08`,
                    border: `1px solid ${roiColor}22`,
                    borderRadius: '16px', padding: '24px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0 }}>
                      ROI Match Score
                    </p>
                    <p style={{ fontSize: '64px', fontWeight: 800, color: roiColor, margin: '8px 0 0', lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {Math.round(report.roi_score)}%
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(240,240,248,0.35)', margin: '10px 0 0', fontWeight: 300 }}>
                      Efficient match based on your academic profile.
                    </p>
                  </div>

                  {/* Breakeven card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  }}>
                    <svg width="96" height="96" viewBox="0 0 100 100">
                      <defs>
                        <filter id="roiGlow">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="46" fill="none"
                        stroke={roiColor} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={breakCircumference}
                        strokeDashoffset={breakOffset}
                        transform="rotate(-90 50 50)"
                        style={{ filter: `drop-shadow(0 0 4px ${roiColor}80)`, opacity: 0.8 }}
                      />
                      <text x="50" y="46" textAnchor="middle" fill="#f0f0f8" fontSize="18" fontWeight="700">{report.breakeven_years.toFixed(1)}</text>
                      <text x="50" y="60" textAnchor="middle" fill="rgba(240,240,248,0.4)" fontSize="8" fontWeight="700" letterSpacing="2">YRS</text>
                    </svg>
                    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0 }}>
                      Breakeven Point
                    </p>
                  </div>
                </div>

                {/* Outcome simulation */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp style={{ width: '15px', height: '15px', color: 'rgba(240,240,248,0.3)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.5)' }}>
                        Outcome Simulation
                      </span>
                    </div>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'rgba(52,211,153,0.7)', background: 'rgba(52,211,153,0.08)',
                      padding: '3px 8px', borderRadius: '6px',
                    }}>Growth Phase</span>
                  </div>

                  {/* Bar chart */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.25)' }}>
                      <span>Investment vs Revenue</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ height: '100%', background: 'rgba(248,113,113,0.5)', width: `${costPct}%`, borderRadius: '4px 0 0 4px' }} />
                      <div style={{ height: '100%', background: 'rgba(52,211,153,0.5)', width: `${revPct}%`, borderRadius: '0 4px 4px 0' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 500, color: 'rgba(240,240,248,0.3)' }}>
                      <span style={{ color: 'rgba(248,113,113,0.6)' }}>Cost (${Math.round(report.total_cost_4yr / 1000)}k)</span>
                      <span style={{ color: 'rgba(52,211,153,0.6)' }}>5Y Revenue (${Math.round(totalRevenue / 1000)}k)</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                      { label: 'Year 1', val: report.year1_salary },
                      { label: 'Year 3', val: report.year3_salary },
                      { label: 'Year 5', val: report.year5_salary },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0, marginBottom: '4px' }}>{s.label}</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#f0f0f8', margin: 0 }}>${Math.round(s.val / 1000)}k</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {[
                    { label: 'Academic Fit', val: 'Match', icon: GraduationCap, color: '#818cf8' },
                    { label: 'Career Scale', val: 'High', icon: Briefcase, color: '#34d399' },
                    { label: 'Data Status', val: 'Verified', icon: ShieldCheck, color: '#fb923c' },
                  ].map((m) => (
                    <div key={m.label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '16px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}>
                      <m.icon style={{ width: '14px', height: '14px', color: m.color }} />
                      <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.3)', margin: 0 }}>{m.label}</p>
                      <p style={{ fontSize: '11px', fontWeight: 500, color: m.color, margin: 0 }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========== RIGHT: ADVISOR CHAT ========== */}
        <div style={{
          width: '360px',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(255,255,255,0.015)',
          flexShrink: 0,
        }}>
          {/* Chat header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '28px 28px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 300, color: '#f0f0f8', margin: 0, letterSpacing: '-0.01em' }}>Advisor</h3>
              <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,240,248,0.25)', margin: 0 }}>Zero Commission</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.6)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.5)' }}>Active</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '95%',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '12px 14px',
                  fontSize: '12px', lineHeight: 1.6, fontWeight: 300,
                  ...(msg.role === 'user' ? {
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(240,240,248,0.85)',
                  }),
                }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ fontSize: '12px', lineHeight: 1.7 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'rgba(240,240,248,0.3)',
                    animation: `bounce 1.2s ease infinite`,
                    animationDelay: `${i * 0.18}s`,
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <form onSubmit={handleChatSubmit}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '8px 8px 8px 14px',
              }}>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e as any);
                    }
                  }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '12px', fontWeight: 300, color: '#f0f0f8', resize: 'none',
                    fontFamily: 'inherit', lineHeight: 1.6,
                    minHeight: '38px', maxHeight: '100px',
                  }}
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    background: chatInput.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                    border: 'none', cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: chatInput.trim() ? '#fff' : 'rgba(240,240,248,0.2)',
                    transition: 'all 0.2s ease',
                    boxShadow: chatInput.trim() ? '0 0 12px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  <ArrowUpRight style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            </form>
            <p style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(240,240,248,0.2)', textAlign: 'center', margin: '10px 0 0', letterSpacing: '0.05em' }}>
              AI advisor can make mistakes. Verify critical data.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
        textarea::placeholder { color: rgba(240,240,248,0.2); }
        textarea:focus { outline: none; }
        textarea { color-scheme: dark; }
        * { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.25) transparent; }
      `}</style>
    </div>
  );
}
