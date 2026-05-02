'use client';

import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonSchool } from '@/lib/comparison';
import { cleanText } from '@/lib/utils';

interface ComparisonBarProps {
  selectedSchools: ComparisonSchool[];
  onViewComparison: () => void;
  onRemoveSchool: (schoolName: string) => void;
}

export function ComparisonBar({
  selectedSchools,
  onViewComparison,
  onRemoveSchool,
}: ComparisonBarProps) {
  if (selectedSchools.length < 1) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none animate-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="pointer-events-auto">
          {/* Subtle ambient glow */}
          <div className="absolute inset-0 -top-32 bg-gradient-to-t from-indigo-500/10 to-transparent blur-3xl" />
          
          {/* Main Bar Container */}
          <div className="relative">
            {/* Ultra-subtle outer glow */}
            <div className="absolute -inset-[0.5px] bg-gradient-to-r from-indigo-500/20 to-indigo-500/20 rounded-[22px] blur-md opacity-50" />
            
            {/* Glass container */}
            <div className="relative bg-black/60 backdrop-blur-3xl border border-white/[0.08] rounded-[22px] shadow-2xl overflow-hidden">
              {/* Minimal gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] to-indigo-500/[0.02]" />
              
              {/* Content */}
              <div className="relative px-8 py-5">
                <div className="flex items-center justify-between gap-8">
                  {/* Left: School Pills */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {selectedSchools.map((school, idx) => (
                      <div
                        key={school.name}
                        className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
                        style={{ 
                          animationDelay: `${idx * 100}ms`,
                          animationFillMode: 'backwards'
                        }}
                      >
                        {/* Pill container */}
                        <div className="relative">
                          {/* Minimal hover glow */}
                          <div className="absolute -inset-[0.5px] bg-indigo-400/0 group-hover:bg-indigo-400/30 rounded-full blur-sm transition-all duration-500" />
                          
                          {/* Pill */}
                          <div className="relative flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] rounded-full pl-5 pr-2 py-3 transition-all duration-500 ease-out">
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-light text-white/90 truncate max-w-[180px] tracking-tight">{cleanText(school.name)}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                                <span className="text-xs text-white/40 font-light tracking-wide">{school.matchScore}% match</span>
                              </div>
                            </div>
                            <button
                              onClick={() => onRemoveSchool(school.name)}
                              className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:rotate-90"
                            >
                              <X className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80 transition-colors duration-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex-shrink-0 flex items-center gap-4">
                    {selectedSchools.length < 2 && (
                      <span className="text-xs text-white/30 font-light">Add {2 - selectedSchools.length} more to compare</span>
                    )}
                    <Button
                      onClick={onViewComparison}
                      disabled={selectedSchools.length < 2}
                      className="group relative rounded-full bg-white text-black hover:bg-white/95 border-0 font-normal px-7 h-12 shadow-lg hover:shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] flex items-center gap-2.5 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      <span className="relative text-[15px] tracking-tight">Compare {selectedSchools.length > 1 ? `${selectedSchools.length} Schools` : ''}</span>
                      <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ease-out" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
