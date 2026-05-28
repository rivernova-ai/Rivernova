'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, GraduationCap, Briefcase, Award, MapPin, Send, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { ComparisonSchool } from '@/lib/comparison';
import { cleanText } from '@/lib/utils';

interface ComparisonModalProps {
  schools: ComparisonSchool[];
  userProfile: any;
  onClose: () => void;
}

const PALETTE = [
  { hex: '#6366f1', glow: 'rgba(99,102,241,0.35)',  bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)'  },
  { hex: '#10b981', glow: 'rgba(16,185,129,0.35)',  bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  { hex: '#a855f7', glow: 'rgba(168,85,247,0.35)',  bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  },
  { hex: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
];

function extractPct(v?: string): number | null {
  if (!v || v === 'N/A') return null;
  const m = v.match(/(\d+\.?\d*)\s*%/);
  return m ? parseFloat(m[1]) : null;
}
function extractNum(v?: string): number | null {
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
    tuitionNum: extractNum(s.tuition),
    netPrice: display(s.netPrice),
    netPriceNum: extractNum(s.netPrice),
    matchScore: s.matchScore || 0,
    admissionRate: display(s.admissionRate),
    admissionNum: extractPct(s.admissionRate),
    graduationRate: display(s.graduationRate),
    graduationNum: extractPct(s.graduationRate),
    employmentRate: display(s.employmentRate),
    employmentNum: extractPct(s.employmentRate),
    avgSalary: display(s.avgSalary),
    salaryNum: extractNum(s.avgSalary),
    scholarships: display(s.scholarships),
    gpaMinimum: display(s.gpaMinimum, 'Open'),
    highlights: (s.highlights || []).map(h => cleanText(h)),
    palette: PALETTE[i % PALETTE.length],
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

  const scoreColor = (s: number) => s >= 80 ? '#34d399' : s >= 60 ? '#fb923c' : '#f87171';

  const tableRows = [
    { label: 'Match Score',       get: (m: ReturnType<typeof buildMetrics>[0]) => m.matchScore > 0 ? `${m.matchScore}%` : 'N/A', isBetter: 'higher', getNum: (m: any) => m.matchScore },
    { label: 'Tuition / Year',    get: (m: ReturnType<typeof buildMetrics>[0]) => m.tuition,      isBetter: 'lower',  getNum: (m: any) => m.tuitionNum },
    { label: 'Net Price',         get: (m: ReturnType<typeof buildMetrics>[0]) => m.netPrice,     isBetter: 'lower',  getNum: (m: any) => m.netPriceNum },
    { label: 'Acceptance Rate',   get: (m: ReturnType<typeof buildMetrics>[0]) => m.admissionRate, isBetter: 'higher', getNum: (m: any) => m.admissionNum },
    { label: 'Graduation Rate',   get: (m: ReturnType<typeof buildMetrics>[0]) => m.graduationRate, isBetter: 'higher', getNum: (m: any) => m.graduationNum },
    { label: 'GPA Required',      get: (m: ReturnType<typeof buildMetrics>[0]) => m.gpaMinimum,   isBetter: 'lower',  getNum: (m: any) => parseFloat(m.gpaMinimum) || null },
    { label: 'Location',          get: (m: ReturnType<typeof buildMetrics>[0]) => m.location },
    { label: 'Program',           get: (m: ReturnType<typeof buildMetrics>[0]) => m.program },
    { label: 'Avg Starting Salary', get: (m: ReturnType<typeof buildMetrics>[0]) => m.avgSalary, isBetter: 'higher', getNum: (m: any) => m.salaryNum },
    { label: 'Employment Rate',   get: (m: ReturnType<typeof buildMetrics>[0]) => m.employmentRate, isBetter: 'higher', getNum: (m: any) => m.employmentNum },
    { label: 'Scholarships',      get: (m: ReturnType<typeof buildMetrics>[0]) => m.scholarships },
  ];

  const visualMetrics = [
    { label: 'Match Score',      vals: metrics.map(m => m.matchScore),              max: 100, fmt: (v: number) => `${v}%`,                  isBetter: 'higher' },
    { label: 'Acceptance Rate',  vals: metrics.map(m => m.admissionNum || 0),       max: 100, fmt: (v: number) => `${v}%`,                  isBetter: 'higher' },
    { label: 'Graduation Rate',  vals: metrics.map(m => m.graduationNum || 0),      max: 100, fmt: (v: number) => `${v}%`,                  isBetter: 'higher' },
    { label: 'Net Price / Tuition', vals: metrics.map(m => m.netPriceNum || m.tuitionNum || 0),
      max: Math.max(...metrics.map(m => m.netPriceNum || m.tuitionNum || 0), 1),
      fmt: (v: number) => `$${(v / 1000).toFixed(1)}k`, isBetter: 'lower' },
  ];

  function getWinnerIndex(vals: (number | null)[], isBetter?: string): number {
    if (!isBetter) return -1;
    let best = isBetter === 'higher' ? -Infinity : Infinity;
    let idx = -1;
    vals.forEach((v, i) => {
      if (v !== null && v !== undefined && !isNaN(v as number) && (v as number) > 0) {
        if (isBetter === 'higher' && (v as number) > best) { best = v as number; idx = i; }
        if (isBetter === 'lower'  && (v as number) < best) { best = v as number; idx = i; }
      }
    });
    // Tie = no winner
    if (idx !== -1 && vals.filter(v => v === best).length > 1) return -1;
    return idx;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-5xl flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: '#0a0a18',
          border: '1px solid rgba(255,255,255,0.09)',
          maxHeight: '92vh',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)' }} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-xl font-light tracking-tight" style={{ color: '#f0f0f8' }}>School Comparison</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,248,0.38)' }}>
              {schools.length} schools · Rivernova Zero-Commission Engine
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:rotate-90 duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,248,0.5)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-8 py-8 space-y-12">

          {/* ── 1. School Hero Cards ── */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${schools.length},minmax(0,1fr))` }}>
            {metrics.map((m, i) => {
              const p = m.palette;
              const sc = scoreColor(m.matchScore);
              const circ = 2 * Math.PI * 28;
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center text-center py-6 px-4 rounded-2xl overflow-hidden"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}
                >
                  {/* Color stripe top */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: p.hex }} />

                  {/* Letter badge */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black mb-3"
                    style={{ background: `${p.hex}25`, color: p.hex, border: `1px solid ${p.border}` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>

                  {/* Name */}
                  <p className="text-sm font-semibold mb-4 leading-snug" style={{ color: '#f0f0f8' }}>{m.name}</p>

                  {/* Mini match score ring */}
                  <div className="relative w-[68px] h-[68px]">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="34" cy="34" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
                      <circle
                        cx="34" cy="34" r="28"
                        stroke={sc} strokeWidth="5" fill="none" strokeLinecap="round"
                        style={{
                          strokeDasharray: circ,
                          strokeDashoffset: circ - (m.matchScore / 100) * circ,
                          filter: `drop-shadow(0 0 5px ${sc}80)`,
                          transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: sc }}>{m.matchScore}%</span>
                    </div>
                  </div>

                  {/* Location */}
                  {m.location !== 'N/A' && (
                    <p className="text-[11px] mt-3 flex items-center gap-1 font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>
                      <MapPin className="w-3 h-3" />
                      {m.location}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── 2. Radar / Multi-Axis ── */}
          <div className="rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-light tracking-tight mb-2" style={{ color: '#f0f0f8' }}>Multi-Axis Analysis</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(240,240,248,0.5)' }}>
                  A larger polygon means stronger overall profile across match score, admission probability, graduation outcomes, and affordability.
                </p>
              </div>
              <div className="space-y-3">
                {metrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.palette.hex, boxShadow: `0 0 8px ${m.palette.hex}` }} />
                    <span className="text-sm font-medium" style={{ color: 'rgba(240,240,248,0.75)' }}>
                      {String.fromCharCode(65 + i)} — {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-64 h-64 flex-shrink-0">
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                <defs>
                  <filter id="cglow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Grid */}
                {[0.25, 0.5, 0.75, 1].map((s, i) => (
                  <circle key={i} cx="150" cy="150" r={100 * s} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                ))}
                {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((a, i) => (
                  <line key={i} x1="150" y1="150"
                    x2={150 + 100 * Math.cos(a)} y2={150 + 100 * Math.sin(a)}
                    stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                ))}
                <text x="150" y="36" textAnchor="middle" fill="rgba(240,240,248,0.4)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>MATCH</text>
                <text x="265" y="153" textAnchor="start" fill="rgba(240,240,248,0.4)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>ADMIT</text>
                <text x="150" y="270" textAnchor="middle" fill="rgba(240,240,248,0.4)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>GRAD</text>
                <text x="35" y="153" textAnchor="end" fill="rgba(240,240,248,0.4)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>VALUE</text>
                {/* Polygons */}
                {metrics.map((m, i) => {
                  const maxT = Math.max(...metrics.map(x => x.netPriceNum || x.tuitionNum || 0), 10000);
                  const tNum = m.netPriceNum || m.tuitionNum || 0;
                  const affordability = Math.max(0, ((maxT - tNum) / maxT) * 100);
                  const vals = [m.matchScore, m.admissionNum || 0, m.graduationNum || 0, affordability];
                  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
                  const pts = vals.map((v, j) => {
                    const r = 100 * (v / 100);
                    return `${150 + r * Math.cos(angles[j])},${150 + r * Math.sin(angles[j])}`;
                  }).join(' ');
                  return (
                    <g key={i}>
                      <polygon
                        points={pts}
                        fill={m.palette.hex}
                        fillOpacity="0.15"
                        stroke={m.palette.hex}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        filter="url(#cglow)"
                        style={{ transition: 'all 0.8s ease' }}
                      />
                      {vals.map((v, j) => {
                        const r = 100 * (v / 100);
                        return (
                          <circle key={j}
                            cx={150 + r * Math.cos(angles[j])}
                            cy={150 + r * Math.sin(angles[j])}
                            r="4" fill="#0a0a18" stroke={m.palette.hex} strokeWidth="2"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ── 3. Visual Breakdown Bars ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(240,240,248,0.3)' }}>Visual Breakdown</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visualMetrics.map((vm, idx) => {
                const winnerIdx = getWinnerIndex(vm.vals, vm.isBetter);
                return (
                  <div key={idx} className="p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-sm font-medium mb-4" style={{ color: 'rgba(240,240,248,0.6)' }}>{vm.label}</p>
                    <div className="space-y-4">
                      {metrics.map((m, i) => {
                        const val = vm.vals[i];
                        const pct = vm.max > 0 ? (val / vm.max) * 100 : 0;
                        const isWinner = i === winnerIdx;
                        const p = m.palette;
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-end text-xs">
                              <span className="flex items-center gap-1.5 font-light truncate pr-2"
                                style={{ color: isWinner ? '#f0f0f8' : 'rgba(240,240,248,0.45)' }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.hex }} />
                                {String.fromCharCode(65 + i)} — {m.name}
                              </span>
                              <span className="font-semibold flex-shrink-0"
                                style={{ color: isWinner ? p.hex : 'rgba(240,240,248,0.4)' }}>
                                {val > 0 ? vm.fmt(val) : 'N/A'}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${pct}%`,
                                  background: p.hex,
                                  opacity: isWinner ? 1 : 0.35,
                                  boxShadow: isWinner ? `0 0 8px ${p.hex}` : 'none',
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

          {/* ── 4. Side-by-Side Table ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(240,240,248,0.3)' }}>Full Comparison</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest w-36"
                      style={{ color: 'rgba(240,240,248,0.35)' }}>Metric</th>
                    {metrics.map((m, i) => (
                      <th key={i} className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest"
                        style={{ color: m.palette.hex }}>
                        {String.fromCharCode(65 + i)} — {m.name.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest w-20"
                      style={{ color: 'rgba(240,240,248,0.35)' }}>Best</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, ri) => {
                    const vals = metrics.map(m => row.get(m));
                    const numVals = row.getNum ? metrics.map(m => (row as any).getNum(m)) : [];
                    const winnerIdx = row.isBetter ? getWinnerIndex(numVals, row.isBetter) : -1;
                    return (
                      <tr
                        key={ri}
                        style={{
                          borderBottom: ri < tableRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        }}
                      >
                        <td className="px-5 py-3.5" style={{ background: 'rgba(255,255,255,0.025)' }}>
                          <span className="text-xs font-medium" style={{ color: 'rgba(240,240,248,0.55)' }}>{row.label}</span>
                        </td>
                        {vals.map((v, ci) => {
                          const isWinner = ci === winnerIdx;
                          const p = metrics[ci].palette;
                          return (
                            <td
                              key={ci}
                              className="px-5 py-3.5 text-sm font-light"
                              style={{
                                color: isWinner ? p.hex : v === 'N/A' ? 'rgba(240,240,248,0.2)' : 'rgba(240,240,248,0.75)',
                                background: isWinner ? p.bg : 'transparent',
                              }}
                            >
                              {v}
                            </td>
                          );
                        })}
                        <td className="px-5 py-3.5">
                          {winnerIdx !== -1 ? (
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1"
                              style={{ background: metrics[winnerIdx].palette.bg, color: metrics[winnerIdx].palette.hex }}
                            >
                              ✓ {String.fromCharCode(65 + winnerIdx)}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(240,240,248,0.2)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 5. Highlights ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(240,240,248,0.3)' }}>Why Each Is a Match</p>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${schools.length},minmax(0,1fr))` }}>
              {metrics.map((m, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.palette.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.palette.hex }} />
                    <span className="text-[11px] font-semibold truncate" style={{ color: m.palette.hex }}>{m.name}</span>
                  </div>
                  {m.highlights.length > 0 ? (
                    <ul className="space-y-2">
                      {m.highlights.slice(0, 4).map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs font-light leading-relaxed"
                          style={{ color: 'rgba(240,240,248,0.6)' }}>
                          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: m.palette.hex, opacity: 0.6 }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic" style={{ color: 'rgba(240,240,248,0.25)' }}>No highlights</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. AI Recommendation ── */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#818cf8' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>AI Recommendation</p>
                <p className="text-xs" style={{ color: 'rgba(240,240,248,0.4)' }}>Personalized based on your profile</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>Zero Commission</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#818cf8' }} />
                <span className="text-sm font-light" style={{ color: 'rgba(240,240,248,0.4)' }}>Synthesizing your comparison…</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Recommendation text */}
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm leading-relaxed font-light whitespace-pre-wrap" style={{ color: 'rgba(240,240,248,0.82)' }}>
                    {cleanText(recommendation)}
                  </p>
                </div>

                {/* Chat history */}
                {chatMessages.length > 0 && (
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-light"
                          style={msg.role === 'user'
                            ? { background: 'rgba(99,102,241,0.25)', color: '#f0f0f8', border: '1px solid rgba(99,102,241,0.35)' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,248,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {cleanText(msg.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat input */}
                <form onSubmit={handleChat} className="flex gap-3">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about these schools…"
                    disabled={chatLoading}
                    className="flex-1 rounded-full px-5 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f0f0f8',
                      caretColor: '#6366f1',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}
                  >
                    {chatLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,16,0.6)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.25)' }}>
            Rivernova · $0.00 Commission · Unbiased Analysis
          </p>
          <button
            onClick={onClose}
            className="rounded-full px-6 h-9 text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,248,0.7)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
