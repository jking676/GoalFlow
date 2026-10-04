import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, ClipboardCheck, Save,
  CheckCircle2, Circle, TrendingUp, Minus, ArrowDownRight,
} from 'lucide-react';
import type { AppData, WeeklyReview } from '../types';
import {
  generateId, getCurrentYear, getWeekNumber, getBucketColorClass,
} from '../lib/constants';
import { PageHeader } from './PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { TextArea } from './ui/Field';
import { DynamicIcon } from './ui/DynamicIcon';

interface WeeklyReviewProps {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export function WeeklyReview({ data, setData }: WeeklyReviewProps) {
  const [selectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber());
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const weekCommitments = useMemo(() => {
    return data.commitments.filter(c => c.year === selectedYear && c.weekNumber === selectedWeek);
  }, [data.commitments, selectedYear, selectedWeek]);

  const completedCount = weekCommitments.filter(c => c.isCompleted).length;
  const totalCount = weekCommitments.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const existingReview = useMemo(() => {
    return data.reviews.find(r => r.year === selectedYear && r.weekNumber === selectedWeek);
  }, [data.reviews, selectedYear, selectedWeek]);

  useMemo(() => {
    setReflectionNotes(existingReview?.reflectionNotes ?? '');
    setSaved(false);
  }, [existingReview?.id, selectedWeek, selectedYear]);

  function goToPrevWeek() {
    setSelectedWeek(w => (w === 1 ? 52 : w - 1));
    setSaved(false);
  }

  function goToNextWeek() {
    setSelectedWeek(w => (w === 52 ? 1 : w + 1));
    setSaved(false);
  }

  function handleSave() {
    const review: WeeklyReview = {
      id: existingReview?.id ?? generateId(),
      year: selectedYear,
      weekNumber: selectedWeek,
      completedCount,
      totalCount,
      completionRate,
      reflectionNotes: reflectionNotes.trim(),
      createdAt: existingReview?.createdAt ?? new Date().toISOString(),
    };

    setData(prev => {
      const exists = prev.reviews.some(r => r.id === review.id);
      return {
        ...prev,
        reviews: exists
          ? prev.reviews.map(r => (r.id === review.id ? review : r))
          : [...prev.reviews, review],
      };
    });
    setSaved(true);
  }

  const prevWeekReview = useMemo(() => {
    const prevWeek = selectedWeek === 1 ? 52 : selectedWeek - 1;
    const prevYear = selectedWeek === 1 ? selectedYear - 1 : selectedYear;
    return data.reviews.find(r => r.year === prevYear && r.weekNumber === prevWeek);
  }, [data.reviews, selectedWeek, selectedYear]);

  const trend = prevWeekReview
    ? completionRate - prevWeekReview.completionRate
    : null;

  const commitmentsByBucket = useMemo(() => {
    const map = new Map<string, typeof weekCommitments>();
    for (const c of weekCommitments) {
      const milestone = data.milestones.find(m => m.id === c.monthlyMilestoneId);
      const goal = data.goals.find(g => g.id === milestone?.yearlyGoalId);
      const bucketId = goal?.bucketId ?? 'on-deck';
      const arr = map.get(bucketId) ?? [];
      arr.push(c);
      map.set(bucketId, arr);
    }
    return map;
  }, [weekCommitments, data.milestones, data.goals]);

  const recentReviews = useMemo(() => {
    return [...data.reviews]
      .sort((a, b) => b.year - a.year || b.weekNumber - a.weekNumber)
      .slice(0, 6);
  }, [data.reviews]);

  return (
    <div className="animate-slide-up">
      <PageHeader
        view="review"
        actions={
          <Button variant="primary" onClick={handleSave} disabled={totalCount === 0}>
            <Save className="w-4 h-4" /> {existingReview ? 'Update Review' : 'Save Review'}
          </Button>
        }
      />

      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2">
          <button onClick={goToPrevWeek} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 text-center">
            <p className="text-lg font-semibold text-slate-100">Week {selectedWeek}</p>
            <p className="text-xs text-slate-500">{selectedYear}</p>
          </div>
          <button onClick={goToNextWeek} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> Review saved successfully.
        </div>
      )}

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 mb-4">
            <ClipboardCheck className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No commitments for Week {selectedWeek}</h3>
          <p className="text-sm text-slate-500">Add weekly commitments first, then come back to review.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard label="Completed" value={`${completedCount}/${totalCount}`} color="emerald" icon={CheckCircle2} />
              <SummaryCard label="Completion Rate" value={`${completionRate}%`} color="sky" icon={TrendingUp} />
              <SummaryCard
                label="vs Last Week"
                value={trend !== null ? `${trend > 0 ? '+' : ''}${trend}%` : '—'}
                color={trend === null ? 'slate' : trend > 0 ? 'emerald' : trend < 0 ? 'rose' : 'slate'}
                icon={trend === null ? Minus : trend > 0 ? TrendingUp : ArrowDownRight}
              />
            </div>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Week {selectedWeek} Summary</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ReviewRing percent={completionRate} />
                <div className="flex-1 w-full">
                  <p className="text-sm text-slate-400 mb-3">
                    {completedCount === totalCount
                      ? 'All commitments completed. Outstanding execution.'
                      : completedCount > totalCount / 2
                        ? 'Solid week — majority of commitments delivered.'
                        : completedCount > 0
                          ? 'Some progress made. Identify what blocked the rest.'
                          : 'No commitments completed this week. Reset and recommit.'}
                  </p>

                  <div className="space-y-2">
                    {Array.from(commitmentsByBucket.entries()).map(([bucketId, items]) => {
                      const isOnDeck = bucketId === 'on-deck';
                      const bucket = data.buckets.find(b => b.id === bucketId);
                      const colors = getBucketColorClass(bucket?.color ?? 'sky');
                      const done = items.filter(c => c.isCompleted).length;
                      return (
                        <div key={bucketId} className="flex items-center gap-2">
                          {bucket ? (
                            <span className={`flex items-center justify-center w-6 h-6 rounded-md ${colors.bg} ${colors.border} border shrink-0`}>
                              <DynamicIcon name={bucket.icon} className={`w-3 h-3 ${colors.text}`} />
                            </span>
                          ) : (
                            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 border border-slate-700 shrink-0">
                              <Circle className="w-3 h-3 text-slate-500" />
                            </span>
                          )}
                          <span className="flex-1 text-sm text-slate-300">
                            {isOnDeck ? 'On-Deck' : bucket?.name ?? 'Other'}
                          </span>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {done}/{items.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Commitment Breakdown</h2>
              <div className="space-y-2">
                {weekCommitments.map(c => {
                  const milestone = data.milestones.find(m => m.id === c.monthlyMilestoneId);
                  const goal = data.goals.find(g => g.id === milestone?.yearlyGoalId);
                  const bucket = data.buckets.find(b => b.id === goal?.bucketId);
                  const colors = getBucketColorClass(bucket?.color ?? 'sky');
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                      {c.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                      )}
                      <span className={`flex-1 text-sm ${c.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {c.title}
                      </span>
                      {bucket && (
                        <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Reflection</h2>
              <p className="text-sm text-slate-500 mb-4">What worked? What didn't? What will you change?</p>

              <TextArea
                value={reflectionNotes}
                onChange={e => setReflectionNotes(e.target.value)}
                placeholder="Reflect on your week...&#10;&#10;• What moved the needle?&#10;• What blocked progress?&#10;• What to adjust next week?"
                rows={8}
                className="!bg-slate-800/50"
              />

              {existingReview && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Save className="w-3 h-3" />
                  Last saved {new Date(existingReview.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </section>

            {recentReviews.length > 0 && (
              <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Reviews</h2>
                <div className="space-y-2">
                  {recentReviews.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedWeek(r.weekNumber); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-all text-left"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">Week {r.weekNumber} · {r.year}</p>
                        {r.reflectionNotes && (
                          <p className="text-xs text-slate-600 truncate mt-0.5">{r.reflectionNotes}</p>
                        )}
                      </div>
                      <Badge color={
                        r.completionRate >= 75 ? 'green' :
                        r.completionRate >= 50 ? 'blue' :
                        r.completionRate >= 25 ? 'yellow' : 'red'
                      }>
                        {r.completionRate}%
                      </Badge>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }: {
  label: string;
  value: string;
  color: string;
  icon: typeof TrendingUp;
}) {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    sky: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    slate: { text: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-800' },
  };
  const c = colorMap[color] ?? colorMap.slate;

  return (
    <div className={`bg-slate-900/50 border ${c.border} rounded-2xl p-5`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${c.text}`} />
      </div>
      <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function ReviewRing({ percent }: { percent: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color = percent >= 75 ? '#10b981' : percent >= 50 ? '#0ea5e9' : percent >= 25 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-800" />
        <circle
          cx="56" cy="56" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-slate-100 tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
