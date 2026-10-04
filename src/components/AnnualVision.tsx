import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Target, Package, Flag } from 'lucide-react';
import type { AppData, YearlyGoal, Archetype, Bucket } from '../types';
import {
  ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, GOAL_STATUS_LABELS,
  calcPercent, formatProgress, getBucketColorClass, generateId, getCurrentYear,
} from '../lib/constants';
import { PageHeader } from './PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { Field, TextInput, TextArea, Select } from './ui/Field';
import { DynamicIcon } from './ui/DynamicIcon';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface AnnualVisionProps {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const ARCHETYPE_ICONS: Record<Archetype, typeof Target> = {
  target_metric: Target,
  milestone_project: Package,
  condition_event: Flag,
};

export function AnnualVision({ data, setData }: AnnualVisionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<YearlyGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterBucket, setFilterBucket] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const year = getCurrentYear();

  const goals = useMemo(() => {
    return data.goals.filter(g => {
      if (filterBucket !== 'all' && g.bucketId !== filterBucket) return false;
      if (filterStatus !== 'all' && g.status !== filterStatus) return false;
      return true;
    });
  }, [data.goals, filterBucket, filterStatus]);

  const goalsByBucket = useMemo(() => {
    const map = new Map<string, YearlyGoal[]>();
    for (const goal of goals) {
      const arr = map.get(goal.bucketId) ?? [];
      arr.push(goal);
      map.set(goal.bucketId, arr);
    }
    return map;
  }, [goals]);

  function openCreate() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function openEdit(goal: YearlyGoal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  function handleSave(goal: YearlyGoal) {
    setData(prev => {
      const exists = prev.goals.some(g => g.id === goal.id);
      return {
        ...prev,
        goals: exists
          ? prev.goals.map(g => (g.id === goal.id ? goal : g))
          : [...prev.goals, goal],
      };
    });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
      milestones: prev.milestones.filter(m => m.yearlyGoalId !== id),
    }));
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        view="vision"
        actions={
          <>
            <Select
              value={filterBucket}
              onChange={e => setFilterBucket(e.target.value)}
              className="!w-auto"
            >
              <option value="all">All Categories</option>
              {data.buckets.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="!w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="recalibrated">Recalibrated</option>
              <option value="archived">Archived</option>
            </Select>
            <Button variant="primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New Goal
            </Button>
          </>
        }
      />

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 mb-4">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No goals yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Define your annual objectives. Each goal belongs to a category and follows an archetype — measurable target, project milestone, or condition event.
          </p>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {data.buckets.map(bucket => {
            const bucketGoals = goalsByBucket.get(bucket.id);
            if (!bucketGoals || bucketGoals.length === 0) return null;
            return (
              <BucketSection
                key={bucket.id}
                bucket={bucket}
                goals={bucketGoals}
                onEdit={openEdit}
                onDelete={setDeleteId}
              />
            );
          })}
        </div>
      )}

      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        goal={editingGoal}
        buckets={data.buckets}
        onSave={handleSave}
        year={year}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Goal"
        message="This goal and all its monthly milestones will be permanently removed. This cannot be undone."
        confirmLabel="Delete Goal"
      />
    </div>
  );
}

function BucketSection({ bucket, goals, onEdit, onDelete }: {
  bucket: Bucket;
  goals: YearlyGoal[];
  onEdit: (g: YearlyGoal) => void;
  onDelete: (id: string) => void;
}) {
  const colors = getBucketColorClass(bucket.color);

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border`}>
          <DynamicIcon name={bucket.icon} className={`w-[18px] h-[18px] ${colors.text}`} />
        </span>
        <h2 className="text-lg font-semibold text-slate-200">{bucket.name}</h2>
        <span className="text-xs text-slate-600">·</span>
        <span className="text-xs text-slate-500">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} bucket={bucket} onEdit={() => onEdit(goal)} onDelete={() => onDelete(goal.id)} />
        ))}
      </div>
    </section>
  );
}

function GoalCard({ goal, bucket, onEdit, onDelete }: {
  goal: YearlyGoal;
  bucket: Bucket;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = getBucketColorClass(bucket.color);
  const pct = calcPercent(goal.currentValue, goal.targetValue);
  const Icon = ARCHETYPE_ICONS[goal.archetype];

  return (
    <div className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
          <Icon className="w-3 h-3" />
          {ARCHETYPE_LABELS[goal.archetype]}
        </span>
      </div>

      <h3 className="text-base font-semibold text-slate-100 mb-1 pr-16">{goal.title}</h3>
      {goal.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{goal.description}</p>}

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">
            {goal.targetValue !== undefined ? `Progress · ${formatProgress(goal.currentValue, goal.targetValue)} ${goal.unit ?? ''}` : 'Project goal'}
          </span>
          <span className={`text-xs font-semibold tabular-nums ${colors.text}`}>{pct}%</span>
        </div>
        <ProgressBar percent={pct} color={bucket.color} size="sm" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
        <Badge color={
          goal.status === 'active' ? 'blue' :
          goal.status === 'completed' ? 'green' :
          goal.status === 'recalibrated' ? 'yellow' : 'slate'
        }>
          {GOAL_STATUS_LABELS[goal.status]}
        </Badge>
        {goal.targetDate && (
          <span className="text-xs text-slate-600">
            Due {new Date(goal.targetDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: YearlyGoal | null;
  buckets: Bucket[];
  onSave: (goal: YearlyGoal) => void;
  year: number;
}

function GoalModal({ open, onClose, goal, buckets, onSave, year }: GoalModalProps) {
  const [form, setForm] = useState<GoalFormData>(() => goal ? {
    bucketId: goal.bucketId,
    title: goal.title,
    description: goal.description ?? '',
    archetype: goal.archetype,
    targetValue: goal.targetValue?.toString() ?? '',
    currentValue: goal.currentValue.toString(),
    unit: goal.unit ?? '',
    status: goal.status,
    targetDate: goal.targetDate ?? '',
  } : {
    bucketId: buckets[0]?.id ?? '',
    title: '',
    description: '',
    archetype: 'target_metric',
    targetValue: '',
    currentValue: '0',
    unit: '',
    status: 'active',
    targetDate: '',
  });

  // Reset form when modal opens
  useMemo(() => {
    if (open) {
      setForm(goal ? {
        bucketId: goal.bucketId,
        title: goal.title,
        description: goal.description ?? '',
        archetype: goal.archetype,
        targetValue: goal.targetValue?.toString() ?? '',
        currentValue: goal.currentValue.toString(),
        unit: goal.unit ?? '',
        status: goal.status,
        targetDate: goal.targetDate ?? '',
      } : {
        bucketId: buckets[0]?.id ?? '',
        title: '',
        description: '',
        archetype: 'target_metric',
        targetValue: '',
        currentValue: '0',
        unit: '',
        status: 'active',
        targetDate: '',
      });
    }
  }, [open, goal, buckets]);

  function update<K extends keyof GoalFormData>(key: K, value: GoalFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.bucketId) return;
    const savedGoal: YearlyGoal = {
      id: goal?.id ?? generateId(),
      bucketId: form.bucketId,
      year: goal?.year ?? year,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      archetype: form.archetype,
      targetValue: form.targetValue ? Number(form.targetValue) : undefined,
      currentValue: Number(form.currentValue) || 0,
      unit: form.unit.trim() || undefined,
      status: form.status,
      targetDate: form.targetDate || undefined,
    };
    onSave(savedGoal);
  }

  const showMetricFields = form.archetype === 'target_metric';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'New Annual Goal'}
      description={goal ? 'Update your objective details' : 'Define a new annual objective'}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>
            {goal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Category">
          <Select value={form.bucketId} onChange={e => update('bucketId', e.target.value)}>
            {buckets.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Goal Title">
          <TextInput
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="e.g. Run a Sub-2 Half Marathon"
            autoFocus
          />
        </Field>

        <Field label="Description" hint="Optional — adds context for this objective">
          <TextArea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="What does success look like?"
            rows={2}
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
          <p className="mt-1.5 text-xs text-slate-500">{ARCHETYPE_DESCRIPTIONS[form.archetype]}</p>
        </div>

        {showMetricFields && (
          <div className="grid grid-cols-3 gap-3">
            <Field label="Target Value">
              <TextInput
                type="number"
                value={form.targetValue}
                onChange={e => update('targetValue', e.target.value)}
                placeholder="100"
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
            <Field label="Unit" hint="e.g. $, lbs, books">
              <TextInput
                value={form.unit}
                onChange={e => update('unit', e.target.value)}
                placeholder="miles"
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={form.status} onChange={e => update('status', e.target.value as YearlyGoal['status'])}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="recalibrated">Recalibrated</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Target Date" hint="Optional deadline">
            <TextInput
              type="date"
              value={form.targetDate}
              onChange={e => update('targetDate', e.target.value)}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

interface GoalFormData {
  bucketId: string;
  title: string;
  description: string;
  archetype: Archetype;
  targetValue: string;
  currentValue: string;
  unit: string;
  status: YearlyGoal['status'];
  targetDate: string;
}
