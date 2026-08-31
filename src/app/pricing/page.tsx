'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { AuthModal } from '@/components/auth/AuthModal';
import { ArrowRight, Check, ShieldCheck, Brain, BarChart3, Bookmark, MessageSquare, Lock, Search } from 'lucide-react';

const FREE_FEATURES = [
  '3 AI-matched schools (international & domestic)',
  '3 great matched school cards',
  'Match score per school',
  'Limited AI advisor',
];

const PRO_FEATURES = [
  '20 AI-matched schools (international & domestic)',
  '5x longer conversations with AI advisor',
  'Full school comparison tool',
  'School deep dive pages',
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const proMonthly = 19.99;
  const proYearly = 149;
  const proSavings = Math.round(proMonthly * 12 - proYearly);
  const proPrice = billing === 'monthly' ? `$${proMonthly}/mo` : `$${proYearly}/yr`;

  return (
    <main className="min-h-screen relative flex flex-col" style={{ background: '#F5EDE5' }}>
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(140,45,53,0.08) 0%, transparent 60%)' }} />

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 flex flex-col items-center text-center z-10">
        <div className="max-w-[720px] mx-auto flex flex-col items-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.92]" style={{ color: '#1C0A0C' }}>
            Pricing
          </h1>

          {/* Billing toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(140,45,53,0.06)', border: '1px solid rgba(140,45,53,0.12)' }}>
            <button
              onClick={() => setBilling('monthly')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: billing === 'monthly' ? '#8C2D35' : 'transparent',
                color: billing === 'monthly' ? '#F5EDE5' : 'rgba(28,10,12,0.5)',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                background: billing === 'yearly' ? '#8C2D35' : 'transparent',
                color: billing === 'yearly' ? '#F5EDE5' : 'rgba(28,10,12,0.5)',
              }}
            >
              Yearly
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{
                  background: billing === 'yearly' ? 'rgba(245,237,229,0.2)' : 'rgba(28,10,12,0.08)',
                  color: billing === 'yearly' ? '#F5EDE5' : 'rgba(28,10,12,0.5)',
                }}
              >
                SAVE ${proSavings}
              </span>
            </button>
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── PLAN CARDS ── */}
      <section className="py-20 md:py-28 px-6 relative z-10">
        <div className="max-w-[760px] mx-auto grid md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="rounded-3xl p-8 flex flex-col" style={{ background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.12)' }}>
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(28,10,12,0.45)' }}>Free</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-semibold tracking-tight" style={{ color: '#1C0A0C' }}>$0</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(28,10,12,0.65)' }}>
                Get started and see your first three matches.
              </p>
            </div>

            <ul className="space-y-3.5 flex-1 mb-8">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8C2D35' }} />
                  <span className="text-sm font-medium" style={{ color: '#1C0A0C' }}>{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(28,10,12,0.25)' }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(28,10,12,0.35)' }}>17 more schools locked</span>
              </li>
            </ul>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 hover:opacity-80"
              style={{ border: '1px solid rgba(140,45,53,0.2)', color: 'rgba(28,10,12,0.6)', background: 'transparent' }}
            >
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-3xl p-8 flex flex-col relative" style={{ background: '#1C0A0C', border: '1px solid rgba(140,45,53,0.4)' }}>
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(245,237,229,0.35)' }}>Pro</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-semibold tracking-tight" style={{ color: '#F5EDE5' }}>{proPrice}</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-xs font-medium mb-3" style={{ color: '#F5EDE5' }}>Save ${proSavings} vs monthly</p>
              )}
              <p className="text-sm font-medium" style={{ color: '#F5EDE5' }}>
                Get Results, Better.
              </p>
            </div>

            <ul className="space-y-3.5 flex-1 mb-8">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8C2D35' }} />
                  <span className="text-sm font-medium" style={{ color: '#F5EDE5' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="group w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden relative"
              style={{ background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 28px rgba(140,45,53,0.5)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.1),transparent)' }} />
              <span className="relative">Get Pro</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <ShieldCheck className="w-4 h-4" style={{ color: '#059669' }} />
          <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.4)' }}>
            Cancel anytime. No commission, as always.
          </p>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── WHAT YOU GET ── */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-20">
            <p className="text-sm font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(28,10,12,0.3)' }}>What&apos;s included</p>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[0.95]" style={{ color: '#1C0A0C' }}>
              Everything a consultant<br />
              <span style={{ color: 'rgba(28,10,12,0.45)', fontWeight: 300 }}>charges thousands for.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: Search,
                color: '#8C2D35',
                bg: 'rgba(140,45,53,0.1)',
                title: 'AI School Matching',
                desc: 'Real-time match scores across 15,000+ programs based on your GPA, budget, career goals, and location.',
              },
              {
                icon: BarChart3,
                color: '#059669',
                bg: 'rgba(5,150,105,0.1)',
                title: 'Financial ROI Report',
                desc: 'Expected salary vs tuition cost for every matched school. See the number before you commit.',
              },
              {
                icon: MessageSquare,
                color: '#EA580C',
                bg: 'rgba(234,88,12,0.1)',
                title: 'AI Advisor',
                desc: 'Ask anything about any school, program, or deadline. Pro gets 5x longer conversations.',
              },
              {
                icon: Bookmark,
                color: '#A33840',
                bg: 'rgba(163,56,64,0.1)',
                title: 'School Deep Dive',
                desc: 'Safety intel, campus culture, city data, employment rates — all real-time, AI-synthesized.',
              },
              {
                icon: Brain,
                color: '#7C3AED',
                bg: 'rgba(124,58,237,0.1)',
                title: 'Essay Position Coach',
                desc: 'AI advisor trained on successful application strategies built around your specific profile.',
              },
              {
                icon: ShieldCheck,
                color: '#0891B2',
                bg: 'rgba(8,145,178,0.1)',
                title: '$0 Commission',
                desc: 'Traditional consultants earn up to $5,000 per student from schools. We never take a cent.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-5">
                  <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: f.bg }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1.5" style={{ color: '#1C0A0C' }}>{f.title}</p>
                    <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(28,10,12,0.5)' }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
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
                  style={{ height: '60px', background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 40px rgba(140,45,53,0.4)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.12),transparent)' }} />
                  <span className="relative">Start Free — $19.99/mo after</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.35)' }}>
                Cancel anytime. No commission, as always.
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
                {[['Features', '/'], ['Pricing', '/pricing']].map(([l, h]) => (
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
