'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { ArrowRight, ShieldCheck, Target, Brain, Rocket, Search, BarChart3, Bookmark, MessageSquare, X, TrendingDown, Lock } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { PRICING_DISPLAY } from '@/lib/constants';

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen relative flex flex-col" style={{ background: '#F5EDE5' }}>
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(140,45,53,0.08) 0%, transparent 60%)' }} />

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 flex flex-col items-center text-center z-10">
        <div className="max-w-[980px] mx-auto flex flex-col items-center space-y-10">

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.92]" style={{ color: '#1C0A0C' }}>
              Education consulting<br />
              <span style={{ background: 'linear-gradient(135deg,#8C2D35,#C04E5A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                is broken.
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed" style={{ color: '#1C0A0C' }}>
              We fixed it. AI school matching with{' '}
              <span style={{ color: '#8C2D35', fontWeight: 500 }}>$0.00 commission</span>.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="group relative flex items-center gap-2.5 rounded-full px-8 font-semibold text-base transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] overflow-hidden"
              style={{
                background: '#8C2D35',
                color: '#F5EDE5',
                height: '52px',
                boxShadow: '0 0 32px rgba(140,45,53,0.35)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.1),transparent)' }} />
              <span className="relative">Let&apos;s Get Your Match Report</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 rounded-full px-8 font-medium text-base transition-all duration-300"
              style={{ height: '52px', border: '1px solid rgba(140,45,53,0.18)', background: 'rgba(140,45,53,0.04)', color: 'rgba(28,10,12,0.6)' }}
            >
              See How It Works
            </button>
          </div>

          {/* Pricing nudge */}
          <Link href="/pricing" className="text-sm font-medium transition-colors" style={{ color: 'rgba(28,10,12,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.4)')}
          >
            See pricing →
          </Link>

          {/* Price contrast */}
          <div className="pt-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light line-through" style={{ color: 'rgba(220,38,38,0.6)' }}>$4K–$12K</p>
              <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: 'rgba(28,10,12,0.3)' }}>Traditional consultant</p>
            </div>
            <div className="text-3xl font-light" style={{ color: 'rgba(28,10,12,0.3)' }}>→</div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-semibold" style={{ color: '#1C0A0C' }}>{PRICING_DISPLAY}</p>
              <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: '#1C0A0C' }}>Rivernova · 99% less</p>
            </div>
            <div className="hidden sm:block w-px h-10" style={{ background: 'rgba(140,45,53,0.15)' }} />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-light" style={{ color: '#1C0A0C' }}>6.9M+</p>
              <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: 'rgba(28,10,12,0.3)' }}>Students affected yearly</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── THE PROBLEM ── */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20">
            <p className="text-sm font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(28,10,12,0.3)' }}>The Problem</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]" style={{ color: '#1C0A0C' }}>
              A $7 billion industry<br />
              <span style={{ color: 'rgba(28,10,12,0.45)', fontWeight: 300 }}>built on hidden conflicts<br />of interest.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: TrendingDown,
                color: '#DC2626',
                bg: 'rgba(220,38,38,0.1)',
                title: 'Exorbitant Pricing',
                desc: 'Consultants charge $500–$12K per student. Families in developing countries spend their life savings on advice that may be completely biased.',
              },
              {
                icon: X,
                color: '#EA580C',
                bg: 'rgba(234,88,12,0.1)',
                title: 'Commission Bias',
                desc: "Schools pay consultants $1K–$5K per enrolled international student. The advice you're paying for is structurally corrupted before you walk in the door.",
              },
              {
                icon: Lock,
                color: '#8C2D35',
                bg: 'rgba(140,45,53,0.1)',
                title: 'Zero Accountability',
                desc: 'No tracking of outcomes. Did the student graduate? Get a job? Nobody knows. Nobody cares. You paid, they moved on.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="text-base font-light leading-relaxed" style={{ color: '#1C0A0C' }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20">
            <p className="text-sm font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(28,10,12,0.3)' }}>How It Works</p>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{ color: '#1C0A0C' }}>
              Four steps.<br />
              <span style={{ color: 'rgba(28,10,12,0.45)', fontWeight: 300 }}>One honest answer.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Share Your Profile', desc: 'GPA, budget, career goals, preferred countries. 3 minutes.', icon: Target, color: '#8C2D35', bg: 'rgba(140,45,53,0.1)' },
              { step: '2', title: 'AI Matches You', desc: 'We pull real-time school data and rank your best-fit programs.', icon: Brain, color: '#A33840', bg: 'rgba(163,56,64,0.1)' },
              { step: '3', title: 'Transparent Results', desc: 'Every card shows $0.00 commission received.', icon: ShieldCheck, color: '#059669', bg: 'rgba(5,150,105,0.1)' },
              { step: '4', title: 'Apply with Confidence', desc: 'Essay coach, ROI report, deadline tracker, school comparison — all included.', icon: Rocket, color: '#EA580C', bg: 'rgba(234,88,12,0.1)' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <span className="text-4xl font-light mt-0.5" style={{ color: '#1C0A0C' }}>{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C0A0C' }}>{s.title}</h3>
                    <p className="text-sm font-light leading-relaxed" style={{ color: '#1C0A0C' }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── PRODUCT PREVIEW ── */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(28,10,12,0.3)' }}>The Dashboard</p>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5" style={{ color: '#1C0A0C' }}>
                  Everything a consultant charges $8,000 for.<br />
                  <span style={{ color: 'rgba(28,10,12,0.45)', fontWeight: 300 }}>In one dashboard.</span>
                </h2>
              </div>
              {[
                { icon: Search,        title: 'AI School Matching',   desc: 'Real-time match scores based on your GPA, budget, major, and goals.',          color: '#8C2D35' },
                { icon: BarChart3,     title: 'Financial ROI Report', desc: "See the expected salary vs tuition cost for every school you're considering.", color: '#059669' },
                { icon: Bookmark,      title: 'School Deep Dive',     desc: 'Safety intel, campus culture, city data — all real-time, AI-synthesized.',      color: '#A33840' },
                { icon: MessageSquare, title: 'Essay Position Coach', desc: 'AI advisor trained on successful application strategies.',                        color: '#EA580C' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${f.color}18` }}>
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: '#1C0A0C' }}>{f.title}</p>
                      <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.5)' }}>{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard mockup — kept dark to show the real product */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl pointer-events-none blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(140,45,53,0.1) 0%, transparent 70%)' }} />
              <div className="relative rounded-3xl p-7" style={{ background: 'rgba(8,8,20,0.88)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-1" style={{ color: 'rgba(240,240,248,0.3)' }}>Your Matches</p>
                    <p className="text-xl font-light" style={{ color: '#f0f0f8' }}>12 Schools Found</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                    <span className="text-[10px] font-black" style={{ color: '#059669' }}>$0.00 Commission</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'University of Toronto',   match: 94, color: '#059669', tuition: '$28K/yr', tier: 'Target' },
                    { name: 'University of Melbourne', match: 87, color: '#8C2D35', tuition: '$32K/yr', tier: 'Reach'  },
                    { name: 'RMIT University',         match: 79, color: '#fb923c', tuition: '$18K/yr', tier: 'Safety' },
                  ].map((school, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.07)" strokeWidth="4" fill="none" />
                          <circle cx="24" cy="24" r="20" stroke={school.color} strokeWidth="4" fill="none" strokeLinecap="round"
                            style={{ strokeDasharray: 2 * Math.PI * 20, strokeDashoffset: 2 * Math.PI * 20 * (1 - school.match / 100), filter: `drop-shadow(0 0 4px ${school.color}80)` }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold" style={{ color: school.color }}>{school.match}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#f0f0f8' }}>{school.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{school.tuition}</p>
                      </div>
                      <div className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${school.color}18`, color: school.color }}>
                        {school.tier}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 grid grid-cols-3 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { label: 'Avg Match',        value: '87%'  },
                    { label: 'Avg Tuition',       value: '$26k' },
                    { label: 'With Scholarships', value: '9'   },
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-light mb-1" style={{ color: 'rgba(240,240,248,0.35)' }}>{stat.label}</p>
                      <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── FINAL CTA ── */}
      <section className="py-32 md:py-48 px-6 relative z-10">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl pointer-events-none blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(140,45,53,0.1) 0%, transparent 70%)' }} />
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.92]" style={{ color: '#1C0A0C' }}>
                Your family deserves<br />
                <span style={{ background: 'linear-gradient(135deg,#8C2D35,#C04E5A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  honest advice.
                </span>
              </h2>
              <p className="text-xl font-light" style={{ color: '#1C0A0C' }}>
                Not advice that was bought by the school before you walked in the door.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="group relative flex items-center gap-2.5 rounded-full px-10 font-semibold text-lg transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] overflow-hidden"
                  style={{
                    height: '60px',
                    background: '#8C2D35',
                    color: '#F5EDE5',
                    boxShadow: '0 0 40px rgba(140,45,53,0.4)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.12),transparent)' }} />
                  <span className="relative">Start Free — {PRICING_DISPLAY} after</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.35)' }}>
                No credit card required · Cancel anytime · $0.00 commission · Always
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 px-6 relative z-10" style={{ borderTop: '1px solid rgba(140,45,53,0.12)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: '#1C0A0C' }}>Rivernova</p>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(28,10,12,0.4)' }}>
                Zero-commission AI school matching. Fighting the $7B education consulting industry&apos;s hidden conflicts.
              </p>
              <div className="flex items-center gap-1.5 mt-4">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#059669' }}>$0.00 Commission</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4" style={{ color: '#1C0A0C' }}>Product</p>
              <ul className="space-y-2.5">
                {[['Features', '/'], ['Pricing', '/pricing'], ['FAQ', '/pricing']].map(([l, h]) => (
                  <li key={l}><a href={h} className="text-sm font-light transition-colors" style={{ color: 'rgba(28,10,12,0.4)' }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4" style={{ color: '#1C0A0C' }}>Legal</p>
              <ul className="space-y-2.5">
                {[['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
                  <li key={l}><a href={h} className="text-sm font-light transition-colors" style={{ color: 'rgba(28,10,12,0.4)' }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4" style={{ color: '#1C0A0C' }}>Contact</p>
              <ul className="space-y-2.5">
                {[['Email', 'mailto:roman.kdk1599@gmail.com'], ['Twitter', '#'], ['LinkedIn', '#']].map(([l, h]) => (
                  <li key={l}><a href={h} className="text-sm font-light transition-colors" style={{ color: 'rgba(28,10,12,0.4)' }}>{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8" style={{ borderTop: '1px solid rgba(140,45,53,0.12)' }}>
            <p className="text-sm font-light text-center" style={{ color: 'rgba(28,10,12,0.35)' }}>© 2026 Rivernova. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CookieConsent />
    </main>
  );
}
