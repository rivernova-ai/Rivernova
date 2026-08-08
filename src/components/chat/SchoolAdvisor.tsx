'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ShieldAlert, Users, Compass, Zap, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as animateValue } from 'framer-motion';

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
  'CONNECTING TO AI NETWORK',
  'GENERATING SAFETY CONTEXT',
  'ANALYZING STUDENT CULTURE',
  'BUILDING LOCAL INSIGHTS',
  'SYNTHESIZING AI BRIEF',
];

export function SchoolAdvisor({ schoolName, location, program }: SchoolAdvisorProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({ safety: 40, social: 40, local: 40, roi: 40 });
  const [scanPhase, setScanPhase] = useState(0);
  const [researchComplete, setResearchComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedResearch = useRef(false);
  const prevResearchingRef = useRef(true);
  const apiHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Motion values for smooth radar chart animation
  const safetyMV = useMotionValue(40);
  const socialMV = useMotionValue(40);
  const localMV  = useMotionValue(40);
  const roiMV    = useMotionValue(40);

  const radarPath = useTransform(
    [safetyMV, socialMV, localMV, roiMV],
    (vals: number[]) => {
      const [s, so, l, r] = vals;
      const c = 100, rad = 80;
      return `M ${c} ${c - (rad * s) / 100} L ${c + (rad * so) / 100} ${c} L ${c} ${c + (rad * l) / 100} L ${c - (rad * r) / 100} ${c} Z`;
    }
  );

  // Dot positions derived from motion values
  const dotTopY    = useTransform(safetyMV, v => 100 - (80 * v) / 100);
  const dotRightX  = useTransform(socialMV, v => 100 + (80 * v) / 100);
  const dotBottomY = useTransform(localMV,  v => 100 + (80 * v) / 100);
  const dotLeftX   = useTransform(roiMV,    v => 100 - (80 * v) / 100);

  const applyMetrics = (m: { safety: number; social: number; local: number; roi: number } | null | undefined) => {
    if (!m) return;
    const clamp = (v: unknown) => Math.min(100, Math.max(0, Number(v) || 40));
    setMetrics({ safety: clamp(m.safety), social: clamp(m.social), local: clamp(m.local), roi: clamp(m.roi) });
  };

  // Animate radar motion values whenever metrics update
  useEffect(() => {
    const opts = { type: 'spring' as const, stiffness: 50, damping: 20 };
    animateValue(safetyMV, metrics.safety, opts);
    animateValue(socialMV, metrics.social, opts);
    animateValue(localMV,  metrics.local,  opts);
    animateValue(roiMV,    metrics.roi,    opts);
  }, [metrics.safety, metrics.social, metrics.local, metrics.roi]);

  // Elapsed scan timer
  useEffect(() => {
    if (!isResearching) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [isResearching]);

  useEffect(() => {
    if (hasStartedResearch.current) return;
    hasStartedResearch.current = true;

    const performInitialResearch = async () => {
      setMessages([{
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Generating AI-powered insights for **${schoolName}**...\n\nAnalyzing available knowledge on campus environment, student life, and career outcomes.`
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

  const statColors: Record<string, string> = {
    Safety: '#8C2D35',
    Social: '#c084fc',
    Local: '#34d399',
    ROI: '#fb923c',
  };

  return (
    <div
      className="w-full rounded-3xl overflow-hidden flex flex-col md:flex-row"
      style={{ background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.10)' }}
    >
      {/* ── Sidebar ── */}
      <div
        className="w-full md:w-96 flex-shrink-0 flex flex-col justify-between overflow-y-auto p-8 md:p-10 border-b md:border-b-0 md:border-r"
        style={{ background: 'rgba(250,245,240,0.5)', borderColor: 'rgba(140,45,53,0.10)' }}
      >
        <div className="space-y-10">

          {/* Header */}
          <div className="space-y-1">
            <h3 style={{ color: '#1C0A0C' }} className="text-2xl font-bold tracking-tight">Intelligence</h3>
            <div className="flex items-center justify-between gap-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isResearching ? 'scanning' : 'active'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] uppercase tracking-[0.3em] font-black"
                  style={{ color: isResearching ? 'rgba(129,140,248,0.6)' : '#8C2D35' }}
                >
                  {isResearching ? `${SCAN_PHASES[scanPhase].split(' ')[0]}...` : 'Strategic Focus Active'}
                </motion.p>
              </AnimatePresence>
              {isResearching && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-black tabular-nums"
                  style={{ color: 'rgba(28,10,12,0.35)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                </motion.span>
              )}
            </div>
          </div>

          {/* ── Radar Chart ── */}
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: 'rgba(28,10,12,0.75)' }}>AI Predicted Outcomes</p>
          </div>
          <motion.div
            className="relative w-full aspect-square flex items-center justify-center"
            animate={researchComplete ? {
              filter: [
                'drop-shadow(0 0 0px rgba(140,45,53,0))',
                'drop-shadow(0 0 32px rgba(140,45,53,0.4))',
                'drop-shadow(0 0 0px rgba(140,45,53,0))',
              ],
            } : {}}
            transition={{ duration: 1.8 }}
          >
            {/* Ambient glow — intensifies on complete */}
            <motion.div
              className="absolute inset-0 blur-[60px] rounded-full pointer-events-none"
              animate={{ opacity: researchComplete ? 1 : 0.4 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'rgba(140,45,53,0.10)' }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="radarGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8C2D35" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#B34050" stopOpacity="0.10" />
                </linearGradient>
              </defs>

              {/* Grid rings */}
              {[80, 60, 40, 20].map((r, i) => (
                <circle
                  key={r}
                  cx="100" cy="100" r={r}
                  fill="none"
                  stroke="rgba(140,45,53,0.12)"
                  strokeWidth={i === 0 ? '0.8' : '0.5'}
                  strokeDasharray={i < 3 ? '2,3' : undefined}
                />
              ))}

              {/* Axis lines */}
              <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(140,45,53,0.12)" strokeWidth="0.5" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(140,45,53,0.12)" strokeWidth="0.5" />

              {/* Axis labels */}
              <text x="100" y="12" textAnchor="middle" style={{ fontSize: '7.5px', fill: 'rgba(28,10,12,0.45)', fontWeight: '800', letterSpacing: '0.12em' }}>SAFETY</text>
              <text x="196" y="104" textAnchor="end" style={{ fontSize: '7.5px', fill: 'rgba(28,10,12,0.45)', fontWeight: '800', letterSpacing: '0.12em' }}>SOCIAL</text>
              <text x="100" y="198" textAnchor="middle" style={{ fontSize: '7.5px', fill: 'rgba(28,10,12,0.45)', fontWeight: '800', letterSpacing: '0.12em' }}>LOCAL</text>
              <text x="4" y="104" textAnchor="start" style={{ fontSize: '7.5px', fill: 'rgba(28,10,12,0.45)', fontWeight: '800', letterSpacing: '0.12em' }}>ROI</text>

              {/* ── SCAN ANIMATION ── */}
              {isResearching && (
                <>
                  {/* Ripple rings expanding outward */}
                  {[0, 1, 2].map(i => (
                    <motion.circle
                      key={`ripple-${i}`}
                      cx="100" cy="100"
                      fill="none"
                      stroke="rgba(140,45,53,0.25)"
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
                      stroke="rgba(140,45,53,0.07)" strokeWidth="28" strokeLinecap="round" />
                    {/* Narrow inner glow trail */}
                    <line x1="100" y1="100" x2="100" y2="22"
                      stroke="rgba(140,45,53,0.15)" strokeWidth="10" strokeLinecap="round" />
                    {/* Sharp sweep arm */}
                    <line x1="100" y1="100" x2="100" y2="22"
                      stroke="rgba(140,45,53,0.85)" strokeWidth="1.5" strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(140,45,53,0.7))' }} />
                    {/* Glowing tip */}
                    <circle cx="100" cy="22" r="3.5" fill="#8C2D35"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(140,45,53,0.8))' }} />
                  </motion.g>

                  {/* Center pulse */}
                  <motion.circle
                    cx="100" cy="100"
                    fill="none"
                    stroke="#8C2D35"
                    strokeWidth="1"
                    animate={{ r: [4, 14, 4], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                  />
                  <circle cx="100" cy="100" r="3" fill="#8C2D35"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(140,45,53,0.8))' }} />

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

              {/* ── DATA SHAPE — driven by MotionValues so coords animate as numbers ── */}
              <motion.path
                d={radarPath}
                fill="url(#radarGradientLight)"
                stroke="#8C2D35"
                strokeWidth="1.5"
                animate={{ opacity: isResearching ? 0.08 : 1 }}
                transition={{ duration: 0.6 }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(140,45,53,0.35))' }}
              />

              {/* ── DATA DOTS — positions driven by MotionValues ── */}
              <motion.circle
                cx={100} cy={dotTopY} r={3.5}
                fill="#8C2D35"
                animate={{ opacity: isResearching ? 0 : 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{ filter: 'drop-shadow(0 0 5px rgba(140,45,53,0.7))' }}
              />
              <motion.circle
                cx={dotRightX} cy={100} r={3.5}
                fill="#c084fc"
                animate={{ opacity: isResearching ? 0 : 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{ filter: 'drop-shadow(0 0 5px rgba(192,132,252,0.9))' }}
              />
              <motion.circle
                cx={100} cy={dotBottomY} r={3.5}
                fill="#34d399"
                animate={{ opacity: isResearching ? 0 : 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{ filter: 'drop-shadow(0 0 5px rgba(52,211,153,0.9))' }}
              />
              <motion.circle
                cx={dotLeftX} cy={100} r={3.5}
                fill="#fb923c"
                animate={{ opacity: isResearching ? 0 : 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                style={{ filter: 'drop-shadow(0 0 5px rgba(251,146,60,0.9))' }}
              />
            </svg>
          </motion.div>

          {/* AI disclaimer */}
          <p className="text-[11px] leading-relaxed text-center px-2" style={{ color: 'rgba(28,10,12,0.88)' }}>
            AI-estimated scores based on general knowledge. Not sourced from live databases. AI can make mistakes — verify important decisions independently.
          </p>

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
                  style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.08)' }}
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
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(28,10,12,0.4)' }}>{stat.label}</span>
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
                        style={{ color: '#1C0A0C' }}
                      >
                        {stat.value}%
                      </motion.span>
                    )}

                    <div className="w-12 h-1 rounded-full overflow-hidden relative" style={{ background: 'rgba(140,45,53,0.08)' }}>
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
          className="mt-10 p-4 rounded-2xl flex items-center gap-3"
          animate={isResearching ? { borderColor: ['rgba(140,45,53,0.14)', 'rgba(140,45,53,0.3)', 'rgba(140,45,53,0.14)'] } : {}}
          transition={{ repeat: Infinity, duration: 2.2 }}
          style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.12)' }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8C2D35', flexShrink: 0, animation: 'haloPulse 2s infinite' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8C2D35' }}>
            AI Intelligence · $0 Commission
          </p>
        </motion.div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col" style={{ background: 'rgba(245,237,229,0.4)', minHeight: '520px' }}>

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
                    ? { background: 'linear-gradient(135deg,#8C2D35,#8b5cf6)', color: '#fff', fontWeight: 500 }
                    : { background: 'rgba(250,245,240,0.8)', border: '1px solid rgba(140,45,53,0.12)', color: 'rgba(28,10,12,0.82)' }
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
                      style={{ '--tw-prose-body': 'rgba(28,10,12,0.82)', '--tw-prose-headings': '#1C0A0C', '--tw-prose-bold': '#1C0A0C' } as React.CSSProperties}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? '' : 'animate-pulse'}`}
                    style={{ background: msg.role === 'user' ? 'rgba(28,10,12,0.25)' : '#8C2D35' }}
                  />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(28,10,12,0.35)' }}>
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
                      style={{ background: '#8C2D35' }}
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
                      style={{ color: 'rgba(28,10,12,0.7)' }}
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
                            background: idx === scanPhase ? '#8C2D35' : idx < scanPhase ? 'rgba(140,45,53,0.5)' : 'rgba(140,45,53,0.12)',
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
        <div className="p-8 md:p-10" style={{ borderTop: '1px solid rgba(140,45,53,0.10)', background: 'rgba(245,237,229,0.95)' }}>
          <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
            <div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
              style={{ background: 'rgba(140,45,53,0.12)', borderRadius: '1rem' }}
            />
            <div
              className="relative flex items-center gap-2 rounded-2xl p-3"
              style={{ background: 'rgba(250,245,240,0.8)', border: '1px solid rgba(140,45,53,0.14)' }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${schoolName}...`}
                rows={1}
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm py-3 px-4 min-h-[44px] max-h-[160px]"
                style={{ color: '#1C0A0C', caretColor: '#8C2D35' }}
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
                style={{ background: 'linear-gradient(135deg,#8C2D35,#8b5cf6)', color: '#fff' }}
              >
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'rgba(140,45,53,0.4)' }} />
            <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: 'rgba(28,10,12,0.3)' }}>
              No commissions · No conflicts of interest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
