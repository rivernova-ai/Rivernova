'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ShieldAlert, Users, Compass, Zap, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface SchoolAdvisorProps {
  schoolName: string;
  location: string;
  program: string;
}

interface Metrics {
  safety: number;
  social: number;
  local: number;
  roi: number;
}

const SCAN_PHASES = [
  'CONNECTING TO INTELLIGENCE NETWORK',
  'SCANNING CRIME & SAFETY DATA',
  'ANALYZING STUDENT CULTURE',
  'CROSS-REFERENCING LOCAL DATA',
  'SYNTHESIZING STRATEGIC BRIEF',
];

export function SchoolAdvisor({ schoolName, location, program }: SchoolAdvisorProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({ safety: 40, social: 40, local: 40, roi: 40 });
  const [scanPhase, setScanPhase] = useState(0);
  const [researchComplete, setResearchComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedResearch = useRef(false);
  const prevResearchingRef = useRef(true);
  const apiHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const applyMetrics = (m: { safety: number; social: number; local: number; roi: number } | null | undefined) => {
    if (!m) return;
    const clamp = (v: unknown) => Math.min(100, Math.max(0, Number(v) || 40));
    setMetrics({ safety: clamp(m.safety), social: clamp(m.social), local: clamp(m.local), roi: clamp(m.roi) });
  };

  useEffect(() => {
    if (hasStartedResearch.current) return;
    hasStartedResearch.current = true;

    const performInitialResearch = async () => {
      setMessages([{
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Initializing deep-intelligence protocol for **${schoolName}**...\n\nScanning real-time databases for campus safety metrics, student life sentiment, and local infrastructure data.`
      }]);

      const researchQuery = `Provide a comprehensive, brutally honest briefing for a prospective student studying ${program} at ${schoolName} in ${location}.

Include:
1. **CAMPUS LIFE**: What is the actual vibe? Social scene, clubs, study culture, and student pressure.
2. **SAFETY INTEL**: Real crime sentiment in ${location}. Safe to walk at night? Specific areas to avoid.
3. **LOCAL INFRASTRUCTURE**: Transportation, food scene, and cost of living for a student.
4. **ROI & CAREER**: Job placement for ${program} graduates, average starting salary, and alumni network strength.

Format this as a strategic briefing with bold headers. Be specific and honest — not a marketing pitch. After writing the briefing, call the report_metrics tool with your honest scores (0–100) for safety, social, local, and roi.`;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: researchQuery }],
            context: { schoolName, location, program, type: 'deep-research' }
          }),
        });

        const initData = await response.json();
        if (!response.ok) throw new Error(initData.error || `API error ${response.status}`);
        applyMetrics(initData.metrics);
        const assistantContent = initData.message || '';
        apiHistory.current = [
          { role: 'user', content: researchQuery },
          { role: 'assistant', content: assistantContent },
        ];
        if (assistantContent.trim()) {
          setMessages(prev => [...prev, { id: `research-${Date.now()}`, role: 'assistant', content: assistantContent }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Deep research unavailable: ${msg}\n\nI still have core knowledge about this institution — ask me anything.`
        }]);
      } finally {
        setIsResearching(false);
      }
    };

    performInitialResearch();
  }, [schoolName, location]);

  // Cycle scan phase labels while researching
  useEffect(() => {
    if (!isResearching) return;
    const id = setInterval(() => setScanPhase(p => (p + 1) % SCAN_PHASES.length), 1600);
    return () => clearInterval(id);
  }, [isResearching]);

  // Flash "research complete" glow when scan finishes
  useEffect(() => {
    if (prevResearchingRef.current && !isResearching) {
      setResearchComplete(true);
      const t = setTimeout(() => setResearchComplete(false), 2200);
      return () => clearTimeout(t);
    }
    prevResearchingRef.current = isResearching;
  }, [isResearching]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
    setInput('');
    setIsLoading(true);

    const apiMessages = [...apiHistory.current, { role: 'user' as const, content: userText }];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: { schoolName, location, program }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
      applyMetrics(data.metrics);
      const assistantContent = data.message || '';
      apiHistory.current = [...apiMessages, { role: 'assistant', content: assistantContent }];
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRadarPath = (m: Metrics) => {
    const center = 100;
    const radius = 80;
    const points = [
      { x: center, y: center - (radius * m.safety) / 100 },
      { x: center + (radius * m.social) / 100, y: center },
      { x: center, y: center + (radius * m.local) / 100 },
      { x: center - (radius * m.roi) / 100, y: center },
    ];
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`;
  };

  const statColors: Record<string, string> = {
    Safety: '#818cf8',
    Social: '#c084fc',
    Local: '#34d399',
    ROI: '#fb923c',
  };

  return (
    <div
      className="w-full rounded-3xl overflow-hidden flex flex-col md:flex-row"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* ── Sidebar ── */}
      <div
        className="w-full md:w-96 flex-shrink-0 flex flex-col justify-between overflow-y-auto p-8 md:p-10 border-b md:border-b-0 md:border-r"
        style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="space-y-10">

          {/* Header */}
          <div className="space-y-1">
            <h3 style={{ color: '#f0f0f8' }} className="text-2xl font-bold tracking-tight">Intelligence</h3>
            <AnimatePresence mode="wait">
              <motion.p
                key={isResearching ? 'scanning' : 'active'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] uppercase tracking-[0.3em] font-black"
                style={{ color: isResearching ? 'rgba(129,140,248,0.6)' : '#818cf8' }}
              >
                {isResearching ? `${SCAN_PHASES[scanPhase].split(' ')[0]}...` : 'Strategic Focus Active'}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ── Radar Chart ── */}
          <motion.div
            className="relative w-full aspect-square flex items-center justify-center"
            animate={researchComplete ? {
              filter: [
                'drop-shadow(0 0 0px rgba(99,102,241,0))',
                'drop-shadow(0 0 32px rgba(99,102,241,0.55))',
                'drop-shadow(0 0 0px rgba(99,102,241,0))',
              ],
            } : {}}
            transition={{ duration: 1.8 }}
          >
            {/* Ambient glow — intensifies on complete */}
            <motion.div
              className="absolute inset-0 blur-[60px] rounded-full pointer-events-none"
              animate={{ opacity: researchComplete ? 1 : 0.4 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'rgba(99,102,241,0.18)' }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="radarGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Grid rings */}
              {[80, 60, 40, 20].map((r, i) => (
                <circle
                  key={r}
                  cx="100" cy="100" r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={i === 0 ? '0.8' : '0.5'}
                  strokeDasharray={i < 3 ? '2,3' : undefined}
                />
              ))}

              {/* Axis lines */}
              <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />

              {/* Axis labels */}
              <text x="100" y="12" textAnchor="middle" style={{ fontSize: '7.5px', fill: 'rgba(240,240,248,0.5)', fontWeight: '800', letterSpacing: '0.12em' }}>SAFETY</text>
              <text x="196" y="104" textAnchor="end" style={{ fontSize: '7.5px', fill: 'rgba(240,240,248,0.5)', fontWeight: '800', letterSpacing: '0.12em' }}>SOCIAL</text>
              <text x="100" y="198" textAnchor="middle" style={{ fontSize: '7.5px', fill: 'rgba(240,240,248,0.5)', fontWeight: '800', letterSpacing: '0.12em' }}>LOCAL</text>
              <text x="4" y="104" textAnchor="start" style={{ fontSize: '7.5px', fill: 'rgba(240,240,248,0.5)', fontWeight: '800', letterSpacing: '0.12em' }}>ROI</text>

              {/* ── SCAN ANIMATION ── */}
              {isResearching && (
                <>
                  {/* Ripple rings expanding outward */}
                  {[0, 1, 2].map(i => (
                    <motion.circle
                      key={`ripple-${i}`}
                      cx="100" cy="100"
                      fill="none"
                      stroke="rgba(99,102,241,0.25)"
                      strokeWidth="0.8"
                      initial={{ r: 8, opacity: 0.5 }}
                      animate={{ r: 82, opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.8,
                        delay: i * 0.9,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                  {/* Rotating sweep arm — translated to center so origin is at (100,100) */}
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                    style={{ transformOrigin: '100px 100px', transformBox: 'view-box' }}
                  >
                    {/* Wide soft trail */}
                    <line x1="100" y1="100" x2="100" y2="22"
                      stroke="rgba(99,102,241,0.07)" strokeWidth="28" strokeLinecap="round" />
                    {/* Narrow inner glow trail */}
                    <line x1="100" y1="100" x2="100" y2="22"
                      stroke="rgba(99,102,241,0.18)" strokeWidth="10" strokeLinecap="round" />
                    {/* Sharp sweep arm */}
                    <line x1="100" y1="100" x2="100" y2="22"
                      stroke="rgba(129,140,248,0.95)" strokeWidth="1.5" strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.9))' }} />
                    {/* Glowing tip */}
                    <circle cx="100" cy="22" r="3.5" fill="#818cf8"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,1))' }} />
                  </motion.g>

                  {/* Center pulse */}
                  <motion.circle
                    cx="100" cy="100"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1"
                    animate={{ r: [4, 14, 4], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                  />
                  <circle cx="100" cy="100" r="3" fill="#6366f1"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,1))' }} />

                  {/* DEEP SCAN label */}
                  <motion.text
                    x="100" y="116"
                    textAnchor="middle"
                    style={{
                      fontSize: '5.5px',
                      fill: 'rgba(240,240,248,0.55)',
                      fontWeight: 900,
                      letterSpacing: '0.28em',
                      fontFamily: 'monospace',
                    } as React.CSSProperties}
                    animate={{ opacity: [0.25, 0.9, 0.25] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    DEEP SCAN
                  </motion.text>
                </>
              )}

              {/* ── DATA SHAPE (faint during scan, full after) ── */}
              <motion.path
                initial={{ d: getRadarPath({ safety: 40, social: 40, local: 40, roi: 40 }), opacity: 0.08 }}
                animate={{
                  d: getRadarPath(metrics),
                  opacity: isResearching ? 0.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                fill="url(#radarGradientDark)"
                stroke="#6366f1"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
              />

              {/* ── DATA DOTS (hidden during scan, animate in on complete) ── */}
              <AnimatePresence>
                {!isResearching && (
                  <>
                    <motion.circle
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 1, r: 3.5 }}
                      exit={{ opacity: 0, r: 0 }}
                      cx={100}
                      cy={100 - (80 * metrics.safety) / 100}
                      fill="#818cf8"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(129,140,248,0.9))' }}
                      transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.1 }}
                    />
                    <motion.circle
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 1, r: 3.5 }}
                      exit={{ opacity: 0, r: 0 }}
                      cx={100 + (80 * metrics.social) / 100}
                      cy={100}
                      fill="#c084fc"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(192,132,252,0.9))' }}
                      transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.15 }}
                    />
                    <motion.circle
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 1, r: 3.5 }}
                      exit={{ opacity: 0, r: 0 }}
                      cx={100}
                      cy={100 + (80 * metrics.local) / 100}
                      fill="#34d399"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(52,211,153,0.9))' }}
                      transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.2 }}
                    />
                    <motion.circle
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 1, r: 3.5 }}
                      exit={{ opacity: 0, r: 0 }}
                      cx={100 - (80 * metrics.roi) / 100}
                      cy={100}
                      fill="#fb923c"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(251,146,60,0.9))' }}
                      transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.25 }}
                    />
                  </>
                )}
              </AnimatePresence>
            </svg>
          </motion.div>

          {/* ── Stat Tiles ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldAlert, label: 'Safety', value: metrics.safety },
              { icon: Users,       label: 'Social', value: metrics.social },
              { icon: Compass,     label: 'Local',  value: metrics.local  },
              { icon: Zap,         label: 'ROI',    value: metrics.roi    },
            ].map((stat, i) => {
              const Icon = stat.icon;
              const color = statColors[stat.label];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl space-y-3 relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Scan shimmer overlay */}
                  {isResearching && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(105deg, transparent 25%, ${color}22 50%, transparent 75%)`,
                      }}
                      animate={{ x: ['-100%', '160%'] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'linear', delay: i * 0.22 }}
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isResearching ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.2 }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </motion.div>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(240,240,248,0.4)' }}>{stat.label}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    {isResearching ? (
                      <motion.span
                        className="text-xl font-bold tabular-nums"
                        style={{ color, opacity: 0.5 }}
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.18 }}
                      >
                        —
                      </motion.span>
                    ) : (
                      <motion.span
                        className="text-xl font-bold tabular-nums"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: '#f0f0f8' }}
                      >
                        {stat.value}%
                      </motion.span>
                    )}

                    <div className="w-12 h-1 rounded-full overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {isResearching ? (
                        <motion.div
                          className="absolute top-0 h-full w-5 rounded-full"
                          style={{ background: color, opacity: 0.65 }}
                          animate={{ left: ['-20px', '52px'] }}
                          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear', delay: i * 0.15 }}
                        />
                      ) : (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer badge */}
        <motion.div
          className="mt-10 p-4 rounded-2xl"
          animate={isResearching ? { borderColor: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.5)', 'rgba(99,102,241,0.2)'] } : {}}
          transition={{ repeat: Infinity, duration: 2.2 }}
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: 'rgba(240,240,248,0.5)' }}>
            Neural Engine: Perplexity + Claude for Strategic Synthesis.
          </p>
        </motion.div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col" style={{ background: 'rgba(8,8,16,0.6)', minHeight: '520px' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8" style={{ minHeight: 0 }}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div
                  className="max-w-[85%] rounded-[1.5rem] px-7 py-5 text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 500 }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(240,240,248,0.85)' }
                  }
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose prose-sm max-w-none
                        [&_strong]:font-black [&_p]:mb-4 [&_p:last-child]:mb-0
                        [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2
                        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mb-6
                        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mb-4
                        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3"
                      style={{ '--tw-prose-body': 'rgba(240,240,248,0.82)', '--tw-prose-headings': '#f0f0f8', '--tw-prose-bold': '#f0f0f8' } as React.CSSProperties}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? '' : 'animate-pulse'}`}
                    style={{ background: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : '#6366f1' }}
                  />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(240,240,248,0.3)' }}>
                    {msg.role === 'user' ? 'You' : 'Advisor Intel'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Loading indicator ── */}
          <AnimatePresence>
            {(isLoading || isResearching) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-4 py-2"
              >
                {/* Animated tri-dot */}
                <div className="flex gap-1.5 items-center pt-1 flex-shrink-0">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#6366f1' }}
                      animate={{ opacity: [0.15, 1, 0.15], scale: [0.6, 1.4, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.18, ease: 'easeInOut' }}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  {/* Cycling status label */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isResearching ? scanPhase : 'chatload'}
                      initial={{ opacity: 0, y: 5, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -5, filter: 'blur(6px)' }}
                      transition={{ duration: 0.28 }}
                      className="text-[10px] font-black uppercase tracking-[0.3em]"
                      style={{ color: 'rgba(240,240,248,0.7)' }}
                    >
                      {isResearching ? SCAN_PHASES[scanPhase] : 'SYNTHESIZING INSIGHT'}
                    </motion.p>
                  </AnimatePresence>

                  {/* Phase progress dots */}
                  {isResearching && (
                    <div className="flex gap-1.5 items-center">
                      {SCAN_PHASES.map((_, idx) => (
                        <motion.div
                          key={idx}
                          className="h-0.5 rounded-full"
                          animate={{
                            width: idx === scanPhase ? '20px' : idx < scanPhase ? '8px' : '4px',
                            background: idx === scanPhase ? '#818cf8' : idx < scanPhase ? '#6366f1' : 'rgba(255,255,255,0.12)',
                            opacity: idx === scanPhase ? 1 : idx < scanPhase ? 0.45 : 0.2,
                          }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-8 md:p-10" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,16,0.8)' }}>
          <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
            <div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.4),rgba(139,92,246,0.3))', borderRadius: '1rem' }}
            />
            <div
              className="relative flex items-center gap-2 rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${schoolName}...`}
                rows={1}
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm py-3 px-4 min-h-[44px] max-h-[160px]"
                style={{ color: '#f0f0f8', caretColor: '#6366f1' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || isResearching || !input.trim()}
                className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-20"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}
              >
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'rgba(240,240,248,0.25)' }} />
            <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: 'rgba(240,240,248,0.3)' }}>
              Real-time consensus briefing · Data verified through strategic cross-referencing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
