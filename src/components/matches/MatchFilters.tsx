'use client';

import { useState } from 'react';
import { Filter, DollarSign, MapPin, TrendingUp, GraduationCap } from 'lucide-react';
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

  return (
    <div className="bg-[#0c0c10] border border-white/10 rounded-[32px] p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Filter Results</h3>
        </div>
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="text-xs text-white/40 hover:text-white"
        >
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
            <DollarSign className="w-4 h-4" />
            Budget Range
          </label>
          <select
            value={filters.budgetRange}
            onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Budgets</option>
            <option value="under30k">Under $30k/year</option>
            <option value="30k-50k">$30k - $50k/year</option>
            <option value="50k-70k">$50k - $70k/year</option>
            <option value="over70k">Over $70k/year</option>
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Locations</option>
            <option value="usa">United States</option>
            <option value="canada">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="australia">Australia</option>
          </select>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" />
            Match Score
          </label>
          <select
            value={filters.successRate}
            onChange={(e) => handleFilterChange('successRate', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Scores</option>
            <option value="high">80%+ (High Match)</option>
            <option value="medium">60-79% (Good Match)</option>
            <option value="low">Below 60% (Reach)</option>
          </select>
        </div>

        {/* Program Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" />
            Program Type
          </label>
          <select
            value={filters.programType}
            onChange={(e) => handleFilterChange('programType', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Programs</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="masters">Master's</option>
            <option value="phd">PhD</option>
            <option value="certificate">Certificate</option>
          </select>
        </div>
      </div>
    </div>
  );
}
