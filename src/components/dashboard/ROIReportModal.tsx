'use client';

import { useState, useRef, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Briefcase, Zap, Sparkles, ShieldCheck, GraduationCap, MapPin, Target, Wallet, ArrowUpRight, Send, Loader2 } from 'lucide-react';
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
        
        if (data.ai_recommendation) {
           setChatMessages([{
             id: 'initial',
             role: 'assistant',
             content: `I've analyzed the financial trajectory for **${school.name}**. Based on your profile, here is my direct assessment: \n\n*${data.ai_recommendation}*\n\nWould you like to explore the specific cost breakdowns or career projections?`
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
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
          <span>Investment vs Revenue</span>
        </div>
        <div className="h-2 w-full flex rounded-full overflow-hidden bg-white/5">
          <div className="h-full bg-rose-500/60" style={{ width: `${costPct}%` }} />
          <div className="h-full bg-emerald-500/60" style={{ width: `${revPct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] font-medium text-white/30 uppercase tracking-tighter">
          <span>Cost (${Math.round(cost/1000)}k)</span>
          <span>5Y Revenue (${Math.round(revenue/1000)}k)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#050505] md:rounded-[2rem] border border-white/[0.06] shadow-2xl overflow-hidden flex flex-col md:flex-row scale-in-center animate-in duration-700">
        
        {/* LEFT: MINIMALIST REPORT */}
        <div className="flex-1 flex flex-col border-r border-white/[0.05] overflow-hidden bg-[#050505]">
          <div className="flex items-center justify-between px-12 py-10">
            <div className="space-y-1">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Financial Intelligence</p>
              <h2 className="text-3xl font-bold text-white tracking-tight">{school.name}</h2>
            </div>
            <button onClick={onClose} className="md:hidden p-3 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-12 pb-12 space-y-12">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white/40 animate-spin" />
                <p className="text-xs text-white/20 font-bold tracking-widest uppercase">Analyzing Data</p>
              </div>
            ) : (
              <>
                {report?.data_warning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">
                      {report.data_warning}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 md:col-span-1 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">ROI Match Score</p>
                      <h1 className={`text-8xl font-black tracking-tighter ${colors?.text}`}>{Math.round(report.roi_score)}%</h1>
                    </div>
                    <div className="pt-8">
                      <p className="text-sm text-white/40 leading-relaxed font-light">A highly efficient match based on your academic profile and target major.</p>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] p-10 flex flex-col items-center justify-center">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="6" />
                        <circle cx="50" cy="50" r="46" fill="none" stroke={colors?.hex} strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={289}
                          strokeDashoffset={289 - (Math.min(report.breakeven_years, 10) / 10) * 289}
                          transform="rotate(-90 50 50)"
                          className="opacity-60"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{report.breakeven_years.toFixed(1)}</span>
                        <span className="text-[8px] text-white/30 uppercase font-black">Years</span>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest font-bold">Breakeven Point</p>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-white/40" />
                      Outcome Simulation
                    </h3>
                    <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-md">Growth Phase</span>
                  </div>
                  <RevenueVsCostChart cost={report.total_cost_4yr} revenue={report.year1_salary + report.year3_salary * 2 + report.year5_salary * 2} />
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.03]">
                    {[
                      { label: 'Year 1', val: report.year1_salary },
                      { label: 'Year 3', val: report.year3_salary },
                      { label: 'Year 5', val: report.year5_salary },
                    ].map((s, i) => (
                      <div key={i} className="space-y-1 text-center">
                        <p className="text-[9px] text-white/20 uppercase font-bold">{s.label}</p>
                        <p className="text-lg font-bold text-white tracking-tight">${Math.round(s.val/1000)}k</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   {[
                     { label: 'Academic Fit', val: 'Match', icon: GraduationCap },
                     { label: 'Career Scale', val: 'High', icon: Briefcase },
                     { label: 'Data Status', val: 'Verified', icon: ShieldCheck },
                   ].map((m, i) => (
                     <div key={i} className="flex flex-col items-center gap-2 p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl text-center">
                       <m.icon className="w-3.5 h-3.5 text-white/20" />
                       <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">{m.label}</p>
                       <p className="text-[11px] font-bold text-white/60">{m.val}</p>
                     </div>
                   ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: CLEAN ADVISOR (30%) */}
        <div className="w-full md:w-[380px] flex flex-col bg-[#080808]">
          <div className="flex items-center justify-between px-10 py-10">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Rivernova Advisor</h3>
              <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">Zero Commission Analysis</p>
            </div>
            <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-4 h-4 text-white/20 group-hover:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-2 space-y-8 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                <div className={`max-w-[100%] rounded-[1.2rem] px-5 py-4 text-[13px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white text-black' 
                    : 'bg-white/[0.03] border border-white/[0.05] text-white/80'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none 
                      [&_strong]:text-white [&_strong]:font-bold 
                      [&_p]:mb-3 [&_p:last-child]:mb-0 
                      [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center">
                   <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-10 space-y-6">
            <form onSubmit={handleChatSubmit} className="relative">
              <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2 focus-within:border-white/20 transition-all">
                <Textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/10 rounded-xl resize-none min-h-[44px] max-h-[140px] text-xs py-3 px-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e as any);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()} 
                  className="h-10 w-10 rounded-xl bg-white text-black hover:bg-white/90 shadow-lg transition-all active:scale-95 disabled:opacity-20 flex-shrink-0 p-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
            
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-3 h-3 text-white/10" />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-tight">
                AI advisor can make mistakes. Verify critical data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
