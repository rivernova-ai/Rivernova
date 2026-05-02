'use client';

import { useState, useRef, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Briefcase, Zap, Sparkles, ShieldCheck, GraduationCap, MapPin, Target, Wallet, ArrowUpRight, Send, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  
  // Chat State
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
            school: school,
            gpa: userProfile?.academic_background?.gpa,
            citizenship: userProfile?.mode === 'international' ? 'International' : 'Domestic'
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setReport(data);
        
        // Initial AI Message
        if (data.ai_recommendation) {
           setChatMessages([{
             id: 'initial',
             role: 'assistant',
             content: `Hi! I've analyzed **${school.name}** for you. My current verdict: *${data.ai_recommendation}*\n\nHow can I help you understand this ROI report further?`
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

  const handleChatSubmit = async (e: React.FormEvent) => {
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
          context: { schoolName: school.name, reportData: report }
        }),
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.message 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getROIColor = (roi: number) => {
    if (roi > 250) return { text: 'text-emerald-400', hex: '#10B981', bg: 'bg-emerald-500/10' };
    if (roi > 150) return { text: 'text-indigo-400', hex: '#6366F1', bg: 'bg-indigo-500/10' };
    if (roi > 80) return { text: 'text-amber-400', hex: '#F59E0B', bg: 'bg-amber-500/10' };
    return { text: 'text-rose-400', hex: '#F43F5E', bg: 'bg-rose-500/10' };
  };

  const colors = report ? getROIColor(report.roi_score) : null;

  const RevenueVsCostChart = ({ cost, revenue }: { cost: number; revenue: number }) => {
    const total = cost + revenue;
    const costPct = (cost / total) * 100;
    const revPct = (revenue / total) * 100;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
          <span>Investment Strategy</span>
          <span className="text-white">Revenue vs Cost</span>
        </div>
        <div className="h-4 w-full flex rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-rose-500/80" style={{ width: `${costPct}%` }} />
          <div className="h-full bg-emerald-500/80" style={{ width: `${revPct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase tracking-tighter">
          <span>Cost (${Math.round(cost/1000)}k)</span>
          <span>5Y Revenue (${Math.round(revenue/1000)}k)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#050505] md:rounded-[2.5rem] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col md:flex-row scale-in-center animate-in duration-700">
        
        {/* LEFT: ROI REPORT (70%) */}
        <div className="flex-1 flex flex-col border-r border-white/[0.05] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-10 py-8 border-b border-white/[0.05]">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">ROI Analysis</p>
                <h2 className="text-2xl font-bold text-white tracking-tight">{school.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden p-3 hover:bg-white/5 rounded-full">
              <X className="w-5 h-5 text-white/20" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                <p className="text-sm text-white/40 font-black tracking-widest uppercase">Calculating Metrics...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 md:col-span-1 bg-[#0A0A0A] border border-white/[0.08] rounded-[2rem] p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Strategic ROI</p>
                      <h1 className={`text-7xl font-black tracking-tighter ${colors?.text}`}>{Math.round(report.roi_score)}%</h1>
                    </div>
                    <div className="pt-8 space-y-2">
                      <p className="text-xl font-bold text-white">Market Positive</p>
                      <p className="text-sm text-white/40 leading-relaxed font-light">Significant long-term capital advantage detected.</p>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1 bg-[#0A0A0A] border border-white/[0.08] rounded-[2rem] p-10 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={colors?.hex} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={283}
                          strokeDashoffset={283 - (Math.min(report.breakeven_years, 10) / 10) * 283}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">{report.breakeven_years.toFixed(1)}</span>
                        <span className="text-[9px] text-white/40 uppercase font-black">Years</span>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] text-white/30 uppercase tracking-widest font-black">Break-even Point</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[2rem] p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Financial Simulation
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Aggressive Growth</span>
                    </div>
                  </div>
                  <RevenueVsCostChart cost={report.total_cost_4yr} revenue={report.year1_salary + report.year3_salary * 2 + report.year5_salary * 2} />
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.05]">
                    {[
                      { label: 'Y1 Salary', val: report.year1_salary },
                      { label: 'Y3 Salary', val: report.year3_salary },
                      { label: 'Y5 Salary', val: report.year5_salary },
                    ].map((s, i) => (
                      <div key={i} className="space-y-1 text-center">
                        <p className="text-[9px] text-white/20 uppercase font-black">{s.label}</p>
                        <p className="text-lg font-bold text-white tracking-tight">${Math.round(s.val/1000)}k</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   {[
                     { label: 'Degree Fit', val: 'Excellent', icon: GraduationCap },
                     { label: 'Career Index', val: 'High', icon: Briefcase },
                     { label: 'Status', val: 'Verified', icon: CheckCircle2 },
                   ].map((m, i) => (
                     <div key={i} className="flex flex-col items-center gap-2 p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl text-center">
                       <m.icon className="w-4 h-4 text-white/30" />
                       <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">{m.label}</p>
                       <p className="text-xs font-bold text-white">{m.val}</p>
                     </div>
                   ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: CLAUDE AI CHAT (30%) */}
        <div className="w-full md:w-[400px] flex flex-col bg-[#0A0A0A]/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-8 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI Advisor</h3>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Counselor Mode</p>
              </div>
            </div>
            <button onClick={onClose} className="hidden md:block p-3 hover:bg-white/5 rounded-full group">
              <X className="w-5 h-5 text-white/20 group-hover:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {chatMessages.length === 0 && !loading && (
              <div className="text-center py-12 space-y-4">
                <MessageCircle className="w-8 h-8 text-white/10 mx-auto" />
                <p className="text-white/40 text-sm italic">Analyze this report with AI...</p>
              </div>
            )}
            
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10 text-white/90'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_strong]:text-white [&_p]:mb-2 [&_p:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-8 border-t border-white/[0.05] space-y-4">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Textarea 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this school..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none min-h-[44px] max-h-[120px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e as any);
                  }
                }}
              />
              <Button type="submit" disabled={isChatLoading || !chatInput.trim()} className="h-[44px] px-4 bg-indigo-500 hover:bg-indigo-400 border-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <p className="text-[9px] text-rose-400/80 leading-relaxed text-center font-medium">
                <AlertCircle className="w-3 h-3 inline mr-1 mb-0.5" />
                AI can make mistakes. Always double check critical financial data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
