'use client';

import { ComparisonSchool, getTuitionNumber } from '@/lib/comparison';
import { Award, TrendingUp, DollarSign, Users, Zap } from 'lucide-react';
import { cleanText } from '@/lib/utils';

interface SchoolComparisonProps {
  schools: ComparisonSchool[];
}

export function SchoolComparison({ schools }: SchoolComparisonProps) {
  const extractPercentage = (value: string | undefined): number => {
    if (!value || value === '—' || value === 'N/A') return 0;
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const extractSalary = (value: string | undefined): number => {
    if (!value || value === '—' || value === 'N/A') return 0;
    const match = value.match(/\$?([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  };

  // Normalize data for visualization
  const data = schools.map(school => ({
    name: cleanText(school.name),
    matchScore: school.matchScore || 0,
    acceptance: extractPercentage(school.admissionRate),
    employment: extractPercentage(school.employmentRate),
    salary: extractSalary(school.avgSalary),
    tuition: getTuitionNumber(school.tuition) || 0,
  }));

  const maxSalary = Math.max(...data.map(d => d.salary), 100000);
  const maxTuition = Math.max(...data.map(d => d.tuition), 50000);

  // Find key differences
  const getKeyDifferences = () => {
    if (data.length < 2) return [];
    
    const differences = [];
    
    // Match score difference
    const matchDiff = Math.abs(data[0].matchScore - data[1].matchScore);
    if (matchDiff > 5) {
      const better = data[0].matchScore > data[1].matchScore ? data[0].name : data[1].name;
      differences.push(`${better} has ${matchDiff}% better match score`);
    }

    // Acceptance rate difference
    const acceptDiff = Math.abs(data[0].acceptance - data[1].acceptance);
    if (acceptDiff > 5) {
      const easier = data[0].acceptance > data[1].acceptance ? data[0].name : data[1].name;
      differences.push(`${easier} is ${acceptDiff}% easier to get into`);
    }

    // Salary difference
    const salaryDiff = Math.abs(data[0].salary - data[1].salary);
    if (salaryDiff > 5000) {
      const higher = data[0].salary > data[1].salary ? data[0].name : data[1].name;
      differences.push(`${higher} graduates earn $${(salaryDiff / 1000).toFixed(0)}k more`);
    }

    // Tuition difference
    const tuitionDiff = Math.abs(data[0].tuition - data[1].tuition);
    if (tuitionDiff > 5000) {
      const cheaper = data[0].tuition < data[1].tuition ? data[0].name : data[1].name;
      differences.push(`${cheaper} is $${(tuitionDiff / 1000).toFixed(0)}k cheaper per year`);
    }

    return differences.slice(0, 4);
  };

  return (
    <div className="space-y-8">
      {/* Key Differences - Highlighted */}
      {getKeyDifferences().length > 0 && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
          <h3 className="text-lg font-light text-white mb-6 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
            Key Differences
          </h3>
          <div className="grid gap-3">
            {getKeyDifferences().map((diff, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <p className="text-white/80 text-sm font-light">{diff}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Radar-style Comparison */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8">
        <h3 className="text-lg font-light text-white mb-8 flex items-center gap-3">
          <Award className="w-5 h-5 text-indigo-400" />
          Overall Metrics
        </h3>
        
        <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Math.min(schools.length, 2)}, 1fr)` }}>
          {data.map((school, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-white/90 font-light text-base">{school.name}</h4>
              
              {/* Hexagon-style metrics */}
              <div className="space-y-4">
                {/* Match Score */}
                {school.matchScore > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 font-light uppercase tracking-wider">Match Score</span>
                      <span className="text-sm font-light text-indigo-400">{school.matchScore}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                        style={{ width: `${school.matchScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Acceptance Rate */}
                {school.acceptance > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 font-light uppercase tracking-wider">Acceptance Rate</span>
                      <span className="text-sm font-light text-emerald-400">{school.acceptance}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${school.acceptance}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Employment Rate */}
                {school.employment > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 font-light uppercase tracking-wider">Employment Rate</span>
                      <span className="text-sm font-light text-purple-400">{school.employment}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                        style={{ width: `${school.employment}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Salary */}
                {school.salary > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 font-light uppercase tracking-wider">Avg Salary</span>
                      <span className="text-sm font-light text-amber-400">${(school.salary / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(school.salary / maxSalary) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tuition */}
                {school.tuition > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 font-light uppercase tracking-wider">Annual Tuition</span>
                      <span className="text-sm font-light text-rose-400">${(school.tuition / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(school.tuition / maxTuition) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side Comparison Cards */}
      {data.length === 2 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Winner Cards */}
          {[
            { label: 'Better Match', value: data[0].matchScore > data[1].matchScore ? 0 : 1, metric: 'matchScore' },
            { label: 'Easier to Get In', value: data[0].acceptance > data[1].acceptance ? 0 : 1, metric: 'acceptance' },
            { label: 'Higher Salary', value: data[0].salary > data[1].salary ? 0 : 1, metric: 'salary' },
            { label: 'More Affordable', value: data[0].tuition < data[1].tuition ? 0 : 1, metric: 'tuition' },
          ].map((item, idx) => {
            const winner = data[item.value];
            const loser = data[1 - item.value];
            const winnerValue = winner[item.metric as keyof typeof winner];
            const loserValue = loser[item.metric as keyof typeof loser];
            const diff = Math.abs(Number(winnerValue) - Number(loserValue));

            return (
              <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-300">
                <p className="text-xs text-white/40 font-light uppercase tracking-wider mb-4">{item.label}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90 font-light">{winner.name}</span>
                    <span className="text-lg font-light text-indigo-400">
                      {item.metric === 'salary' ? `$${(winnerValue as number / 1000).toFixed(0)}k` : 
                       item.metric === 'tuition' ? `$${(winnerValue as number / 1000).toFixed(0)}k` :
                       `${winnerValue}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50 font-light">{loser.name}</span>
                    <span className="text-lg font-light text-white/40">
                      {item.metric === 'salary' ? `$${(loserValue as number / 1000).toFixed(0)}k` : 
                       item.metric === 'tuition' ? `$${(loserValue as number / 1000).toFixed(0)}k` :
                       `${loserValue}%`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-white/40 font-light">
                      {item.metric === 'salary' ? `+$${(diff / 1000).toFixed(0)}k difference` :
                       item.metric === 'tuition' ? `$${(diff / 1000).toFixed(0)}k difference` :
                       `+${diff.toFixed(1)}% difference`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Metrics Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="grid gap-px bg-white/[0.06]" style={{ gridTemplateColumns: `200px repeat(${schools.length}, 1fr)` }}>
          {/* Header */}
          <div className="bg-black/95 p-4">
            <span className="text-xs text-white/40 font-light uppercase tracking-wider">Metric</span>
          </div>
          {schools.map((school, idx) => (
            <div key={idx} className="bg-black/95 p-4">
              <span className="text-sm text-white/80 font-light">{cleanText(school.name)}</span>
            </div>
          ))}

          {/* Rows */}
          {[
            { label: 'Match Score', icon: TrendingUp, values: (d: typeof data[0]) => d.matchScore > 0 ? `${d.matchScore}%` : 'N/A' },
            { label: 'Acceptance Rate', icon: Users, values: (d: typeof data[0]) => d.acceptance > 0 ? `${d.acceptance}%` : 'N/A' },
            { label: 'Employment Rate', icon: Zap, values: (d: typeof data[0]) => d.employment > 0 ? `${d.employment}%` : 'N/A' },
            { label: 'Avg Salary', icon: DollarSign, values: (d: typeof data[0]) => d.salary > 0 ? `$${(d.salary / 1000).toFixed(0)}k` : 'N/A' },
            { label: 'Annual Tuition', icon: Award, values: (d: typeof data[0]) => d.tuition > 0 ? `$${(d.tuition / 1000).toFixed(0)}k` : 'N/A' },
          ].map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className="bg-black/95 p-4 flex items-center gap-2">
                <row.icon className="w-4 h-4 text-indigo-400/60" />
                <span className="text-xs text-white/50 font-light">{row.label}</span>
              </div>
              {data.map((school, colIdx) => (
                <div key={colIdx} className="bg-black/95 p-4">
                  <span className="text-sm text-white/70 font-light">{row.values(school)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
