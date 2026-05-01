'use client';

import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonSchool } from '@/lib/comparison';

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
  if (selectedSchools.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600/95 to-purple-600/95 backdrop-blur-md border-t border-white/20 z-40">
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-white font-semibold">
            Comparing {selectedSchools.length} schools
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedSchools.map((school) => (
              <div
                key={school.name}
                className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-sm text-white"
              >
                <span>{school.name}</span>
                <button
                  onClick={() => onRemoveSchool(school.name)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onViewComparison}
            className="rounded-full bg-white text-indigo-600 hover:bg-white/90 font-semibold px-6 h-10 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
