'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, MessageSquare, ListCheck, UserCircle, LogOut, Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  if (loading) return null;
  if (!user) return null; // In real app, middleware handles this map

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0c0c10] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 flex items-center justify-center text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all">
               <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" className="w-8 h-8">
                 <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
                 <text x="50" y="55" fontSize="46" fontWeight="bold" fontFamily="sans-serif" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="middle">R</text>
               </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-white">Rivernova</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === '/dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>

          <Link 
            href="/dashboard/ai"
            className={`flex flex-col gap-1 px-4 py-3 rounded-xl transition-all ${
              pathname === '/dashboard/ai' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Advisor
            </div>
            <span className="text-[10px] text-white/30 ml-8">Rivernova can make mistakes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5">
            <UserCircle className="w-8 h-8 text-white/80" />
            <div className="overflow-hidden text-ellipsis">
              <p className="text-sm font-medium text-white truncate w-full">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-white/40 truncate w-full">{user.email}</p>
            </div>
          </div>
          <button 
             onClick={() => signOut()}
             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex-1 relative z-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
