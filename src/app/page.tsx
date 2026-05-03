'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, ShieldCheck, Zap, Brain, Lock, Lightbulb, Target, Rocket, BarChart3, Search, Bookmark, MessageSquare } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ── Deep Space Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[70vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-60" />
        <div className="absolute top-[20vh] right-[10%] w-[30vw] h-[30vw] bg-purple-500/[0.05] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40vh] left-[5%] w-[25vw] h-[25vw] bg-indigo-500/[0.03] blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-32 md:pt-48 md:pb-56 px-6 z-10">
        <div className="max-w-[1100px] mx-auto text-center space-y-12">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Zero Commission Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
              Future <br />
              <span className="text-white/20 italic">Education.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/40 font-light max-w-2xl mx-auto leading-relaxed tracking-tight">
              AI-driven strategic consulting that prioritizes your ROI — not university commissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="group relative h-16 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center gap-3">
                <span>Begin Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-16 px-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white/70 font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.06] hover:text-white transition-all backdrop-blur-md"
            >
              Operational Briefing
            </button>
          </div>
        </div>
      </section>

      {/* ── Visual Divider ── */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white blur-[2px]" />
      </div>

      {/* ── Problem Section ── */}
      <section className="py-40 md:py-64 px-6 relative z-10 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">The Market Problem</p>
                <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                  Consulting is <br />
                  <span className="text-white/20">Symmetrically Broken.</span>
                </h2>
              </div>
              <p className="text-xl text-white/40 font-light leading-relaxed max-w-lg italic">
                "Traditional agents prioritize the $10,000 commission over the student's 40-year career trajectory."
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { icon: TrendingDown, title: 'Cost Inefficiency', desc: 'Fees that cripple student budgets before day one.' },
                { icon: Zap, title: 'Incentive Mismatch', desc: 'University commissions dictate your recommendations.' },
                { icon: Lock, title: 'Opaque Logic', desc: 'Zero transparency on why a school is selected.' }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Strategic Advantage ── */}
      <section className="py-40 bg-white/[0.01] border-y border-white/[0.03] px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col items-center text-center space-y-16">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter leading-none">Strategic Advantage.</h2>
              <p className="text-xl text-white/30 max-w-2xl mx-auto">Advanced matching protocols designed for high-performance students.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 w-full">
               {[
                 { title: 'Zero Commissions', val: '0%', label: 'Conflict of Interest' },
                 { title: 'Deep Intelligence', val: 'SONAR', label: 'Research Protocol' },
                 { title: 'Processing Speed', val: '6.2s', label: 'Average Synthesis' },
               ].map((stat, i) => (
                 <div key={i} className="p-12 rounded-[2.5rem] bg-[#050505] border border-white/[0.06] space-y-4">
                   <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">{stat.title}</p>
                   <p className="text-6xl font-black text-white">{stat.val}</p>
                   <p className="text-[9px] text-indigo-400/60 uppercase font-black tracking-[0.2em]">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience Preview ── */}
      <section id="how-it-works" className="py-64 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
          <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mix-blend-overlay" />
             <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop" className="w-full grayscale brightness-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-12 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl space-y-6 max-w-sm">
                   <Zap className="w-8 h-8 text-indigo-400" />
                   <p className="text-2xl font-bold tracking-tight">Pure ROI Focus.</p>
                   <p className="text-sm text-white/50 leading-relaxed">Our engine calculates 40-year earnings potential against degree debt to find your financial optimum.</p>
                </div>
             </div>
          </div>

          <div className="space-y-16">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">The Human <br /> Capital OS.</h2>
              <p className="text-lg text-white/40 max-w-md">Precision controls for the modern student.</p>
            </div>
            
            <div className="space-y-12">
               {[
                 { step: '01', title: 'Data Ingestion', desc: 'Input your academic and financial profile into our high-fidelity interface.' },
                 { step: '02', title: 'Global Synthesis', desc: 'AI protocols research thousands of schools across the global education market.' },
                 { step: '03', title: 'Strategic Match', desc: 'Receive a curated selection of schools with zero commission bias.' },
               ].map((s, i) => (
                 <div key={i} className="flex gap-10">
                   <span className="text-3xl font-black text-white/10">{s.step}</span>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white">{s.title}</h3>
                     <p className="text-sm text-white/40 leading-relaxed font-medium">{s.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-64 px-6 text-center space-y-16 relative z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]">
        <div className="space-y-8">
          <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-none">Build Your Future.</h2>
          <p className="text-2xl text-white/30 max-w-2xl mx-auto">Zero friction. Zero bias. Total clarity.</p>
        </div>

        <button 
          onClick={() => setAuthModalOpen(true)}
          className="group relative h-20 px-16 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.2)]"
        >
          Initialize Protocol
        </button>
      </section>

      <footer className="py-24 px-6 border-t border-white/[0.05] relative z-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-6 max-w-xs">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold tracking-tighter">Rivernova</span>
            </div>
            <p className="text-sm text-white/30 font-medium leading-relaxed uppercase tracking-widest text-[10px]">Strategic Education Intelligence for the Global Market.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            {[
              { title: 'Platform', links: ['Features', 'Intelligence', 'ROI Engine'] },
              { title: 'Company', links: ['Vision', 'Ledger', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Security', 'Terms'] },
            ].map((col, i) => (
              <div key={i} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{col.title}</p>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-xs font-bold text-white/50 hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-24 pt-8 border-t border-white/[0.03] flex justify-between items-center">
           <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">© 2026 Rivernova Research Group</p>
           <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Commission-Free Since Inception</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CookieConsent />
    </main>
  );
}
