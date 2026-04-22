'use client';

import React, { useState } from 'react';
import { ShieldCheck, Users, Activity, Settings, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-[#09090b] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0c0c10] flex flex-col p-6">
        <div className="flex items-center gap-2 mb-10 pb-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
             <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-widest uppercase text-sm">God Mode</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', icon: <Activity className="w-4 h-4"/>, label: 'Overview' },
            { id: 'users', icon: <Users className="w-4 h-4"/>, label: 'Students' },
            { id: 'analytics', icon: <TrendingUp className="w-4 h-4"/>, label: 'Analytics Flywheel' },
            { id: 'settings', icon: <Settings className="w-4 h-4"/>, label: 'System Settings' }
          ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                 activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
               }`}
            >
               {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="flex justify-between items-center mb-12">
           <h1 className="text-3xl font-bold">Platform Overview</h1>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
             <Input 
               placeholder="Search logs or users..." 
               className="bg-black/50 border-white/10 text-white pl-10 rounded-xl"
             />
           </div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-10">
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-white/50 text-sm font-semibold uppercase tracking-wider block mb-2">Total Students</span>
              <span className="text-4xl font-bold">12,492</span>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-white/50 text-sm font-semibold uppercase tracking-wider block mb-2">AI Matches Generated</span>
              <span className="text-4xl font-bold text-emerald-400">45,102</span>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-white/50 text-sm font-semibold uppercase tracking-wider block mb-2">Commissions Taken</span>
              <span className="text-4xl font-bold text-rose-400">$0.00</span>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
           <div className="p-6 border-b border-white/10">
              <h3 className="font-bold">Recent System Activity</h3>
           </div>
           <div className="p-0">
             <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between text-sm">
                <span className="text-emerald-400 font-mono">SYS_AUTH</span>
                <span className="text-white/80">User usr_***921 completed onboarding payload</span>
                <span className="text-white/40">2 mins ago</span>
             </div>
             <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between text-sm">
                <span className="text-indigo-400 font-mono">PERPLEXITY_REQ</span>
                <span className="text-white/80">Agent resolved university tuition boundaries (UK)</span>
                <span className="text-white/40">5 mins ago</span>
             </div>
             <div className="px-6 py-4 flex items-center justify-between text-sm">
                <span className="text-rose-400 font-mono">BILLING_MOCK</span>
                <span className="text-white/80">Received $99 initialization payment (TEST_MODE)</span>
                <span className="text-white/40">12 mins ago</span>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
