'use client';

import { useState } from 'react';
import { Filter, DollarSign, MapPin, TrendingUp, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOptions {
  budgetRange: string;
  location: string;
  successRate: string;
  programType: string;
}

interface MatchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function MatchFilters({ onFilterChange }: MatchFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    budgetRange: 'all',
    location: 'all',
    successRate: 'all',
    programType: 'all',
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      budgetRange: 'all',
      location: 'all',
      successRate: 'all',
      programType: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

  return (
    <div className="relative group/filter">
      {/* Glow effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover/filter:opacity-100 transition duration-500 blur-sm" />
      
      <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] rounded-3xl p-6 md:p-8 backdrop-blur-xl">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] rounded-3xl pointer-events-none" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Filter className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Filter Results</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </p>
                )}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                className="text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-9 px-4 transition-all"
              >
                <X className="w-4 h-4 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Budget Range */}
            <div className="group/item">
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                Budget
              </label>
              <div className="relative">
                <select
                  value={filters.budgetRange}
                  onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
                  className="w-full appearance-none bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.2] rounded-2xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all cursor-pointer backdrop-blur-sm [&>option]:bg-[#1a1a1f] [&>option]:text-white [&>option]:py-3 [&>option]:px-4 [&>option]:rounded-xl [&>option]:my-1 [&>option:hover]:bg-emerald-500/20 [&>option:checked]:bg-emerald-500/30 [&>option:checked]:text-emerald-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="all">All Budgets</option>
                  <option value="under30k">💰 Under $30k/year</option>
                  <option value="30k-50k">💵 $30k - $50k/year</option>
                  <option value="50k-70k">💸 $50k - $70k/year</option>
                  <option value="over70k">💎 Over $70k/year</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="group/item">
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Location
              </label>
              <div className="relative">
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full appearance-none bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.2] rounded-2xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all cursor-pointer backdrop-blur-sm [&>option]:bg-[#1a1a1f] [&>option]:text-white [&>option]:py-3 [&>option]:px-4 [&>option:hover]:bg-blue-500/20 [&>option:checked]:bg-blue-500/30 [&>option:checked]:text-blue-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%233B82F6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="all">All Locations</option>
                  <option value="usa">🇺🇸 United States</option>
                  <option value="canada">🇨🇦 Canada</option>
                  <option value="uk">🇬🇧 United Kingdom</option>
                  <option value="europe">🇪🇺 Europe</option>
                  <option value="asia">🌏 Asia</option>
                  <option value="australia">🇦🇺 Australia</option>
                </select>
              </div>
            </div>

            {/* Success Rate */}
            <div className="group/item">
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                </div>
                Match Score
              </label>
              <div className="relative">
                <select
                  value={filters.successRate}
                  onChange={(e) => handleFilterChange('successRate', e.target.value)}
                  className="w-full appearance-none bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.2] rounded-2xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all cursor-pointer backdrop-blur-sm [&>option]:bg-[#1a1a1f] [&>option]:text-white [&>option]:py-3 [&>option]:px-4 [&>option:hover]:bg-purple-500/20 [&>option:checked]:bg-purple-500/30 [&>option:checked]:text-purple-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23A855F7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="all">All Scores</option>
                  <option value="high">🔥 80%+ (High Match)</option>
                  <option value="medium">✨ 60-79% (Good Match)</option>
                  <option value="low">🎯 Below 60% (Reach)</option>
                </select>
              </div>
            </div>

            {/* Program Type */}
            <div className="group/item">
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">
                <div className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-pink-400" />
                </div>
                Program
              </label>
              <div className="relative">
                <select
                  value={filters.programType}
                  onChange={(e) => handleFilterChange('programType', e.target.value)}
                  className="w-full appearance-none bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.2] rounded-2xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all cursor-pointer backdrop-blur-sm [&>option]:bg-[#1a1a1f] [&>option]:text-white [&>option]:py-3 [&>option]:px-4 [&>option:hover]:bg-pink-500/20 [&>option:checked]:bg-pink-500/30 [&>option:checked]:text-pink-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23EC4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="all">All Programs</option>
                  <option value="undergraduate">🎓 Undergraduate</option>
                  <option value="masters">📚 Master's</option>
                  <option value="phd">🔬 PhD</option>
                  <option value="certificate">📜 Certificate</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
