'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, ShieldCheck, Zap, Brain, Lock, Lightbulb, Target, Rocket } from 'lucide-react';
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
    <main className="min-h-screen relative flex flex-col bg-black">
      <Navbar />

      {/* Hero Section - Apple Style */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 flex flex-col items-center justify-center text-center z-10">
        <div className="max-w-[900px] mx-auto flex flex-col items-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-tight">
              Democratizing<br />
              <span className="font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Education</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
              AI-powered education consulting that puts your goals first — not commission deals. Get unbiased, data-driven school recommendations in minutes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-white text-black hover:bg-white/90 text-base font-medium h-12 px-8 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-white/20 bg-transparent hover:bg-white/5 text-white font-medium h-12 px-8 transition-all duration-300"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats - Minimal */}
          <div className="pt-12 flex items-center justify-center gap-12 md:gap-20">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white">90%</p>
              <p className="text-sm text-white/50 font-light mt-2 tracking-wide">Lower Fees</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white">100%</p>
              <p className="text-sm text-white/50 font-light mt-2 tracking-wide">Unbiased</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white">AI</p>
              <p className="text-sm text-white/50 font-light mt-2 tracking-wide">Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Problem Section - Apple Style */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">The Problem</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Traditional consultants<br />
              <span className="font-semibold">are broken.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              { icon: TrendingDown, title: 'Insane Fees', desc: 'Traditional consultants charge thousands of dollars for basic guidance that should be accessible to everyone.' },
              { icon: Sparkles, title: 'Hidden Commissions', desc: 'They only recommend schools that pay them commissions, not what\'s actually best for your future.' },
              { icon: ShieldCheck, title: 'Biased Advice', desc: 'Your success takes a backseat to their financial incentives and partnership deals.' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-6 group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-white/10 transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white mb-3">{item.title}</h3>
                    <p className="text-base text-white/60 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Solution Section - Apple Style */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">Our Solution</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              AI-powered,<br />
              <span className="font-semibold">unbiased guidance.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              { icon: Brain, title: 'AI-Driven Matching', desc: 'Advanced algorithms analyze your profile and match you with schools that truly fit your goals and aspirations.' },
              { icon: Lock, title: 'Zero Bias', desc: 'No commission deals, no hidden agendas — just honest recommendations based on your unique needs.' },
              { icon: Zap, title: 'Affordable Pricing', desc: 'Pay a fraction of what traditional consultants charge for better, unbiased, AI-driven results.' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-6 group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-white/10 transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white mb-3">{item.title}</h3>
                    <p className="text-base text-white/60 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Zero Commissions Section */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">Transparency</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              100% unbiased.<br />
              <span className="font-semibold">Cryptographically verified.</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-white/60 font-light leading-relaxed mb-16">
              We believe students shouldn't have to guess if their counselor is getting paid behind closed doors. We cryptographically sign and verify that $0.00 in commissions are accepted from our recommended institutions.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center hover:bg-white/10 transition-colors duration-300">
                <p className="text-5xl font-light text-white mb-3">0%</p>
                <p className="text-sm text-white/50 font-light tracking-wide">Commission Rate</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center hover:bg-white/10 transition-colors duration-300">
                <p className="text-5xl font-light text-white mb-3 flex items-center justify-center gap-3">
                  Live <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-sm text-white/50 font-light tracking-wide">Status Sync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* How It Works */}
      <section id="how-it-works" className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">How It Works</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Four simple steps<br />
              <span className="font-semibold">to your perfect school.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            {[
              { step: 1, title: 'Share Your Profile', desc: 'Tell us about your academic background, goals, budget, and preferences.', icon: Target },
              { step: 2, title: 'AI Analysis', desc: 'Our AI analyzes thousands of schools to find your perfect matches instantly.', icon: Brain },
              { step: 3, title: 'Get Recommendations', desc: 'Receive personalized, unbiased school recommendations with detailed insights.', icon: Lightbulb },
              { step: 4, title: 'Apply with Confidence', desc: 'Make informed decisions and apply to schools that truly align with your future.', icon: Rocket },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-white/50 font-light tracking-wide">Step {s.step}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-white mb-3">{s.title}</h3>
                    <p className="text-base text-white/60 font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Testimonials Section */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">Success Stories</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Students love<br />
              <span className="font-semibold">Rivernova.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', school: 'MIT', quote: 'Got matched with my dream school in 15 minutes. No bias, just facts.' },
              { name: 'Marcus Johnson', school: 'Stanford', quote: 'Saved $5K compared to traditional consultants. Best decision ever.' },
              { name: 'Emma Rodriguez', school: 'Harvard', quote: 'The AI recommendations were spot-on. Felt like having a personal advisor.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-base text-white/80 font-light leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="text-sm font-light text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/50 font-light">{testimonial.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Final CTA Section */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[900px] mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Ready to find your<br />
              <span className="font-semibold">perfect school?</span>
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
              Join students who are taking control of their education journey with AI-powered, unbiased guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-white text-black hover:bg-white/90 text-base font-medium h-12 px-8 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <p className="text-sm font-light text-white mb-4">Rivernova</p>
              <p className="text-sm text-white/50 font-light">Empowering students with unbiased, AI-powered education consulting.</p>
            </div>
            <div>
              <p className="text-sm font-light text-white mb-4">Product</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-white/60 font-light hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-white/60 font-light hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-white/60 font-light hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-light text-white mb-4">Legal</p>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-sm text-white/60 font-light hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-sm text-white/60 font-light hover:text-white transition-colors">Terms</a></li>
                <li><a href="/ledger" className="text-sm text-white/60 font-light hover:text-white transition-colors">Ledger</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-light text-white mb-4">Contact</p>
              <ul className="space-y-2">
                <li><a href="mailto:support@rivernova.com" className="text-sm text-white/60 font-light hover:text-white transition-colors">Email</a></li>
                <li><a href="#" className="text-sm text-white/60 font-light hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-sm text-white/60 font-light hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="h-px bg-white/5 mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 font-light">© 2026 Rivernova. All rights reserved.</p>
            <p className="text-sm text-white/50 font-light">Made with care for students everywhere.</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CookieConsent />
    </main>
  );
}
