'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { ComparisonSchool } from '@/lib/comparison';
import { cleanText } from '@/lib/utils';

interface ComparisonModalProps {
  schools: ComparisonSchool[];
  userProfile: any;
  onClose: () => void;
}

const PALETTE = [
  { hex: '#8C2D35', bg: 'rgba(140,45,53,0.07)',  border: 'rgba(140,45,53,0.18)'  },
  { hex: '#1C0A0C', bg: 'rgba(28,10,12,0.06)',   border: 'rgba(28,10,12,0.16)'   },
  { hex: '#5C1A1F', bg: 'rgba(92,26,31,0.07)',   border: 'rgba(92,26,31,0.18)'   },
  { hex: '#6B3A1C', bg: 'rgba(107,58,28,0.06)',  border: 'rgba(107,58,28,0.16)'  },
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

  const tableRows = [
    { label: 'Match Score',        get: (m: ReturnType<typeof buildMetrics>[0]) => m.matchScore > 0 ? `${m.matchScore}%` : 'N/A', isBetter: 'higher', getNum: (m: any) => m.matchScore },
    { label: 'Tuition / Year',     get: (m: ReturnType<typeof buildMetrics>[0]) => m.tuition,       isBetter: 'lower',  getNum: (m: any) => m.tuitionNum },
    { label: 'Net Price',          get: (m: ReturnType<typeof buildMetrics>[0]) => m.netPrice,      isBetter: 'lower',  getNum: (m: any) => m.netPriceNum },
    { label: 'Acceptance Rate',    get: (m: ReturnType<typeof buildMetrics>[0]) => m.admissionRate, isBetter: 'higher', getNum: (m: any) => m.admissionNum },
    { label: 'Graduation Rate',    get: (m: ReturnType<typeof buildMetrics>[0]) => m.graduationRate,isBetter: 'higher', getNum: (m: any) => m.graduationNum },
    { label: 'GPA Required',       get: (m: ReturnType<typeof buildMetrics>[0]) => m.gpaMinimum,    isBetter: 'lower',  getNum: (m: any) => parseFloat(m.gpaMinimum) || null },
    { label: 'Location',           get: (m: ReturnType<typeof buildMetrics>[0]) => m.location },
    { label: 'Program',            get: (m: ReturnType<typeof buildMetrics>[0]) => m.program },
    { label: 'Avg Starting Salary',get: (m: ReturnType<typeof buildMetrics>[0]) => m.avgSalary,     isBetter: 'higher', getNum: (m: any) => m.salaryNum },
    { label: 'Employment Rate',    get: (m: ReturnType<typeof buildMetrics>[0]) => m.employmentRate,isBetter: 'higher', getNum: (m: any) => m.employmentNum },
    { label: 'Scholarships',       get: (m: ReturnType<typeof buildMetrics>[0]) => m.scholarships },
  ];

  const visualMetrics = [
    { label: 'Match Score',        vals: metrics.map(m => m.matchScore),              max: 100, fmt: (v: number) => `${v}%`,                   isBetter: 'higher' },
    { label: 'Acceptance Rate',    vals: metrics.map(m => m.admissionNum || 0),       max: 100, fmt: (v: number) => `${v}%`,                   isBetter: 'higher' },
    { label: 'Graduation Rate',    vals: metrics.map(m => m.graduationNum || 0),      max: 100, fmt: (v: number) => `${v}%`,                   isBetter: 'higher' },
    { label: 'Net Price / Tuition',vals: metrics.map(m => m.netPriceNum || m.tuitionNum || 0),
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
    if (idx !== -1 && vals.filter(v => v === best).length > 1) return -1;
    return idx;
  }

  const sectionLabel = (text: string) => (
    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.4)', margin: '0 0 20px' }}>{text}</p>
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', background: 'rgba(28,10,12,0.55)', backdropFilter: 'blur(8px)' }}
    >
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: '900px',
          display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden',
          background: '#F5EDE5',
          border: '1px solid rgba(140,45,53,0.14)',
          maxHeight: '92vh',
          boxShadow: '0 32px 80px rgba(28,10,12,0.18)',
        }}
      >
        {/* Top crimson accent line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.55),transparent)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid rgba(140,45,53,0.09)', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.02em', color: '#1C0A0C', margin: 0 }}>School Comparison</h2>
            <p style={{ fontSize: '12px', color: 'rgba(28,10,12,0.45)', margin: '4px 0 0' }}>
              {schools.length} schools · Rivernova Zero-Commission Engine
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(140,45,53,0.07)', border: '1px solid rgba(140,45,53,0.14)',
              color: 'rgba(28,10,12,0.5)', cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'rotate(90deg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'rotate(0)'; }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          {/* 1. School Hero Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${schools.length},minmax(0,1fr))`, gap: '12px' }}>
            {metrics.map((m, i) => {
              const p = m.palette;
              return (
                <div
                  key={i}
                  style={{
                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center', padding: '24px 16px', borderRadius: '18px', overflow: 'hidden',
                    background: p.bg, border: `1px solid ${p.border}`,
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: p.hex }} />

                  {/* Letter badge */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    background: `${p.hex}18`, color: p.hex, border: `1px solid ${p.border}`,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1C0A0C', margin: '0 0 16px', lineHeight: 1.3 }}>{m.name}</p>

                  {/* Match score badge */}
                  <div style={{
                    width: '68px', height: '68px', borderRadius: '16px',
                    background: 'rgba(140,45,53,0.06)', border: '1px solid rgba(140,45,53,0.14)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: '#1C0A0C', lineHeight: 1, letterSpacing: '-0.03em' }}>{m.matchScore}%</span>
                    <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(28,10,12,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>match</span>
                  </div>

                  {m.location !== 'N/A' && (
                    <p style={{ fontSize: '11px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(28,10,12,0.5)', fontWeight: 300 }}>
                      <MapPin style={{ width: '11px', height: '11px' }} />
                      {m.location}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 2. Radar / Multi-Axis */}
          <div>
            {sectionLabel('Multi-Axis Analysis')}
            <div style={{ borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.09)' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '-0.02em', color: '#1C0A0C', margin: '0 0 8px' }}>
                    Holistic Profile View
                  </h3>
                  <p style={{ fontSize: '13px', fontWeight: 300, lineHeight: 1.7, color: 'rgba(28,10,12,0.55)', margin: '0 0 20px' }}>
                    A larger polygon reflects stronger overall scores across match, admission, graduation, and affordability.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {metrics.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.palette.hex, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(28,10,12,0.7)' }}>
                          {String.fromCharCode(65 + i)} — {m.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ width: '240px', height: '240px', flexShrink: 0 }}>
                  <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {[0.25, 0.5, 0.75, 1].map((s, i) => (
                      <circle key={i} cx="150" cy="150" r={100 * s} fill="none" stroke="rgba(28,10,12,0.07)" strokeWidth="1" />
                    ))}
                    {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((a, i) => (
                      <line key={i} x1="150" y1="150"
                        x2={150 + 100 * Math.cos(a)} y2={150 + 100 * Math.sin(a)}
                        stroke="rgba(28,10,12,0.09)" strokeWidth="1" />
                    ))}
                    <text x="150" y="36" textAnchor="middle" fill="rgba(28,10,12,0.45)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>MATCH</text>
                    <text x="265" y="153" textAnchor="start" fill="rgba(28,10,12,0.45)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>ADMIT</text>
                    <text x="150" y="270" textAnchor="middle" fill="rgba(28,10,12,0.45)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>GRAD</text>
                    <text x="35" y="153" textAnchor="end" fill="rgba(28,10,12,0.45)" fontSize="9" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>VALUE</text>
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
                          <polygon points={pts} fill={m.palette.hex} fillOpacity="0.12" stroke={m.palette.hex} strokeWidth="1.5" strokeLinejoin="round" />
                          {vals.map((v, j) => {
                            const r = 100 * (v / 100);
                            return (
                              <circle key={j}
                                cx={150 + r * Math.cos(angles[j])}
                                cy={150 + r * Math.sin(angles[j])}
                                r="3.5" fill="#F5EDE5" stroke={m.palette.hex} strokeWidth="1.5"
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Visual Breakdown Bars */}
          <div>
            {sectionLabel('Visual Breakdown')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
              {visualMetrics.map((vm, idx) => {
                const winnerIdx = getWinnerIndex(vm.vals, vm.isBetter);
                return (
                  <div key={idx} style={{ padding: '20px', borderRadius: '18px', background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.09)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(28,10,12,0.65)', margin: '0 0 16px' }}>{vm.label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {metrics.map((m, i) => {
                        const val = vm.vals[i];
                        const pct = vm.max > 0 ? (val / vm.max) * 100 : 0;
                        const isWinner = i === winnerIdx;
                        const p = m.palette;
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 400, color: isWinner ? '#1C0A0C' : 'rgba(28,10,12,0.5)' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.hex, flexShrink: 0, display: 'inline-block' }} />
                                {String.fromCharCode(65 + i)} — {m.name}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: isWinner ? p.hex : 'rgba(28,10,12,0.4)' }}>
                                {val > 0 ? vm.fmt(val) : 'N/A'}
                              </span>
                            </div>
                            <div style={{ height: '4px', width: '100%', borderRadius: '2px', overflow: 'hidden', background: 'rgba(140,45,53,0.08)' }}>
                              <div
                                style={{
                                  height: '100%', borderRadius: '2px',
                                  width: `${pct}%`,
                                  background: p.hex,
                                  opacity: isWinner ? 1 : 0.28,
                                  transition: 'width 1s ease-out',
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

          {/* 4. Side-by-Side Table */}
          <div>
            {sectionLabel('Full Comparison')}
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(140,45,53,0.10)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(140,45,53,0.04)', borderBottom: '1px solid rgba(140,45,53,0.09)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.45)', width: '140px' }}>Metric</th>
                    {metrics.map((m, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '12px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.palette.hex }}>
                        {String.fromCharCode(65 + i)} — {m.name.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.45)', width: '72px' }}>Best</th>
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
                          borderBottom: ri < tableRows.length - 1 ? '1px solid rgba(140,45,53,0.07)' : 'none',
                          background: ri % 2 === 0 ? 'transparent' : 'rgba(140,45,53,0.02)',
                        }}
                      >
                        <td style={{ padding: '12px 18px', background: 'rgba(140,45,53,0.03)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(28,10,12,0.55)' }}>{row.label}</span>
                        </td>
                        {vals.map((v, ci) => {
                          const isWinner = ci === winnerIdx;
                          const p = metrics[ci].palette;
                          return (
                            <td
                              key={ci}
                              style={{
                                padding: '12px 18px', fontSize: '13px', fontWeight: 300,
                                color: isWinner ? p.hex : v === 'N/A' ? 'rgba(28,10,12,0.25)' : 'rgba(28,10,12,0.75)',
                                background: isWinner ? p.bg : 'transparent',
                              }}
                            >
                              {v}
                            </td>
                          );
                        })}
                        <td style={{ padding: '12px 18px' }}>
                          {winnerIdx !== -1 ? (
                            <span style={{
                              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                              background: metrics[winnerIdx].palette.bg, color: metrics[winnerIdx].palette.hex,
                              border: `1px solid ${metrics[winnerIdx].palette.border}`,
                            }}>
                              {String.fromCharCode(65 + winnerIdx)}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(28,10,12,0.25)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Highlights */}
          <div>
            {sectionLabel('Why Each Is a Match')}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${schools.length},minmax(0,1fr))`, gap: '12px' }}>
              {metrics.map((m, i) => (
                <div key={i} style={{ borderRadius: '16px', padding: '18px', background: 'rgba(140,45,53,0.03)', border: `1px solid ${m.palette.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.palette.hex, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: m.palette.hex, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                  </div>
                  {m.highlights.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {m.highlights.slice(0, 4).map((h, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', fontWeight: 300, lineHeight: 1.6, color: 'rgba(28,10,12,0.65)' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: m.palette.hex, opacity: 0.5, flexShrink: 0, marginTop: '6px' }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(28,10,12,0.35)', margin: 0 }}>No highlights</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. AI Recommendation */}
          <div style={{ borderRadius: '20px', padding: '24px', background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.18)', flexShrink: 0 }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#8C2D35' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C0A0C', margin: 0 }}>AI Recommendation</p>
                <p style={{ fontSize: '11px', color: 'rgba(28,10,12,0.45)', margin: '2px 0 0' }}>Personalized based on your profile</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck style={{ width: '13px', height: '13px', color: '#8C2D35' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#8C2D35' }}>Zero Commission</span>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '12px' }}>
                <Loader2 style={{ width: '18px', height: '18px', color: '#8C2D35', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(28,10,12,0.5)' }}>Synthesizing your comparison…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '18px', borderRadius: '14px', background: 'rgba(245,237,229,0.8)', border: '1px solid rgba(140,45,53,0.10)' }}>
                  <p style={{ fontSize: '14px', lineHeight: 1.75, fontWeight: 300, color: 'rgba(28,10,12,0.82)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {cleanText(recommendation)}
                  </p>
                </div>

                {chatMessages.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%', borderRadius: '14px', padding: '10px 14px', fontSize: '13px', fontWeight: 300,
                          ...(msg.role === 'user'
                            ? { background: 'rgba(140,45,53,0.10)', color: '#1C0A0C', border: '1px solid rgba(140,45,53,0.18)' }
                            : { background: 'rgba(140,45,53,0.04)', color: 'rgba(28,10,12,0.82)', border: '1px solid rgba(140,45,53,0.10)' }),
                        }}>
                          {cleanText(msg.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about these schools…"
                    disabled={chatLoading}
                    style={{
                      flex: 1, borderRadius: '100px', padding: '10px 18px', fontSize: '13px', outline: 'none',
                      background: 'rgba(245,237,229,0.9)', border: '1px solid rgba(140,45,53,0.18)',
                      color: '#1C0A0C', fontFamily: 'inherit', transition: 'border-color 0.15s ease',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(140,45,53,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(140,45,53,0.18)'}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#8C2D35', color: '#F5EDE5', border: 'none',
                      cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: chatLoading || !chatInput.trim() ? 0.4 : 1,
                      transition: 'all 0.15s ease', flexShrink: 0,
                    }}
                  >
                    {chatLoading
                      ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      : <Send style={{ width: '15px', height: '15px' }} />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderTop: '1px solid rgba(140,45,53,0.09)', background: 'rgba(140,45,53,0.02)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(28,10,12,0.35)', margin: 0 }}>
            Rivernova · $0.00 Commission · Unbiased Analysis
          </p>
          <button
            onClick={onClose}
            style={{
              borderRadius: '100px', padding: '0 20px', height: '34px', fontSize: '13px', fontWeight: 500,
              background: 'rgba(140,45,53,0.07)', border: '1px solid rgba(140,45,53,0.16)',
              color: 'rgba(28,10,12,0.6)', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(140,45,53,0.07)'; }}
          >
            Done
          </button>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
