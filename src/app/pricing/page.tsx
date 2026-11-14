'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { AuthModal } from '@/components/auth/AuthModal';
import { ArrowRight, Check } from 'lucide-react';

const CONTACT_EMAIL = 'rivernova.ai@gmail.com';

const STUDENT_FEATURES = [
  'Unlimited school matches, no locks',
  'Transfer plan',
  'School comparison',
  'AI advisor',
  'One-page summary to share with your advisor',
];

const PILOT_FEATURES = [
  '6–8 week pilot',
  'Advisor dashboard',
  'No student records needed',
  'Works alongside your current tools',
  'Alternate pathway finder',
];

const LICENSE_FEATURES = [
  'FERPA agreement',
  'Campus login (SSO)',
  'Unlimited advisors',
  'Outcome reports',
  'Automated follow-ups: missing documents, transcripts, status updates',
  'Enrollment forecasts from feeder-school trends',
];

function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  return (
    <div style={{ borderBottom: '1px solid rgba(140,45,53,0.15)' }}>
      <h3>
        <button
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group w-full flex items-start justify-between gap-6 py-6 text-left rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#8C2D35]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5EDE5]"
        >
          <span
            className="text-[17px] font-medium leading-snug transition-colors duration-300 group-hover:text-[#8C2D35] motion-reduce:transition-none"
            style={{ color: open ? '#8C2D35' : '#1C0A0C' }}
          >
            {question}
          </span>
          {/* Plus that turns into a minus: the vertical bar rotates flat */}
          <span aria-hidden className="relative mt-1.5 h-3.5 w-3.5 flex-shrink-0">
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2" style={{ background: '#1C0A0C' }} />
            <span
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-transform duration-500 motion-reduce:transition-none"
              style={{ background: '#1C0A0C', transform: `translateX(-50%) rotate(${open ? 90 : 0}deg)`, transitionTimingFunction: ease }}
            />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className="grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: ease }}
      >
        <div className="overflow-hidden">
          <p
            className="pb-7 pr-10 text-[15px] leading-relaxed max-w-[60ch] transition-[opacity,transform] duration-500 motion-reduce:transition-none"
            style={{
              color: 'rgba(28,10,12,0.85)',
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(-6px)',
              transitionTimingFunction: ease,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  {
    q: 'Is it actually free for students?',
    a: 'Yes. We monetize through B2B enterprise licenses for universities & institutions, never student fees or school kickbacks.',
  },
  {
    q: 'How do universities & institutions use Rivernova?',
    a: 'Advisors use our zero-config dashboard to audit transcripts in 10 seconds, route impacted students into alternate majors, and track graduation ROI without replacing Slate or PeopleSoft.',
  },
  {
    q: 'How do you protect student data and FERPA compliance?',
    a: 'Our 6–8 week pilot requires zero student PII. Campus-wide rollouts operate under strict FERPA data-processing agreements with full SSO encryption.',
  },
];

function PlanCard({
  label,
  price,
  tagline,
  features,
  cta,
  onClick,
  href,
  primary,
}: {
  label: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}) {
  const ctaClass = 'group w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  const ctaStyle = primary
    ? { background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 28px rgba(140,45,53,0.35)' }
    : { border: '1px solid rgba(140,45,53,0.25)', color: '#1C0A0C', background: 'transparent' };
  const ctaInner = (
    <>
      <span>{cta}</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </>
  );

  return (
    <div
      className="rounded-3xl p-8 flex flex-col"
      style={{
        background: primary ? 'rgba(140,45,53,0.06)' : 'rgba(140,45,53,0.03)',
        border: primary ? '1px solid rgba(140,45,53,0.35)' : '1px solid rgba(140,45,53,0.12)',
      }}
    >
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(28,10,12,0.6)' }}>{label}</p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-semibold tracking-tight" style={{ color: '#1C0A0C' }}>{price}</span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'rgba(28,10,12,0.8)' }}>{tagline}</p>
      </div>

      <ul className="space-y-3.5 flex-1 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8C2D35' }} />
            <span className="text-sm font-medium" style={{ color: '#1C0A0C' }}>{f}</span>
          </li>
        ))}
      </ul>

      {href ? (
        <a href={href} className={`${ctaClass} hover:opacity-80`} style={ctaStyle}>{ctaInner}</a>
      ) : (
        <button onClick={onClick} className={`${ctaClass} hover:scale-[1.02] active:scale-[0.98]`} style={ctaStyle}>{ctaInner}</button>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen relative flex flex-col" style={{ background: '#F5EDE5' }}>
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(140,45,53,0.08) 0%, transparent 60%)' }} />

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 flex flex-col items-center text-center z-10">
        <div className="max-w-[720px] mx-auto flex flex-col items-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.92]" style={{ color: '#1C0A0C' }}>
            Pricing
          </h1>
          <p className="text-lg font-normal" style={{ color: 'rgba(28,10,12,0.78)' }}>
            Free for every student. Forever.
          </p>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── PLAN CARDS ── */}
      <section className="py-20 md:py-28 px-6 relative z-10">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-6">
          <PlanCard
            label="Students"
            price="$0 forever"
            tagline="Everything, no locks."
            features={STUDENT_FEATURES}
            cta="Get Started"
            onClick={() => setAuthModalOpen(true)}
            primary
          />
          <PlanCard
            label="Colleges"
            price="Pilot"
            tagline="Try it with your advisors for 6–8 weeks."
            features={PILOT_FEATURES}
            cta="Book a 15-min call"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Rivernova pilot: 15-min call')}`}
          />
          <PlanCard
            label="Campus license"
            price="Custom"
            tagline="For campus-wide rollout."
            features={LICENSE_FEATURES}
            cta="Talk to us"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Rivernova campus license')}`}
          />
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <p className="text-sm font-normal" style={{ color: 'rgba(28,10,12,0.7)' }}>
            No commission, as always.
          </p>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── WHO PAYS ── */}
      <section className="py-24 md:py-32 px-6 relative z-10">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[0.98]" style={{ color: '#1C0A0C', textWrap: 'balance' }}>
              Who pays for this.
            </h2>
            <p className="mt-6 text-base font-normal leading-relaxed max-w-[34ch]" style={{ color: 'rgba(28,10,12,0.92)' }}>
              Not students. And no school can pay to appear in a student&apos;s matches.
            </p>
          </div>

          <dl>
            {[
              {
                who: 'Students',
                what: 'Pay nothing, ever. Every feature is open. Schools are ranked on fit, cost, and outcomes, nothing else.',
              },
              {
                who: 'Colleges',
                what: 'Run a pilot with their advisors. Students sign up and opt in themselves, so no student records change hands.',
              },
              {
                who: 'Campus license',
                what: 'Colleges rolling out campus-wide pay for advisor tools, campus login, and reporting. It never changes how any school ranks.',
              },
            ].map((row, i) => (
              <div
                key={row.who}
                className="grid sm:grid-cols-[150px_1fr] gap-2 sm:gap-8 py-6"
                style={{ borderTop: '1px solid rgba(140,45,53,0.15)', borderBottom: i === 2 ? '1px solid rgba(140,45,53,0.15)' : 'none' }}
              >
                <dt className="text-sm font-semibold" style={{ color: '#1C0A0C' }}>{row.who}</dt>
                <dd className="text-[15px] font-normal leading-relaxed" style={{ color: 'rgba(28,10,12,0.92)' }}>{row.what}</dd>
              </div>
            ))}
          </dl>
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
                  <span className="relative">Get Started</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <p className="text-sm font-normal" style={{ color: 'rgba(28,10,12,0.65)' }}>
                Free for students, forever. No commission, as always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 md:py-32 px-6 relative z-10">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[0.98]" style={{ color: '#1C0A0C' }}>
              Questions.
            </h2>
          </div>

          <div style={{ borderTop: '1px solid rgba(140,45,53,0.15)' }}>
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                id={`faq-${i}`}
                question={item.q}
                answer={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(o => (o === i ? null : i))}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(140,45,53,0.15),transparent)' }} />

      {/* ── FOOTER ── */}
      <footer className="pt-20 pb-24 px-6 relative z-10">
        <div className="max-w-[1000px] mx-auto grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <p className="text-lg font-semibold tracking-tight" style={{ color: '#1C0A0C' }}>Rivernova</p>
            <p className="mt-3 text-base leading-relaxed max-w-[30ch]" style={{ color: 'rgba(28,10,12,0.85)' }}>
              The infrastructure connecting students and institutions.
            </p>
          </div>
          {[
            { title: 'Product', links: [['Features', '/'], ['Pricing', '/pricing']] },
            { title: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
            { title: 'Contact', links: [[CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`]] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[15px] font-semibold" style={{ color: '#1C0A0C' }}>{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[15px] text-[#1C0A0C]/80 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-[#8C2D35] hover:decoration-[#8C2D35]/40"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CookieConsent />
    </main>
  );
}
