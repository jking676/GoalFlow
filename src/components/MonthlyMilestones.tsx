import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, CalendarRange, Target, Package, Flag } from 'lucide-react';
import type { AppData, MonthlyMilestone, Archetype } from '../types';
import {
  ARCHETYPE_LABELS, MILESTONE_STATUS_LABELS,
  calcPercent, getBucketColorClass, getMonthName, generateId, getCurrentYear, getCurrentMonth,
} from '../lib/constants';
import { PageHeader } from './PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { Field, TextInput, Select } from './ui/Field';
import { DynamicIcon } from './ui/DynamicIcon';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface MonthlyMilestonesProps {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const ARCHETYPE_ICONS: Record<Archetype, typeof Target> = {
  target_metric: Target,
  milestone_project: Package,
  condition_event: Flag,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'slate',
  in_progress: 'blue',
  completed: 'green',
  missed: 'red',
};

export function MonthlyMilestones({ data, setData }: MonthlyMilestonesProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear] = useState(getCurrentYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MonthlyMilestone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const milestones = useMemo(() => {
    return data.milestones
      .filter(m => m.year === selectedYear && m.month === selectedMonth)
      .sort((a, b) => {
        const order = { in_progress: 0, pending: 1, completed: 2, missed: 3 };
        return order[a.status] - order[b.status];
      });
  }, [data.milestones, selectedYear, selectedMonth]);

  const activeGoals = useMemo(() => {
    return data.goals.filter(g => g.status === 'active' || g.status === 'completed');
  }, [data.goals]);

  function goToPrevMonth() {
    setSelectedMonth(m => (m === 1 ? 12 : m - 1));
  }

  function goToNextMonth() {
    setSelectedMonth(m => (m === 12 ? 1 : m + 1));
  }

  function openCreate() {
    setEditingMilestone(null);
    setModalOpen(true);
  }

  function openEdit(m: MonthlyMilestone) {
    setEditingMilestone(m);
    setModalOpen(true);
  }

  function handleSave(m: MonthlyMilestone) {
    setData(prev => {
      const exists = prev.milestones.some(x => x.id === m.id);
      return {
        ...prev,
        milestones: exists
          ? prev.milestones.map(x => (x.id === m.id ? m : x))
          : [...prev.milestones, m],
      };
    });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id),
      commitments: prev.commitments.map(c =>
        c.monthlyMilestoneId === id ? { ...c, monthlyMilestoneId: undefined } : c
      ),
    }));
  }

  function updateStatus(id: string, status: MonthlyMilestone['status']) {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, status } : m),
    }));
  }

  function updateProgress(id: string, currentValue: number) {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === id ? { ...m, currentValue } : m
      ),
    }));
  }

  const monthStats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    const missed = milestones.filter(m => m.status === 'missed').length;
    return { total, completed, inProgress, missed };
  }, [milestones]);

  return (
    <div className="animate-slide-up">
      <PageHeader
        view="milestones"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Milestone
          </Button>
        }
      />

      {/* Month selector */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2">
          <button onClick={goToPrevMonth} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 text-center">
            <p className="text-lg font-semibold text-slate-100">{getMonthName(selectedMonth)}</p>
            <p className="text-xs text-slate-500">{selectedYear}</p>
          </div>
          <button onClick={goToNextMonth} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MiniStat label="Total" value={monthStats.total} color="text-slate-300" />
        <MiniStat label="In Progress" value={monthStats.inProgress} color="text-sky-400" />
        <MiniStat label="Completed" value={monthStats.completed} color="text-emerald-400" />
        <MiniStat label="Missed" value={monthStats.missed} color="text-rose-400" />
      </div>

      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 mb-4">
            <CalendarRange className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No milestones for {getMonthName(selectedMonth)}</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Break your annual goals into monthly milestones. Each milestone is a concrete step that moves the needle on a yearly objective.
          </p>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map(m => {
            const goal = data.goals.find(g => g.id === m.yearlyGoalId);
            const bucket = data.buckets.find(b => b.id === goal?.bucketId);
            const colors = getBucketColorClass(bucket?.color ?? 'sky');
            const Icon = ARCHETYPE_ICONS[m.archetype];
            const pct = calcPercent(m.currentValue, m.targetValue);

            return (
              <div
                key={m.id}
                className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Bucket icon */}
                  {bucket && (
                    <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border shrink-0`}>
                      <DynamicIcon name={bucket.icon} className={`w-5 h-5 ${colors.text}`} />
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">{m.title}</h3>
                        {goal && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Linked to: <span className={colors.text}>{goal.title}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          value={m.status}
                          onChange={e => updateStatus(m.id, e.target.value as MonthlyMilestone['status'])}
                          className="!w-auto !py-1 !text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="missed">Missed</option>
                        </Select>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(m)} className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress section */}
                    {m.targetValue !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar percent={pct} color={bucket?.color} size="sm" />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                            {m.currentValue} / {m.targetValue} {goal?.unit ?? ''}
                          </span>
                          {m.status !== 'completed' && (
                            <input
                              type="number"
                              value={m.currentValue}
                              onChange={e => updateProgress(m.id, Number(e.target.value))}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                              title="Update current value"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Badge color={bucket?.color ?? 'slate'}>
                        <Icon className="w-3 h-3" />
                        {ARCHETYPE_LABELS[m.archetype]}
                      </Badge>
                      <Badge color={STATUS_COLORS[m.status]}>
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MilestoneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        milestone={editingMilestone}
        goals={activeGoals}
        buckets={data.buckets}
        month={selectedMonth}
        year={selectedYear}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Milestone"
        message="This milestone will be permanently removed. Linked weekly commitments will become unlinked (On-Deck)."
        confirmLabel="Delete Milestone"
      />
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

interface MilestoneModalProps {
  open: boolean;
  onClose: () => void;
  milestone: MonthlyMilestone | null;
  goals: { id: string; title: string; bucketId: string; unit?: string; archetype: Archetype }[];
  buckets: AppData['buckets'];
  month: number;
  year: number;
  onSave: (m: MonthlyMilestone) => void;
}

function MilestoneModal({ open, onClose, milestone, goals, buckets, month, year, onSave }: MilestoneModalProps) {
  const [form, setForm] = useState<MilestoneFormData>(() => getInitialForm(milestone, goals, month, year));

  useMemo(() => {
    if (open) {
      setForm(getInitialForm(milestone, goals, month, year));
    }
  }, [open, milestone, goals, month, year]);

  function update<K extends keyof MilestoneFormData>(key: K, value: MilestoneFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.yearlyGoalId) return;
    const saved: MonthlyMilestone = {
      id: milestone?.id ?? generateId(),
      yearlyGoalId: form.yearlyGoalId,
      year,
      month,
      title: form.title.trim(),
      archetype: form.archetype,
      targetValue: form.targetValue ? Number(form.targetValue) : undefined,
      currentValue: Number(form.currentValue) || 0,
      status: form.status,
    };
    onSave(saved);
  }

  const selectedGoal = goals.find(g => g.id === form.yearlyGoalId);
  const selectedBucket = buckets.find(b => b.id === selectedGoal?.bucketId);
  const colors = getBucketColorClass(selectedBucket?.color ?? 'sky');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'New Monthly Milestone'}
      description={`${getMonthName(month)} ${year}`}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim() || !form.yearlyGoalId}>
            {milestone ? 'Save Changes' : 'Create Milestone'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Linked Annual Goal">
          <Select value={form.yearlyGoalId} onChange={e => update('yearlyGoalId', e.target.value)}>
            <option value="">Select a goal...</option>
            {goals.map(g => {
              const bucket = buckets.find(b => b.id === g.bucketId);
              return (
                <option key={g.id} value={g.id}>
                  {bucket?.name} — {g.title}
                </option>
              );
            })}
          </Select>
        </Field>

        {selectedGoal && (
          <div className={`flex items-center gap-2 p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
            <DynamicIcon name={selectedBucket?.icon ?? 'Target'} className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-sm ${colors.text}`}>{selectedGoal.title}</span>
          </div>
        )}

        <Field label="Milestone Title">
          <TextInput
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="e.g. Hit 10-mile long run"
            autoFocus
          />
        </Field>

        <div>
          <span className="block text-sm font-medium text-slate-300 mb-1.5">Archetype</span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ARCHETYPE_LABELS) as Archetype[]).map(key => {
              const Icon = ARCHETYPE_ICONS[key];
              const active = form.archetype === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('archetype', key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {ARCHETYPE_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        {form.archetype === 'target_metric' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Value">
              <TextInput
                type="number"
                value={form.targetValue}
                onChange={e => update('targetValue', e.target.value)}
                placeholder="10"
              />
            </Field>
            <Field label="Current Value">
              <TextInput
                type="number"
                value={form.currentValue}
                onChange={e => update('currentValue', e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
        )}

        <Field label="Status">
          <Select value={form.status} onChange={e => update('status', e.target.value as MonthlyMilestone['status'])}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

interface MilestoneFormData {
  yearlyGoalId: string;
  title: string;
  archetype: Archetype;
  targetValue: string;
  currentValue: string;
  status: MonthlyMilestone['status'];
}

function getInitialForm(milestone: MonthlyMilestone | null, goals: { id: string }[], month: number, year: number): MilestoneFormData {
  void month; void year;
  if (milestone) {
    return {
      yearlyGoalId: milestone.yearlyGoalId,
      title: milestone.title,
      archetype: milestone.archetype,
      targetValue: milestone.targetValue?.toString() ?? '',
      currentValue: milestone.currentValue.toString(),
      status: milestone.status,
    };
  }
  return {
    yearlyGoalId: goals[0]?.id ?? '',
    title: '',
    archetype: 'target_metric',
    targetValue: '',
    currentValue: '0',
    status: 'pending',
  };
}
