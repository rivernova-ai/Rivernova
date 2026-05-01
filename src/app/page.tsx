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

      {/* Transparency Section - Enhanced */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">Transparency</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              <span className="font-semibold">100% unbiased.</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 border border-white/10 p-16 rounded-3xl hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center space-y-8">
                  <div className="space-y-4 text-center">
                    <p className="text-7xl md:text-8xl font-light text-white tracking-tight">0%</p>
                    <p className="text-lg text-white/60 font-light">Commission Rate</p>
                  </div>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                  <p className="text-sm text-white/50 font-light text-center max-w-md leading-relaxed">
                    We never accept commissions from schools. Your recommendations are based purely on what's best for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Dashboard Preview Section */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20 md:mb-32">
            <p className="text-sm text-white/50 font-light tracking-wide uppercase mb-4">Your Experience</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Intuitive dashboard<br />
              <span className="font-semibold">designed for you.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Features */}
            <div className="space-y-8">
              {[
                { icon: Search, title: 'Smart Search', desc: 'Find schools that match your profile with intelligent filtering and sorting.' },
                { icon: BarChart3, title: 'Detailed Analytics', desc: 'See acceptance rates, average scores, and detailed insights for each school.' },
                { icon: Bookmark, title: 'Save & Compare', desc: 'Bookmark your favorites and compare schools side-by-side effortlessly.' },
                { icon: MessageSquare, title: 'AI Chat Support', desc: 'Get instant answers to your questions from our AI education advisor.' }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex gap-6 group cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/60 font-light leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
                {/* Dashboard Header */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 font-light uppercase tracking-wide">Your Matches</p>
                      <p className="text-2xl font-light text-white">12 Schools</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>

                  {/* School Cards */}
                  <div className="space-y-3">
                    {[
                      { name: 'Stanford University', match: '98%', color: 'from-indigo-500/20' },
                      { name: 'MIT', match: '95%', color: 'from-purple-500/20' },
                      { name: 'Harvard University', match: '92%', color: 'from-indigo-500/20' }
                    ].map((school, i) => (
                      <div key={i} className="bg-white/5 hover:bg-white/10 transition-colors duration-300 p-4 rounded-xl border border-white/5 group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-light text-white">{school.name}</p>
                            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${school.color} to-transparent`} style={{width: school.match}} />
                            </div>
                          </div>
                          <p className="text-sm font-light text-indigo-400 ml-4">{school.match}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xs text-white/50 font-light">Avg Score</p>
                      <p className="text-lg font-light text-white mt-1">1520</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xs text-white/50 font-light">Acceptance</p>
                      <p className="text-lg font-light text-white mt-1">8.2%</p>
                    </div>
                  </div>
                </div>
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
