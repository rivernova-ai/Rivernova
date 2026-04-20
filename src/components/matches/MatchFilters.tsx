'use client';

import { useState } from 'react';
import { Filter, DollarSign, MapPin, TrendingUp, GraduationCap, X, ChevronDown, Check } from 'lucide-react';
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

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpenDropdown(null);
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

  const budgetOptions = [
    { value: 'all', label: 'All Budgets' },
    { value: 'under30k', label: 'Under $30k' },
    { value: '30k-50k', label: '$30k - $50k' },
    { value: '50k-70k', label: '$50k - $70k' },
    { value: 'over70k', label: 'Over $70k' },
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'usa', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'australia', label: 'Australia' },
  ];

  const scoreOptions = [
    { value: 'all', label: 'All Scores' },
    { value: 'high', label: 'High Match 80%+' },
    { value: 'medium', label: 'Good Match 60-79%' },
    { value: 'low', label: 'Reach <60%' },
  ];

  const programOptions = [
    { value: 'all', label: 'All Programs' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'masters', label: "Master's" },
    { value: 'phd', label: 'PhD' },
    { value: 'certificate', label: 'Certificate' },
  ];

  const FilterDropdown = ({ 
    name, 
    icon: Icon, 
    options, 
    value, 
    color 
  }: { 
    name: keyof FilterOptions; 
    icon: any; 
    options: { value: string; label: string }[]; 
    value: string;
    color: string;
  }) => {
    const isOpen = openDropdown === name;
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : name)}
          className={`w-full group relative overflow-hidden rounded-2xl px-4 py-3.5 text-left transition-all duration-300 ${
            isOpen 
              ? `bg-gradient-to-br ${color} shadow-lg shadow-${color.split('-')[0]}-500/20 border-2 border-${color.split('-')[0]}-500/50` 
              : 'bg-white/[0.05] hover:bg-white/[0.08] border-2 border-white/[0.08] hover:border-white/[0.15]'
          }`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center transition-transform duration-300 ${isOpen ? 'scale-110' : ''}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-0.5">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedOption?.label}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
          </div>
          
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </button>

        {/* Dropdown Menu - Changed to Drop-UP */}
        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/[0.15] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-2 space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(name, option.value)}
                    className={`w-full group/item relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                      value === option.value
                        ? `bg-gradient-to-r ${color} text-white shadow-lg`
                        : 'hover:bg-white/[0.08] text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-sm font-semibold">{option.label}</span>
                      {value === option.value && (
                        <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" />
                      )}
                    </div>
                    {value !== option.value && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover/item:opacity-10 transition-opacity duration-300`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative group/filter">
      {/* Animated border glow */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[28px] opacity-0 group-hover/filter:opacity-20 blur-xl transition-opacity duration-700" />
      
      <div className="relative bg-gradient-to-br from-[#0f0f14]/90 to-[#0a0a0f]/90 border border-white/[0.12] rounded-3xl p-6 md:p-8 backdrop-blur-2xl">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)] rounded-3xl pointer-events-none" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Filter Results</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-indigo-400 font-bold mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                onClick={resetFilters}
                className="group relative overflow-hidden rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] text-white h-10 px-5 transition-all duration-300"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterDropdown
              name="budgetRange"
              icon={DollarSign}
              options={budgetOptions}
              value={filters.budgetRange}
              color="from-emerald-500 to-emerald-600"
            />
            <FilterDropdown
              name="location"
              icon={MapPin}
              options={locationOptions}
              value={filters.location}
              color="from-blue-500 to-blue-600"
            />
            <FilterDropdown
              name="successRate"
              icon={TrendingUp}
              options={scoreOptions}
              value={filters.successRate}
              color="from-purple-500 to-purple-600"
            />
            <FilterDropdown
              name="programType"
              icon={GraduationCap}
              options={programOptions}
              value={filters.programType}
              color="from-pink-500 to-pink-600"
            />
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
