'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Calendar, Clock, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Deadline {
  id: string;
  user_id: string;
  match_id?: string;
  school_name: string;
  application_type: 'Early Decision' | 'Early Action' | 'Regular Decision' | 'Rolling';
  deadline_date: string | null;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';
}

const APP_TYPES = ['Early Decision', 'Early Action', 'Regular Decision', 'Rolling'];
const STATUSES = ['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected'];

export function DeadlinesTracker() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_deadlines')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table user_deadlines is missing. Please run user_deadlines_migration.sql in Supabase SQL Editor.');
      } else {
        console.error('Error fetching deadlines:', error);
      }
    } else if (data) {
      setDeadlines(data);
    }
    setLoading(false);
  };

  const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
    const original = [...deadlines];
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

    const { error } = await supabase
      .from('user_deadlines')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating deadline:', error);
      setDeadlines(original);
    }
  };

  // Helper calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlinesWithDays = deadlines.map(d => {
    let daysRemaining = null;
    if (d.deadline_date) {
      const targetDate = new Date(d.deadline_date);
      // Ensure local timezone doesn't mess up the date calculation
      targetDate.setMinutes(targetDate.getMinutes() + targetDate.getTimezoneOffset());
      daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return { ...d, daysRemaining };
  });

  const sortedDeadlines = [...deadlinesWithDays].sort((a, b) => {
    if (a.daysRemaining === null) return 1;
    if (b.daysRemaining === null) return -1;
    return a.daysRemaining - b.daysRemaining;
  });

  const upcomingDeadlines = sortedDeadlines.filter(d => 
    !['Submitted', 'Accepted', 'Rejected'].includes(d.status) && d.daysRemaining !== null
  );
  const nextDeadline = upcomingDeadlines.length > 0 ? upcomingDeadlines[0] : null;

  const getColorClass = (days: number | null, status: string) => {
    if (['Submitted', 'Accepted', 'Rejected'].includes(status)) return 'bg-white/[0.05] border-white/10 text-white/40';
    if (days === null) return 'bg-white/[0.02] border-white/[0.05] text-white/80';
    if (days < 30) return 'bg-red-500/10 border-red-500/30 text-red-400';
    if (days <= 60) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    return 'bg-green-500/10 border-green-500/30 text-green-400';
  };

  const getProgressWidth = (days: number | null) => {
    if (days === null) return 0;
    // Assume a 120 day tracking period for visual progress
    const MAX_DAYS = 120;
    if (days < 0) return 100;
    if (days > MAX_DAYS) return 0;
    return 100 - ((days / MAX_DAYS) * 100);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ── */}
      {nextDeadline && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-red-400/80 font-bold uppercase tracking-wider mb-1">Your Next Deadline</p>
              <p className="text-lg text-white font-medium">
                {nextDeadline.school_name} {nextDeadline.application_type === 'Regular Decision' ? 'RD' : nextDeadline.application_type === 'Early Action' ? 'EA' : 'ED'} — 
                <span className="font-bold text-red-400 ml-2">{nextDeadline.daysRemaining} days</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Deadlines List ── */}
      {deadlines.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-center">
          <Calendar className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No schools saved yet. Heart a school to add it to your tracker!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDeadlines.map((d) => {
            const isCompleted = ['Submitted', 'Accepted', 'Rejected'].includes(d.status);
            const colorClass = getColorClass(d.daysRemaining, d.status);
            
            return (
              <div key={d.id} className={`border rounded-2xl p-5 transition-all duration-300 ${colorClass.split(' text-')[0]}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: School Name & Tabs */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`text-lg font-medium ${isCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
                        {d.school_name}
                      </h3>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-white/30" />}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {APP_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => updateDeadline(d.id, { application_type: type as any })}
                          className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-medium transition-colors ${
                            d.application_type === type
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Middle: Date & Countdown */}
                  <div className="flex flex-col items-start md:items-center min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 w-full">
                      <Clock className={`w-4 h-4 ${isCompleted ? 'text-white/20' : 'text-white/40'}`} />
                      <input
                        type="date"
                        value={d.deadline_date || ''}
                        onChange={(e) => updateDeadline(d.id, { deadline_date: e.target.value })}
                        className={`bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-white/20 ${isCompleted ? 'text-white/40' : 'text-white/80'}`}
                      />
                    </div>
                    {d.daysRemaining !== null && (
                      <div className="w-full">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={isCompleted ? 'text-white/30' : 'text-white/60'}>
                            {d.daysRemaining < 0 ? 'Past Due' : `${d.daysRemaining} days remaining`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-white/20' : colorClass.includes('red') ? 'bg-red-400' : colorClass.includes('yellow') ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${getProgressWidth(d.daysRemaining)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Status Dropdown */}
                  <div className="relative min-w-[140px]">
                    <select
                      value={d.status}
                      onChange={(e) => updateDeadline(d.id, { status: e.target.value as any })}
                      className={`w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors cursor-pointer ${
                        d.status === 'Accepted' ? 'text-green-400' :
                        d.status === 'Rejected' ? 'text-red-400' :
                        isCompleted ? 'text-white/50' : 'text-white/90'
                      }`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="bg-[#111] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
