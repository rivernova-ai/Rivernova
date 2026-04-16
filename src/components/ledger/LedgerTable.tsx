'use client';

import { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LedgerEntry {
  id: string;
  school_name: string;
  country: string;
  commission_amount: number;
  statement: string;
  verified_at: string;
}

interface LedgerTableProps {
  entries: LedgerEntry[];
}

export function LedgerTable({ entries }: LedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter(
    (entry) =>
      entry.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by school or country..."
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-3xl font-bold text-white">{entries.length}</span>
          </div>
          <p className="text-white/60 text-sm">Schools Verified</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-emerald-400">$0</span>
          </div>
          <p className="text-white/60 text-sm">Total Commissions</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            <span className="text-3xl font-bold text-white">100%</span>
          </div>
          <p className="text-white/60 text-sm">Transparency</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-bold text-white/80 uppercase tracking-wider">
                  School Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-bold text-white/80 uppercase tracking-wider">
                  Country
                </th>
                <th className="text-left px-6 py-4 text-sm font-bold text-white/80 uppercase tracking-wider">
                  Commission
                </th>
                <th className="text-left px-6 py-4 text-sm font-bold text-white/80 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/60">
                    No schools found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{entry.school_name}</div>
                      <div className="text-xs text-white/40 mt-1">{entry.statement}</div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{entry.country}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                        ${entry.commission_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {new Date(entry.verified_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-bold mb-2">Our Zero Commission Guarantee</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Every school listed here has been verified to have $0 commission agreements with Rivernova. 
              We are committed to providing unbiased recommendations based solely on what's best for students, 
              not what pays us the most. This ledger is updated in real-time and publicly accessible to ensure 
              complete transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
