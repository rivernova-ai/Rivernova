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
  const { user, signOut } = useAuth(); // We'll build a simple mock wrapper

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-400 ${
          scrolled
            ? 'py-3 bg-black/85 backdrop-blur-xl border-b border-white/10'
            : 'bg-black/60 backdrop-blur-xl border-b border-white/5'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 flex items-center justify-center text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" className="w-8 h-8">
                <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
                <text x="50" y="55" fontSize="46" fontWeight="bold" fontFamily="sans-serif" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="middle">R</text>
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-white">Rivernova</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="#how-it-works" className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors">
              How It Works
            </Link>

            {user ? (
              <div className="flex items-center gap-3 ml-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white/10">Dashboard</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-white/10 hover:bg-white/5 text-white"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="ml-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all px-6"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};
