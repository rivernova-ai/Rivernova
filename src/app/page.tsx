'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, TrendingDown, ShieldCheck, Zap, Lightbulb, Target, Rocket, Users, Brain, Lock } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_50%,rgba(79,70,229,0.2),rgba(255,255,255,0))]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex-1 flex flex-col items-center justify-center text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" style={{
          transform: `translate(calc(-50% + ${mousePos.x * 0.02}px), calc(-50% + ${mousePos.y * 0.02}px))`
        }} />
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[800px] mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8 text-sm font-semibold text-indigo-300 uppercase tracking-wider backdrop-blur-sm hover:border-indigo-500/50 transition-all cursor-pointer">
            <Sparkles className="w-4 h-4" />
            AI-Powered Education Consulting
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white">
            Democratizing Education
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-[600px] leading-relaxed font-light">
            AI-powered education consulting that puts your goals first — not commission deals. 
            Get unbiased, data-driven school recommendations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
            <Button 
              size="lg" 
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-300 group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold h-14 px-8 text-lg rounded-xl transition-all backdrop-blur-sm"
            >
              See How It Works
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            {[
              { value: '90%', label: 'Lower Fees' },
              { value: '100%', label: 'Unbiased' },
              { value: 'AI', label: 'Powered' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer">
                <span className="text-3xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{stat.value}</span>
                <span className="text-sm font-medium text-white/50 uppercase tracking-wider group-hover:text-white/70 transition-colors">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-rose-400 font-semibold uppercase tracking-wider text-sm mb-4 block">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Traditional Consultants Are <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Broken</span></h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">The education consulting industry is plagued by conflicts of interest that hurt students.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingDown, title: 'Insane Fees', desc: 'Traditional consultants charge thousands of dollars for basic guidance that should be accessible to everyone.', color: 'rose' },
              { icon: AlertCircle, title: 'Hidden Commissions', desc: 'They only recommend schools that pay them commissions, not what\'s actually best for your future.', color: 'amber' },
              { icon: ShieldAlert, title: 'Biased Advice', desc: 'Your success takes a backseat to their financial incentives and partnership deals.', color: 'purple' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={i}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white/5 border border-white/10 p-8 rounded-3xl transition-all duration-300 cursor-pointer group ${
                    hoveredCard === i ? 'bg-white/10 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.3)]' : ''
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 text-${item.color}-500 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-sm mb-4 block">Our Solution</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">AI-Powered, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Unbiased</span> Guidance</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">We use advanced AI to match you with schools based on your unique profile — no hidden agendas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI-Driven Matching', desc: 'Advanced algorithms analyze your profile and match you with schools that truly fit your goals and aspirations.', color: 'indigo' },
              { icon: Lock, title: 'Zero Bias', desc: 'No commission deals, no hidden agendas — just honest recommendations based on your unique needs.', color: 'emerald' },
              { icon: Sparkles, title: 'Affordable Pricing', desc: 'Pay a fraction of what traditional consultants charge for better, unbiased, AI-driven results.', color: 'purple' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={i}
                  onMouseEnter={() => setHoveredCard(i + 3)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white/5 border border-white/10 p-8 rounded-3xl transition-all duration-300 cursor-pointer group ${
                    hoveredCard === i + 3 ? 'bg-white/10 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.3)] -translate-y-2' : ''
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zero Commissions Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-black/20 to-indigo-900/10 relative z-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-6 text-sm font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5" />
            Zero Commissions Guarantee
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Transparency. <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">100% Unbiased.</span></h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-16">
            We believe students shouldn't have to guess if their counselor is getting paid behind closed doors. We cryptographically sign and verify that $0.00 in commissions are accepted from our recommended institutions.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
             <div className="bg-black/40 border border-white/10 p-8 rounded-2xl flex flex-col items-center hover:border-emerald-500/30 transition-all group cursor-pointer">
                <span className="text-5xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">0%</span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">Commission Rate</span>
             </div>
             <div className="bg-black/40 border border-white/10 p-8 rounded-2xl flex flex-col items-center hover:border-emerald-500/30 transition-all group cursor-pointer">
                <span className="text-5xl font-bold text-emerald-400 mb-2 flex items-center gap-2 group-hover:text-emerald-300 transition-colors">Live <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /></span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">Status Sync</span>
             </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-4 block">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight">Four Steps to finding your <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">perfect fit school</span></h2>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent -z-10" />
            
            {[
              { step: 1, title: 'Share Your Profile', desc: 'Tell us about your academic background, goals, budget, and preferences.', icon: Target },
              { step: 2, title: 'AI Analysis', desc: 'Our AI analyzes thousands of schools to find your perfect matches instantly.', icon: Brain },
              { step: 3, title: 'Get Recommendations', desc: 'Receive personalized, unbiased school recommendations with detailed insights.', icon: Lightbulb },
              { step: 4, title: 'Apply with Confidence', desc: 'Make informed decisions and apply to schools that truly align with your future.', icon: Rocket },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-white mb-6 group-hover:border-indigo-400 group-hover:bg-indigo-500/10 transition-all group-hover:scale-110">
                    {s.step}
                  </div>
                  <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm mb-4 block">Success Stories</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Students Love <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Rivernova</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', school: 'MIT', quote: 'Got matched with my dream school in 15 minutes. No bias, just facts.' },
              { name: 'Marcus Johnson', school: 'Stanford', quote: 'Saved $5K compared to traditional consultants. Best decision ever.' },
              { name: 'Emma Rodriguez', school: 'Harvard', quote: 'The AI recommendations were spot-on. Felt like having a personal advisor.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-white/50">{testimonial.school}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" />
        <div className="max-w-[800px] mx-auto text-center relative z-10 bg-white/5 border border-white/10 p-12 md:p-16 rounded-[40px] backdrop-blur-xl shadow-2xl hover:border-white/20 hover:bg-white/10 transition-all group">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight group-hover:text-indigo-200 transition-colors">Ready to Find Your <br/><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Perfect School?</span></h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto group-hover:text-white/80 transition-colors">Join students who are taking control of their education journey with AI-powered, unbiased guidance.</p>
          <Button 
            size="lg" 
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-300 group"
          >
            Get Started Now — It's Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 bg-[#09090b] relative z-10">
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
