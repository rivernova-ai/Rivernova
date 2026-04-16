'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, TrendingDown, ShieldCheck, Zap } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen relative flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex-1 flex flex-col items-center justify-center text-center z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[800px] mx-auto flex flex-col items-center">

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Democratizing Education
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-[600px] leading-relaxed">
            AI-powered education consulting that puts your goals first — not commission deals. 
            Get unbiased, data-driven school recommendations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold h-14 px-8 text-lg rounded-xl transition-all"
            >
              See How It Works
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-80">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white mb-1">90%</span>
              <span className="text-sm font-medium text-white/50 uppercase tracking-wider">Lower Fees</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white mb-1">100%</span>
              <span className="text-sm font-medium text-white/50 uppercase tracking-wider">Unbiased</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white mb-1">AI</span>
              <span className="text-sm font-medium text-white/50 uppercase tracking-wider">Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-6 bg-black/20 z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-rose-400 font-semibold uppercase tracking-wider text-sm mb-4 block">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Traditional Consultants Are <span className="gradient-text">Broken</span></h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">The education consulting industry is plagued by conflicts of interest that hurt students.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Insane Fees</h3>
              <p className="text-white/60 leading-relaxed">Traditional consultants charge thousands of dollars for basic guidance that should be accessible to everyone.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Hidden Commissions</h3>
              <p className="text-white/60 leading-relaxed">They only recommend schools that pay them commissions, not what's actually best for your future.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Biased Advice</h3>
              <p className="text-white/60 leading-relaxed">Your success takes a backseat to their financial incentives and partnership deals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-sm mb-4 block">Our Solution</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">AI-Powered, <span className="gradient-text">Unbiased</span> Guidance</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">We use advanced AI to match you with schools based on your unique profile — no hidden agendas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Driven Matching</h3>
              <p className="text-white/60 leading-relaxed">Advanced algorithms analyze your profile and match you with schools that truly fit your goals and aspirations.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero Bias</h3>
              <p className="text-white/60 leading-relaxed">No commission deals, no hidden agendas — just honest recommendations based on your unique needs.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Affordable Pricing</h3>
              <p className="text-white/60 leading-relaxed">Pay a fraction of what traditional consultants charge for better, unbiased, AI-driven results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zero Commissions Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-black/20 to-indigo-900/10">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-6 text-sm font-bold text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5" />
            Zero Commissions Guarantee
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Transparency. <span className="gradient-text">100% Unbiased.</span></h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-16">
            We believe students shouldn't have to guess if their counselor is getting paid behind closed doors. We cryptographically sign and verify that $0.00 in commissions are accepted from our recommended institutions.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
             <div className="bg-black/40 border border-white/10 p-8 rounded-2xl flex flex-col items-center">
                <span className="text-5xl font-bold text-white mb-2">0%</span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Commission Rate</span>
             </div>
             <div className="bg-black/40 border border-white/10 p-8 rounded-2xl flex flex-col items-center">
                <span className="text-5xl font-bold text-emerald-400 mb-2 flex items-center gap-2">Live <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /></span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Status Sync</span>
             </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-4 block">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight">Four Steps to finding your <span className="gradient-text">perfect fit school</span></h2>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-white/10 -z-10" />
            
            {[
              { step: 1, title: 'Share Your Profile', desc: 'Tell us about your academic background, goals, budget, and preferences.' },
              { step: 2, title: 'AI Analysis', desc: 'Our AI analyzes thousands of schools to find your perfect matches instantly.' },
              { step: 3, title: 'Get Recommendations', desc: 'Receive personalized, unbiased school recommendations with detailed insights.' },
              { step: 4, title: 'Apply with Confidence', desc: 'Make informed decisions and apply to schools that truly align with your future.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-white mb-6">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" />
        <div className="max-w-[800px] mx-auto text-center relative z-10 bg-white/5 border border-white/10 p-12 md:p-16 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Find Your <br/><span className="gradient-text">Perfect School?</span></h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">Join students who are taking control of their education journey with AI-powered, unbiased guidance.</p>
          <Button 
            size="lg" 
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
          >
            Get Started Now — It's Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Rivernova</span>
            <span className="text-white/40 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/ledger" className="hover:text-white transition-colors">Commission Ledger</a>
            <a href="mailto:support@rivernova.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-white/40 text-sm text-center md:text-right">Empowering students with unbiased, AI-powered education consulting.</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CookieConsent />
    </main>
  );
}
