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
          background: scrolled ? 'rgba(245,237,229,0.95)' : 'rgba(245,237,229,0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(140,45,53,0.12)' : '1px solid rgba(140,45,53,0.06)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg viewBox="0 0 100 100" className="w-8 h-8 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(140,45,53,0.3)] group-hover:drop-shadow-[0_2px_12px_rgba(140,45,53,0.5)] transition-all" aria-hidden="true">
              <polygon points="31.4,5 68.6,5 95,31.4 95,68.6 68.6,95 31.4,95 5,68.6 5,31.4" fill="#8C2D35" />
              <text x="50" y="71" fontSize="58" fontFamily="Georgia, 'Times New Roman', serif" fill="#F5EDE5" textAnchor="middle" fontWeight="bold">R</text>
            </svg>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#1C0A0C' }}>Rivernova</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="#how-it-works"
              className="hidden md:block text-sm font-medium transition-colors"
              style={{ color: '#1C0A0C' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
              onMouseLeave={e => (e.currentTarget.style.color = '#1C0A0C')}
            >
              How It Works
            </Link>

            {user ? (
              <div className="flex items-center gap-3 ml-4">
                <Link href="/dashboard">
                  <Button variant="ghost" style={{ color: '#1C0A0C' }}>Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  style={{ borderColor: 'rgba(140,45,53,0.2)', color: '#1C0A0C', background: 'rgba(140,45,53,0.04)' }}
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="ml-4 rounded-xl text-white border-0 px-6"
                style={{ background: '#8C2D35', boxShadow: '0 0 20px rgba(140,45,53,0.3)' }}
              >
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
