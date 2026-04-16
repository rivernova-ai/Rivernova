'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link href="/dashboard/matches" className="group">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Search className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Find Matches</h3>
          <p className="text-white/60 leading-relaxed mb-4">
            Get AI-powered school recommendations based on your profile
          </p>
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm group-hover:gap-3 transition-all">
            Start Matching
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      <button className="group text-left">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">AI Counselor</h3>
          <p className="text-white/60 leading-relaxed mb-4">
            Chat with your 24/7 AI counselor for personalized guidance
          </p>
          <div className="flex items-center gap-2 text-purple-400 font-medium text-sm group-hover:gap-3 transition-all">
            Start Chat
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>

      <Link href="/ledger" className="group">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Zero Commission</h3>
          <p className="text-white/60 leading-relaxed mb-4">
            View our public ledger proving zero commissions
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm group-hover:gap-3 transition-all">
            View Ledger
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}
