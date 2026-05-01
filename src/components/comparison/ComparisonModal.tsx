'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, TrendingUp, DollarSign, GraduationCap, Briefcase, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonSchool, formatCurrency, getTuitionNumber } from '@/lib/comparison';
import { getMatchScoreColor } from '@/lib/utils';

interface ComparisonModalProps {
  schools: ComparisonSchool[];
  userProfile: any;
  onClose: () => void;
}

export function ComparisonModal({ schools, userProfile, onClose }: ComparisonModalProps) {
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await fetch('/api/compare-schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schools,
            userProfile: {
              major: userProfile.academic_background?.major || '',
              careerField: userProfile.career_goals?.careerField || '',
              dreamJob: userProfile.career_goals?.dreamJob || '',
              gpa: userProfile.academic_background?.gpa || '',
              budgetMin: userProfile.budget?.min || 0,
              budgetMax: userProfile.budget?.max || 0,
              preferredCountries: userProfile.location_preferences?.preferredCountries || '',
            },
          }),
        });

        const data = await response.json();
        if (data.recommendation) {
          setRecommendation(data.recommendation);
        }
      } catch (error) {
        console.error('Failed to fetch recommendation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [schools, userProfile]);

  const comparisonRows = [
    {
      label: 'Match Score',
      key: 'matchScore',
      format: (val: any) => `${val}%`,
      icon: TrendingUp,
    },
    {
      label: 'Annual Tuition',
      key: 'tuition',
      format: (val: any) => val,
      icon: DollarSign,
    },
    {
      label: 'Program',
      key: 'program',
      format: (val: any) => val,
      icon: GraduationCap,
    },
    {
      label: 'Acceptance Rate',
      key: 'admissionRate',
      format: (val: any) => val || '—',
      icon: TrendingUp,
    },
    {
      label: 'Employment Rate',
      key: 'employmentRate',
      format: (val: any) => val || '—',
      icon: Briefcase,
    },
    {
      label: 'Avg Salary',
      key: 'avgSalary',
      format: (val: any) => val || '—',
      icon: Award,
    },
    {
      label: 'Location',
      key: 'location',
      format: (val: any) => val,
      icon: MapPin,
    },
    {
      label: 'Scholarships',
      key: 'scholarships',
      format: (val: any) => val || '—',
      icon: Award,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0c10] border border-white/10 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c10] border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">School Comparison</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Metric</th>
                  {schools.map((school, idx) => (
                    <th key={idx} className="text-left py-4 px-4 text-white font-semibold">
                      <div className="space-y-2">
                        <div className="text-base">{school.name}</div>
                        <div className="text-xs text-white/50 font-light">{school.location}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white/70 font-medium text-sm flex items-center gap-2">
                      {row.icon && <row.icon className="w-4 h-4 text-indigo-400" />}
                      {row.label}
                    </td>
                    {schools.map((school, colIdx) => {
                      const value = school[row.key];
                      const formatted = row.format(value);
                      const isMatchScore = row.key === 'matchScore';

                      return (
                        <td key={colIdx} className="py-4 px-4">
                          {isMatchScore && value ? (
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 ${getMatchScoreColor(value)} font-bold text-lg`}>
                              {formatted}
                            </div>
                          ) : (
                            <div className="text-white font-light">{formatted}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Highlights Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Key Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schools.map((school, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4">{school.name}</h4>
                  <ul className="space-y-2">
                    {school.highlights?.slice(0, 4).map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-3 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              AI Recommendation
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : recommendation ? (
              <div className="space-y-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {recommendation}
              </div>
            ) : (
              <p className="text-white/50">Unable to generate recommendation</p>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 px-8 h-11"
            >
              Close Comparison
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
