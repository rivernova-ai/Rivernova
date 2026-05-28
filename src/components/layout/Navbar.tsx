'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-400"
        style={{
          background: scrolled ? 'rgba(8,8,16,0.85)' : 'rgba(8,8,16,0.4)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 flex items-center justify-center text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(99,102,241,0.7)] transition-all">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" className="w-8 h-8">
                <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
                <text x="50" y="55" fontSize="46" fontWeight="bold" fontFamily="sans-serif" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="middle">R</text>
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#f0f0f8' }}>Rivernova</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="#how-it-works" className="hidden md:block text-sm font-medium transition-colors" style={{ color: 'rgba(240,240,248,0.45)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,248,0.45)')}>
              How It Works
            </Link>

            {user ? (
              <div className="flex items-center gap-3 ml-4">
                <Link href="/dashboard">
                  <Button variant="ghost" style={{ color: 'rgba(240,240,248,0.7)' }}>Dashboard</Button>
                </Link>
                <Button variant="outline"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(240,240,248,0.7)', background: 'rgba(255,255,255,0.05)' }}
                  onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="ml-4 rounded-xl text-white border-0 px-6"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}>
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};
export default Navbar;
