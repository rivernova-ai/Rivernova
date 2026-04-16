'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LedgerTable } from '@/components/ledger/LedgerTable';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface LedgerEntry {
  id: string;
  school_name: string;
  country: string;
  commission_amount: number;
  statement: string;
  verified_at: string;
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('commission_ledger')
        .select('*')
        .eq('public', true)
        .order('school_name', { ascending: true });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4" />
              Public Transparency Ledger
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Zero <span className="gradient-text">Commission</span> Proof
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Every school we recommend is listed here with verified $0 commission agreements. 
              Complete transparency, no hidden deals.
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <LedgerTable entries={entries} />
          )}

          {/* How It Works */}
          <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">How This Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-3">
                  1
                </div>
                <h3 className="text-white font-bold">Real-Time Verification</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Every school in our database is verified to have zero commission agreements with Rivernova.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold mb-3">
                  2
                </div>
                <h3 className="text-white font-bold">Public Access</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  This ledger is publicly accessible to anyone, ensuring complete transparency in our recommendations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold mb-3">
                  3
                </div>
                <h3 className="text-white font-bold">Continuous Updates</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  As we add new schools to our platform, they're immediately added here with verification status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 border-t border-white/5 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Rivernova</span>
            <span className="text-white/40 text-sm">© 2026</span>
          </div>
          <p className="text-white/40 text-sm text-center md:text-right">
            Empowering students with unbiased, global AI-powered education consulting.
          </p>
        </div>
      </footer>
    </main>
  );
}
