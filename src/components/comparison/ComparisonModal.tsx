'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, DollarSign, GraduationCap, Briefcase, Award, MapPin, Send, Sparkles, Users, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonSchool } from '@/lib/comparison';
import { stripMarkdown, cleanText, calculateMatchScore, getMatchScoreColor, getMatchScoreLabel } from '@/lib/utils';

interface ComparisonModalProps {
  schools: ComparisonSchool[];
  userProfile: any;
  onClose: () => void;
}

const PALETTE = [
  { hex: '#6366f1', bar: 'bg-indigo-500',  text: 'text-indigo-400',  dot: 'bg-indigo-400',  border: 'border-indigo-500/30' },
  { hex: '#10b981', bar: 'bg-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/30' },
  { hex: '#a855f7', bar: 'bg-purple-500',  text: 'text-purple-400',  dot: 'bg-purple-400',  border: 'border-purple-500/30' },
  { hex: '#f59e0b', bar: 'bg-amber-500',   text: 'text-amber-400',   dot: 'bg-amber-400',   border: 'border-amber-500/30' },
  { hex: '#f43f5e', bar: 'bg-rose-500',    text: 'text-rose-400',    dot: 'bg-rose-400',    border: 'border-rose-500/30' },
];

function extractPct(v?: string): number | null {
  if (!v || v === 'N/A') return null;
  const match = v.match(/(\d+\.?\d*)\s*%/);
  return match ? parseFloat(match[1]) : null;
}

function extractSalary(v?: string): number | null {
  if (!v || v === 'N/A') return null;
  const m = v.match(/\$?([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, '')) : null;
}

function extractTuition(v?: string): number | null {
  if (!v || v === 'N/A') return null;
  const m = v.match(/\$?([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, '')) : null;
}

function display(v?: string, fallback = 'N/A'): string {
  if (!v || !v.trim() || v === 'N/A' || v === 'undefined') return fallback;
  return cleanText(v);
}

function buildMetrics(schools: ComparisonSchool[]) {
  return schools.map((s, i) => ({
    name: cleanText(s.name),
    location: display(s.location),
    program: display(s.program),
    tuition: display(s.tuition),
    tuitionNum: extractTuition(s.tuition),
    netPrice: display(s.netPrice),
    matchScore: s.matchScore || 0,
    admissionRate: display(s.admissionRate),
    admissionNum: extractPct(s.admissionRate),
    graduationRate: display(s.graduationRate),
    graduationNum: extractPct(s.graduationRate),
    employmentRate: display(s.employmentRate),
    employmentNum: extractPct(s.employmentRate),
    avgSalary: display(s.avgSalary),
    salaryNum: extractSalary(s.avgSalary),
    scholarships: display(s.scholarships),
    gpaMinimum: display(s.gpaMinimum, 'Open'),
    highlights: (s.highlights || []).map(h => cleanText(h)),
    color: PALETTE[i % PALETTE.length],
  }));
}

export function ComparisonModal({ schools, userProfile, onClose }: ComparisonModalProps) {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const metrics = buildMetrics(schools);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/compare-schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schools,
            userProfile: {
              major: userProfile.academic_background?.major || '',
              careerField: userProfile.career_goals?.careerField || '',
              dreamJob: userProfile.career_goals?.dreamJob || '',
              gpa: userProfile.academic_background?.gpa || '',
              budgetMin: userProfile.budget?.min || 0,
              budgetMax: userProfile.budget?.max || 0,
              preferredCountries: userProfile.location_preferences?.preferredCountries || '',
            },
          }),
        });
        const data = await res.json();
        setRecommendation(res.ok && data.recommendation ? data.recommendation : 'Unable to generate AI recommendation at this time.');
      } catch {
        setRecommendation('Unable to generate AI recommendation at this time.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(p => [...p, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: `Comparing ${schools.map(s => s.name).join(', ')}. ${msg}` }],
          userProfile,
        }),
      });
      const data = await res.json();
      if (data.message) setChatMessages(p => [...p, { role: 'assistant', content: data.message }]);
    } catch {
      setChatMessages(p => [...p, { role: 'assistant', content: 'Sorry, try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const tableRows = [
    { label: 'Match Score',      get: (m: typeof metrics[0]) => m.matchScore > 0 ? `${m.matchScore}%` : 'N/A', isBetter: 'higher', getNum: (m: any) => m.matchScore },
    { label: 'Tuition/year',     get: (m: typeof metrics[0]) => m.tuition, isBetter: 'lower', getNum: (m: any) => m.tuitionNum },
    { label: 'Net Price',        get: (m: typeof metrics[0]) => m.netPrice, isBetter: 'lower', getNum: (m: any) => extractTuition(m.netPrice) },
    { label: 'Acceptance Rate',  get: (m: typeof metrics[0]) => m.admissionRate, isBetter: 'higher', getNum: (m: any) => m.admissionNum },
    { label: 'Graduation Rate',  get: (m: typeof metrics[0]) => m.graduationRate, isBetter: 'higher', getNum: (m: any) => m.graduationNum },
    { label: 'GPA Required',     get: (m: typeof metrics[0]) => m.gpaMinimum, isBetter: 'lower', getNum: (m: any) => parseFloat(m.gpaMinimum) || null },
    { label: 'Location',         get: (m: typeof metrics[0]) => m.location },
    { label: 'Program',          get: (m: typeof metrics[0]) => m.program },
    { label: 'Avg Starting Salary', get: (m: typeof metrics[0]) => m.avgSalary, isBetter: 'higher', getNum: (m: any) => m.salaryNum },
    { label: 'Employment Rate',  get: (m: typeof metrics[0]) => m.employmentRate, isBetter: 'higher', getNum: (m: any) => m.employmentNum },
    { label: 'Scholarship Info', get: (m: typeof metrics[0]) => m.scholarships },
  ];

  const visualMetrics = [
    { label: 'Match Score', vals: metrics.map(m => m.matchScore), max: 100, fmt: (v: number) => `${v}%`, isBetter: 'higher' },
    { label: 'Acceptance Rate', vals: metrics.map(m => m.admissionNum || 0), max: 100, fmt: (v: number) => `${v}%`, isBetter: 'higher' },
    { label: 'Graduation Rate', vals: metrics.map(m => m.graduationNum || 0), max: 100, fmt: (v: number) => `${v}%`, isBetter: 'higher' },
    { label: 'Tuition / Net Price', vals: metrics.map(m => extractTuition(m.netPrice) || m.tuitionNum || 0), max: Math.max(...metrics.map(m => extractTuition(m.netPrice) || m.tuitionNum || 0), 1), fmt: (v: number) => `$${(v/1000).toFixed(1)}k`, isBetter: 'lower' },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col">
        <div className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] flex-shrink-0">
            <div>
              <h2 className="text-xl font-light text-white tracking-tight">School Comparison</h2>
              <p className="text-xs text-white/30 mt-0.5">{schools.length} schools selected</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all hover:rotate-90 duration-200">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="overflow-y-auto flex-1 px-8 py-8 space-y-10">

            {/* School header cards */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${schools.length}, minmax(0,1fr))` }}>
              {metrics.map((m, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col h-full items-center text-center justify-center relative overflow-hidden group">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500`} style={{ background: PALETTE[i % PALETTE.length].hex }} />
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center mb-3 border border-white/[0.05]" style={{ borderColor: PALETTE[i % PALETTE.length].hex + '40', color: PALETTE[i % PALETTE.length].hex }}>
                    <span className="text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                  </div>
                  <p className="text-sm font-semibold text-white/90 leading-snug">{m.name}</p>
                </div>
              ))}
            </div>

            {/* ── Stunning Radar Chart ── */}
            <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-light text-white mb-2">Multi-Axis Comparison</h3>
                  <p className="text-sm text-white/50 font-light leading-relaxed">
                    Visualizing the core strengths of each institution. A larger area indicates a stronger overall profile across match score, admission probability, graduation outcomes, and affordability.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ background: PALETTE[i % PALETTE.length].hex, boxShadow: `0 0 10px ${PALETTE[i % PALETTE.length].hex}80` }} />
                      <span className="text-sm text-white/80 font-medium">{String.fromCharCode(65 + i)} - {m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative w-72 h-72 flex-shrink-0">
                <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Concentric grid circles */}
                  {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <circle key={i} cx="150" cy="150" r={100 * scale} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  
                  {/* Axis lines */}
                  {[-Math.PI/2, 0, Math.PI/2, Math.PI].map((angle, i) => (
                    <line key={i} x1="150" y1="150" x2={150 + 100 * Math.cos(angle)} y2={150 + 100 * Math.sin(angle)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  ))}
                  
                  {/* Axis Labels */}
                  <text x="150" y="35" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" className="uppercase tracking-wider font-medium">Match Score</text>
                  <text x="265" y="153" textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="10" className="uppercase tracking-wider font-medium">Acceptance</text>
                  <text x="150" y="270" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" className="uppercase tracking-wider font-medium">Graduation</text>
                  <text x="35" y="153" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10" className="uppercase tracking-wider font-medium">Affordability</text>

                  {/* Polygons */}
                  {metrics.map((m, i) => {
                    const maxTuition = Math.max(...metrics.map(x => extractTuition(x.netPrice) || x.tuitionNum || 0), 10000);
                    const tNum = extractTuition(m.netPrice) || m.tuitionNum || 0;
                    const affordability = Math.max(0, ((maxTuition - tNum) / maxTuition) * 100);
                    
                    const values = [
                      m.matchScore,
                      m.admissionNum || 0,
                      m.graduationNum || 0,
                      affordability
                    ];
                    
                    const angles = [-Math.PI/2, 0, Math.PI/2, Math.PI];
                    const points = values.map((val, idx) => {
                      const r = 100 * (val / 100);
                      const cx = 150 + r * Math.cos(angles[idx]);
                      const cy = 150 + r * Math.sin(angles[idx]);
                      return `${cx},${cy}`;
                    }).join(' ');

                    return (
                      <g key={i}>
                        <polygon 
                          points={points} 
                          fill={PALETTE[i % PALETTE.length].hex} 
                          fillOpacity="0.15" 
                          stroke={PALETTE[i % PALETTE.length].hex} 
                          strokeWidth="2"
                          strokeLinejoin="round"
                          filter="url(#glow)"
                          className="transition-all duration-1000 hover:fill-opacity-30 cursor-pointer"
                        />
                        {values.map((val, idx) => {
                          const r = 100 * (val / 100);
                          const cx = 150 + r * Math.cos(angles[idx]);
                          const cy = 150 + r * Math.sin(angles[idx]);
                          return <circle key={idx} cx={cx} cy={cy} r="4" fill="#0a0a0a" stroke={PALETTE[i % PALETTE.length].hex} strokeWidth="2" />;
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* ── Visual Breakdown ── */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Visual Breakdown</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visualMetrics.map((vm, idx) => {
                  let bestVal = vm.isBetter === 'higher' ? -Infinity : Infinity;
                  let winnerIndex = -1;
                  vm.vals.forEach((v, i) => {
                    if (v > 0) {
                      if (vm.isBetter === 'higher' && v > bestVal) { bestVal = v; winnerIndex = i; }
                      if (vm.isBetter === 'lower' && v < bestVal) { bestVal = v; winnerIndex = i; }
                    }
                  });
                  if (winnerIndex !== -1) {
                    const winners = vm.vals.filter(v => v === bestVal);
                    if (winners.length > 1) winnerIndex = -1;
                  }

                  return (
                    <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.03] transition-colors">
                      <p className="text-sm text-white/60 font-medium mb-4">{vm.label}</p>
                      <div className="space-y-3.5">
                        {metrics.map((m, i) => {
                          const val = vm.vals[i];
                          const pct = vm.max > 0 ? (val / vm.max) * 100 : 0;
                          const isWinner = i === winnerIndex;
                          const hasData = val > 0;
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between items-end text-xs">
                                <span className={`font-light truncate pr-2 ${isWinner ? 'text-white' : 'text-white/50'}`}>
                                  {String.fromCharCode(65 + i)} - {m.name}
                                </span>
                                <span className={`font-medium flex-shrink-0 ${isWinner ? 'text-green-400' : 'text-white/40'}`}>
                                  {hasData ? vm.fmt(val) : 'N/A'}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out`}
                                  style={{ 
                                    width: `${pct}%`, 
                                    background: isWinner ? '#4ade80' : PALETTE[i % PALETTE.length].hex,
                                    opacity: isWinner ? 1 : 0.4
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Side-by-Side Comparison Table ── */}
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/[0.05]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                      <th className="text-left px-5 py-4 text-xs text-white/40 font-medium uppercase tracking-wider w-40">Metric</th>
                      {metrics.map((m, i) => (
                        <th key={i} className="text-left px-5 py-4 text-xs text-white/60 font-medium uppercase tracking-wider">
                          School {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                      <th className="text-left px-5 py-4 text-xs text-white/40 font-medium uppercase tracking-wider w-24">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, ri) => {
                      const vals = metrics.map(m => row.get(m));
                      let winnerIndex = -1;
                      if (row.isBetter && row.getNum) {
                         const numVals = metrics.map(m => row.getNum(m));
                         let bestVal = row.isBetter === 'higher' ? -Infinity : Infinity;
                         numVals.forEach((v, i) => {
                           if (v !== null && v !== undefined && !isNaN(v)) {
                              if (row.isBetter === 'higher' && v > bestVal) { bestVal = v; winnerIndex = i; }
                              if (row.isBetter === 'lower' && v < bestVal) { bestVal = v; winnerIndex = i; }
                           }
                         });
                         // Handle ties
                         if (winnerIndex !== -1) {
                           const winners = numVals.filter(v => v === bestVal);
                           if (winners.length > 1) winnerIndex = -1; // tie
                         }
                      }
                      
                      return (
                        <tr key={ri} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors">
                          <td className="px-5 py-4 bg-white/[0.005]">
                            <span className="text-sm text-white/70 font-medium">{row.label}</span>
                          </td>
                          {vals.map((v, ci) => {
                            const isWinner = ci === winnerIndex;
                            return (
                              <td key={ci} className={`px-5 py-4 text-sm font-light ${v === 'N/A' ? 'text-white/20' : 'text-white/90'} ${isWinner ? 'bg-green-500/[0.05] text-green-400' : ''}`}>
                                {v}
                              </td>
                            )
                          })}
                          <td className="px-5 py-4 text-sm font-light">
                            {winnerIndex !== -1 ? (
                               <span className="flex items-center gap-1.5 text-green-400 font-medium bg-green-500/10 px-2.5 py-1 rounded-md w-fit">
                                  ✓ {String.fromCharCode(65 + winnerIndex)}
                               </span>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Highlights ── */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Highlights</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${schools.length}, minmax(0,1fr))` }}>
                {metrics.map((m, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length].hex }} />
                      <span className="text-xs text-white/35 font-light truncate">{m.name}</span>
                    </div>
                    {m.highlights.length > 0 ? (
                      <ul className="space-y-1.5">
                        {m.highlights.slice(0, 4).map((h, j) => (
                          <li key={j} className="flex items-start gap-2 text-white/45 text-xs font-light leading-relaxed">
                            <div className="w-1 h-1 rounded-full bg-white/15 mt-1.5 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white/20 text-xs">No highlights</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── AI Recommendation ── */}
            <div className="bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.04] border border-indigo-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-light text-white">AI Recommendation</p>
                  <p className="text-xs text-white/30">Based on your profile</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-white/[0.06] border-t-indigo-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <p className="text-white/55 text-sm leading-relaxed font-light whitespace-pre-wrap">{cleanText(recommendation)}</p>
                  </div>
                  {chatMessages.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-light ${msg.role === 'user' ? 'bg-indigo-500/15 text-white/75' : 'bg-white/[0.04] text-white/55'}`}>
                            {cleanText(msg.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleChat} className="flex gap-2">
                    <input
                      value={chatInput} onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask about these schools..."
                      disabled={chatLoading}
                      className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30 transition-all"
                    />
                    <button type="submit" disabled={chatLoading || !chatInput.trim()}
                      className="w-10 h-10 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 disabled:opacity-40 flex items-center justify-center transition-all">
                      {chatLoading ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> : <Send className="w-4 h-4 text-indigo-400" />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 border-t border-white/[0.06] px-8 py-4 flex justify-end">
            <Button onClick={onClose} className="rounded-full bg-white text-black hover:bg-white/90 border-0 px-7 h-10 font-normal text-sm">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
