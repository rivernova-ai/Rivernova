'use client';

import { ComparisonSchool, getTuitionNumber } from '@/lib/comparison';
import { Award, TrendingUp, DollarSign, Users, Zap, Target } from 'lucide-react';
import { cleanText } from '@/lib/utils';

interface VisualComparisonProps {
  schools: ComparisonSchool[];
}

export function VisualComparison({ schools }: VisualComparisonProps) {
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

  // Normalize all metrics to 0-100 scale for radar chart
  const normalizedData = data.map(d => ({
    name: d.name,
    matchScore: d.matchScore,
    acceptance: d.acceptance,
    employment: d.employment,
    salary: (d.salary / maxSalary) * 100,
    affordability: 100 - ((d.tuition / maxTuition) * 100), // Inverted: lower tuition = higher score
  }));

  const metrics = [
    { key: 'matchScore', label: 'Match', color: 'from-indigo-500 to-indigo-400', icon: Target },
    { key: 'acceptance', label: 'Acceptance', color: 'from-emerald-500 to-emerald-400', icon: Users },
    { key: 'employment', label: 'Employment', color: 'from-purple-500 to-purple-400', icon: Zap },
    { key: 'salary', label: 'Salary', color: 'from-amber-500 to-amber-400', icon: DollarSign },
    { key: 'affordability', label: 'Affordability', color: 'from-rose-500 to-rose-400', icon: Award },
  ];

  // SVG Radar Chart
  const RadarChart = ({ schoolData }: { schoolData: typeof normalizedData[0] }) => {
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const levels = 5;

    const getPoint = (index: number, value: number) => {
      const angle = (index / metrics.length) * Math.PI * 2 - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    const points = metrics.map((_, i) => {
      const value = schoolData[metrics[i].key as keyof typeof schoolData] as number;
      return getPoint(i, value);
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
      <svg width={size} height={size} className="mx-auto">
        {/* Grid circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * radius;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        {metrics.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={pathData}
          fill="rgba(99, 102, 241, 0.1)"
          stroke="rgb(99, 102, 241)"
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="rgb(99, 102, 241)"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {metrics.map((metric, i) => {
          const p = getPoint(i, 120);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.6)"
              fontWeight="300"
            >
              {metric.label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      {/* Radar Charts */}
      {data.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8">
          <h3 className="text-lg font-light text-white mb-8 flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-400" />
            Performance Profile
          </h3>

          <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Math.min(schools.length, 2)}, 1fr)` }}>
            {normalizedData.map((school, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <RadarChart schoolData={school} />
                <h4 className="text-white/90 font-light text-sm mt-6">{school.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards - Clean Comparison */}
      <div className="space-y-4">
        <h3 className="text-lg font-light text-white flex items-center gap-3">
          <Award className="w-5 h-5 text-indigo-400" />
          Metric Breakdown
        </h3>

        {metrics.map((metric) => {
          const Icon = metric.icon;
          const values = data.map(d => d[metric.key as keyof typeof d] as number);
          const maxValue = Math.max(...values);
          const minValue = Math.min(...values);

          return (
            <div key={metric.key} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} opacity-20 flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white/60" />
                </div>
                <h4 className="text-white/90 font-light text-sm">{metric.label}</h4>
              </div>

              <div className="space-y-3">
                {data.map((school, idx) => {
                  const value = values[idx];
                  const isMax = value === maxValue && maxValue > 0;
                  const isMin = value === minValue && minValue > 0;
                  let displayValue = '—';

                  if (metric.key === 'salary') {
                    displayValue = value > 0 ? `$${(value / 1000).toFixed(0)}k` : 'N/A';
                  } else if (metric.key === 'affordability') {
                    // Show actual tuition for affordability
                    const tuition = data[idx].tuition;
                    displayValue = tuition > 0 ? `$${(tuition / 1000).toFixed(0)}k` : 'N/A';
                  } else {
                    displayValue = value > 0 ? `${value}%` : 'N/A';
                  }

                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      isMax ? 'bg-white/[0.08] border border-white/[0.1]' : 'bg-white/[0.02] border border-white/[0.04]'
                    }`}>
                      <span className={`text-sm font-light ${isMax ? 'text-white/90' : 'text-white/60'}`}>
                        {school.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-light ${isMax ? `bg-gradient-to-r ${metric.color} bg-clip-text text-transparent` : 'text-white/70'}`}>
                          {displayValue}
                        </span>
                        {isMax && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      {data.length === 2 && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Better Match', winner: data[0].matchScore > data[1].matchScore ? 0 : 1, metric: 'matchScore', format: (v: number) => `${v}%` },
            { label: 'Easier Entry', winner: data[0].acceptance > data[1].acceptance ? 0 : 1, metric: 'acceptance', format: (v: number) => `${v}%` },
            { label: 'Higher Salary', winner: data[0].salary > data[1].salary ? 0 : 1, metric: 'salary', format: (v: number) => `$${(v / 1000).toFixed(0)}k` },
            { label: 'More Affordable', winner: data[0].tuition < data[1].tuition ? 0 : 1, metric: 'tuition', format: (v: number) => `$${(v / 1000).toFixed(0)}k` },
          ].map((stat, idx) => {
            const winner = data[stat.winner];
            const loser = data[1 - stat.winner];
            const winnerVal = winner[stat.metric as keyof typeof winner] as number;
            const loserVal = loser[stat.metric as keyof typeof loser] as number;

            return (
              <div key={idx} className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-xs text-white/40 font-light mb-3">{stat.label}</p>
                <p className="text-white/90 font-light text-sm mb-1">{winner.name}</p>
                <p className="text-indigo-400 font-light text-lg">{stat.format(winnerVal)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
