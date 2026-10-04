import { useMemo } from 'react';
import {
  Target, TrendingUp, CalendarRange, ListChecks,
  CheckCircle2, Circle, ArrowRight, Sparkles, Trophy,
} from 'lucide-react';
import type { AppData, ViewKey } from '../types';
import {
  calcPercent, getBucketColorClass, getMonthName, getCurrentYear, getWeekNumber,
  ARCHETYPE_LABELS, MILESTONE_STATUS_LABELS,
} from '../lib/constants';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { DynamicIcon } from './ui/DynamicIcon';

interface DashboardProps {
  data: AppData;
  onNavigate: (view: ViewKey) => void;
}

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const year = getCurrentYear();
  const week = getWeekNumber();

  const stats = useMemo(() => {
    const activeGoals = data.goals.filter(g => g.status === 'active' && g.year === year);
    const completedGoals = data.goals.filter(g => g.status === 'completed' && g.year === year);
    const currentMilestones = data.milestones.filter(m => m.year === year);
    const currentCommitments = data.commitments.filter(c => c.year === year && c.weekNumber === week);
    const completedCommitments = currentCommitments.filter(c => c.isCompleted);
    const overallProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + calcPercent(g.currentValue, g.targetValue), 0) / activeGoals.length)
      : 0;
    const weeklyRate = currentCommitments.length > 0
      ? Math.round((completedCommitments.length / currentCommitments.length) * 100)
      : 0;

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalMilestones: currentMilestones.length,
      completedMilestones: currentMilestones.filter(m => m.status === 'completed').length,
      weeklyRate,
      weeklyCompleted: completedCommitments.length,
      weeklyTotal: currentCommitments.length,
      overallProgress,
    };
  }, [data, year, week]);

  const topGoals = useMemo(() => {
    return data.goals
      .filter(g => g.status === 'active' && g.year === year)
      .sort((a, b) => calcPercent(b.currentValue, b.targetValue) - calcPercent(a.currentValue, a.targetValue))
      .slice(0, 4);
  }, [data.goals, year]);

  const currentMonthMilestones = useMemo(() => {
    const month = new Date().getMonth() + 1;
    return data.milestones.filter(m => m.year === year && m.month === month).slice(0, 5);
  }, [data.milestones, year]);

  const weekCommitments = useMemo(() => {
    return data.commitments.filter(c => c.year === year && c.weekNumber === week);
  }, [data.commitments, year, week]);

  return (
    <div className="animate-slide-up">
      {/* Hero stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Active Goals"
          value={stats.activeGoals}
          sub={`${stats.completedGoals} completed`}
          color="sky"
          onClick={() => onNavigate('vision')}
        />
        <StatCard
          icon={CalendarRange}
          label="Milestones"
          value={`${stats.completedMilestones}/${stats.totalMilestones}`}
          sub="this year"
          color="amber"
          onClick={() => onNavigate('milestones')}
        />
        <StatCard
          icon={ListChecks}
          label="This Week"
          value={`${stats.weeklyCompleted}/${stats.weeklyTotal}`}
          sub="commitments done"
          color="emerald"
          onClick={() => onNavigate('commitments')}
        />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${stats.overallProgress}%`}
          sub="across all goals"
          color="rose"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top goals */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Goal Progress
              </h2>
              <button
                onClick={() => onNavigate('vision')}
                className="text-sm text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topGoals.length === 0 ? (
              <EmptyState text="No active goals yet. Set your annual vision to get started." />
            ) : (
              <div className="space-y-4">
                {topGoals.map(goal => {
                  const bucket = data.buckets.find(b => b.id === goal.bucketId);
                  const colors = getBucketColorClass(bucket?.color ?? 'sky');
                  const pct = calcPercent(goal.currentValue, goal.targetValue);
                  return (
                    <div
                      key={goal.id}
                      className="group p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                      onClick={() => onNavigate('vision')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          {bucket && (
                            <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border`}>
                              <DynamicIcon name={bucket.icon} className={`w-4 h-4 ${colors.text}`} />
                            </span>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-200">{goal.title}</p>
                            <p className="text-xs text-slate-500">{bucket?.name} · {ARCHETYPE_LABELS[goal.archetype]}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${colors.text}`}>{pct}%</span>
                      </div>
                      <ProgressBar percent={pct} color={bucket?.color} size="sm" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* This week's commitments */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-sky-400" />
                Week {week} Commitments
              </h2>
              <button
                onClick={() => onNavigate('commitments')}
                className="text-sm text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {weekCommitments.length === 0 ? (
              <EmptyState text="No commitments set for this week." />
            ) : (
              <div className="space-y-2">
                {weekCommitments.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800"
                  >
                    {c.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <span className={`text-sm ${c.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly progress ring */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Weekly Pulse
            </h2>
            <div className="flex flex-col items-center">
              <ProgressRing percent={stats.weeklyRate} />
              <p className="mt-4 text-sm text-slate-400 text-center">
                {stats.weeklyCompleted} of {stats.weeklyTotal} commitments completed this week
              </p>
            </div>
          </section>

          {/* Current month milestones */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-amber-400" />
                {getMonthName(new Date().getMonth() + 1)}
              </h2>
              <button
                onClick={() => onNavigate('milestones')}
                className="text-sm text-slate-500 hover:text-sky-400 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {currentMonthMilestones.length === 0 ? (
              <EmptyState text="No milestones this month." />
            ) : (
              <div className="space-y-2.5">
                {currentMonthMilestones.map(m => {
                  const goal = data.goals.find(g => g.id === m.yearlyGoalId);
                  const bucket = data.buckets.find(b => b.id === goal?.bucketId);
                  const colors = getBucketColorClass(bucket?.color ?? 'sky');
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                      <span className="flex-1 text-sm text-slate-300 truncate">{m.title}</span>
                      <Badge color={
                        m.status === 'completed' ? 'green' :
                        m.status === 'in_progress' ? 'blue' :
                        m.status === 'missed' ? 'red' : 'slate'
                      }>
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: typeof Target;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  onClick?: () => void;
}) {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    sky: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };
  const c = colorMap[color] ?? colorMap.sky;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:border-slate-700 transition-all' : ''}`}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} ${c.border} border mb-3`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-600 mt-1">{sub}</p>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-100 tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
