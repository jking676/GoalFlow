import { useState, useMemo } from 'react';
import {
  Plus, Trash2, CheckCircle2, Circle, Link2, Unlink, ListChecks,
  ChevronLeft, ChevronRight, AlertTriangle, StickyNote,
} from 'lucide-react';
import type { AppData, WeeklyCommitment } from '../types';
import {
  getBucketColorClass, generateId, getCurrentYear, getWeekNumber,
} from '../lib/constants';
import { PageHeader } from './PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Field, TextInput, TextArea, Select } from './ui/Field';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { DynamicIcon } from './ui/DynamicIcon';

interface WeeklyCommitmentsProps {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const MAX_ACTIVE = 5;

export function WeeklyCommitments({ data, setData }: WeeklyCommitmentsProps) {
  const [selectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<WeeklyCommitment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const commitments = useMemo(() => {
    return data.commitments
      .filter(c => c.year === selectedYear && c.weekNumber === selectedWeek)
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return 0;
      });
  }, [data.commitments, selectedYear, selectedWeek]);

  const activeCommitments = commitments.filter(c => !c.isCompleted);
  const completedCommitments = commitments.filter(c => c.isCompleted);
  const canAddMore = activeCommitments.length < MAX_ACTIVE;
  const completionRate = commitments.length > 0
    ? Math.round((completedCommitments.length / commitments.length) * 100)
    : 0;

  const currentMonth = useMemo(() => {
    const date = new Date();
    const month = date.getMonth() + 1;
    return month;
  }, []);

  const availableMilestones = useMemo(() => {
    return data.milestones.filter(m =>
      m.year === selectedYear &&
      m.status !== 'completed' &&
      m.status !== 'missed'
    );
  }, [data.milestones, selectedYear]);

  function goToPrevWeek() {
    setSelectedWeek(w => (w === 1 ? 52 : w - 1));
  }

  function goToNextWeek() {
    setSelectedWeek(w => (w === 52 ? 1 : w + 1));
  }

  function toggleComplete(id: string) {
    setData(prev => ({
      ...prev,
      commitments: prev.commitments.map(c =>
        c.id === id
          ? { ...c, isCompleted: !c.isCompleted, completedAt: !c.isCompleted ? new Date().toISOString() : undefined }
          : c
      ),
    }));
  }

  function openCreate() {
    setEditingCommitment(null);
    setModalOpen(true);
  }

  function openEdit(c: WeeklyCommitment) {
    setEditingCommitment(c);
    setModalOpen(true);
  }

  function handleSave(c: WeeklyCommitment) {
    setData(prev => {
      const exists = prev.commitments.some(x => x.id === c.id);
      return {
        ...prev,
        commitments: exists
          ? prev.commitments.map(x => (x.id === c.id ? c : x))
          : [...prev.commitments, c],
      };
    });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setData(prev => ({
      ...prev,
      commitments: prev.commitments.filter(c => c.id !== id),
    }));
  }

  function unlinkCommitment(id: string) {
    setData(prev => ({
      ...prev,
      commitments: prev.commitments.map(c =>
        c.id === id ? { ...c, monthlyMilestoneId: undefined } : c
      ),
    }));
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        view="commitments"
        subtitle={`Maximum ${MAX_ACTIVE} active commitments — focus deeply, execute fully`}
        actions={
          <Button variant="primary" onClick={openCreate} disabled={!canAddMore && editingCommitment === null}>
            <Plus className="w-4 h-4" /> New Commitment
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2">
          <button onClick={goToPrevWeek} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-center">
            <p className="text-sm font-semibold text-slate-100">Week {selectedWeek}</p>
            <p className="text-xs text-slate-500">{selectedYear}</p>
          </div>
          <button onClick={goToNextWeek} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-400">
              {completedCommitments.length} / {commitments.length} completed
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-300">{completionRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {!canAddMore && (
        <div className="flex items-center gap-3 mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            You've reached the maximum of {MAX_ACTIVE} active commitments. Complete or remove one to add a new commitment.
          </p>
        </div>
      )}

      {commitments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 mb-4">
            <ListChecks className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No commitments for Week {selectedWeek}</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Choose up to {MAX_ACTIVE} things you will absolutely get done this week. Link them to a monthly milestone, or leave them "On-Deck" for flexibility.
          </p>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Your First Commitment
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeCommitments.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                Active · {activeCommitments.length}/{MAX_ACTIVE}
              </h2>
              <div className="space-y-2.5">
                {activeCommitments.map(c => (
                  <CommitmentRow
                    key={c.id}
                    commitment={c}
                    data={data}
                    onToggle={() => toggleComplete(c.id)}
                    onEdit={() => openEdit(c)}
                    onDelete={() => setDeleteId(c.id)}
                    onUnlink={() => unlinkCommitment(c.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {completedCommitments.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                Completed · {completedCommitments.length}
              </h2>
              <div className="space-y-2.5">
                {completedCommitments.map(c => (
                  <CommitmentRow
                    key={c.id}
                    commitment={c}
                    data={data}
                    onToggle={() => toggleComplete(c.id)}
                    onEdit={() => openEdit(c)}
                    onDelete={() => setDeleteId(c.id)}
                    onUnlink={() => unlinkCommitment(c.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CommitmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        commitment={editingCommitment}
        milestones={availableMilestones}
        goals={data.goals}
        buckets={data.buckets}
        week={selectedWeek}
        year={selectedYear}
        onSave={handleSave}
        currentMonth={currentMonth}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Commitment"
        message="This commitment will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

function CommitmentRow({ commitment, data, onToggle, onEdit, onDelete, onUnlink }: {
  commitment: WeeklyCommitment;
  data: AppData;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUnlink: () => void;
}) {
  const milestone = data.milestones.find(m => m.id === commitment.monthlyMilestoneId);
  const goal = data.goals.find(g => g.id === milestone?.yearlyGoalId);
  const bucket = data.buckets.find(b => b.id === goal?.bucketId);
  const colors = getBucketColorClass(bucket?.color ?? 'sky');

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
        commitment.isCompleted
          ? 'bg-slate-900/30 border-slate-800/50'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      <button
        onClick={onToggle}
        className={`mt-0.5 shrink-0 transition-all ${
          commitment.isCompleted
            ? 'text-emerald-400 hover:text-emerald-300'
            : 'text-slate-600 hover:text-slate-400'
        }`}
      >
        {commitment.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0" onClick={onEdit} role="button" tabIndex={-1}>
        <p className={`text-sm font-medium ${commitment.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
          {commitment.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {milestone && bucket ? (
            <span className={`inline-flex items-center gap-1 text-xs ${colors.text}`}>
              <DynamicIcon name={bucket.icon} className="w-3 h-3" />
              {bucket.name} → {milestone.title}
            </span>
          ) : (
            <Badge color="slate">On-Deck</Badge>
          )}
          {commitment.notes && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <StickyNote className="w-3 h-3" /> {commitment.notes}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {commitment.monthlyMilestoneId && (
          <button
            onClick={onUnlink}
            title="Unlink from milestone"
            className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface CommitmentModalProps {
  open: boolean;
  onClose: () => void;
  commitment: WeeklyCommitment | null;
  milestones: { id: string; title: string; yearlyGoalId: string }[];
  goals: { id: string; title: string; bucketId: string }[];
  buckets: AppData['buckets'];
  week: number;
  year: number;
  onSave: (c: WeeklyCommitment) => void;
  currentMonth: number;
}

function CommitmentModal({ open, onClose, commitment, milestones, goals, buckets, week, year, onSave, currentMonth }: CommitmentModalProps) {
  const [form, setForm] = useState<CommitmentFormData>(() => getInitialForm(commitment));

  useMemo(() => {
    if (open) setForm(getInitialForm(commitment));
  }, [open, commitment]);

  function update<K extends keyof CommitmentFormData>(key: K, value: CommitmentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    const saved: WeeklyCommitment = {
      id: commitment?.id ?? generateId(),
      monthlyMilestoneId: form.monthlyMilestoneId || undefined,
      year,
      weekNumber: week,
      title: form.title.trim(),
      isCompleted: commitment?.isCompleted ?? false,
      completedAt: commitment?.completedAt,
      notes: form.notes.trim() || undefined,
    };
    onSave(saved);
  }

  const relevantMilestones = milestones.filter(m => {
    const goal = goals.find(g => g.id === m.yearlyGoalId);
    void currentMonth;
    return goal !== undefined;
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={commitment ? 'Edit Commitment' : 'New Weekly Commitment'}
      description={`Week ${week} · ${year}`}
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>
            {commitment ? 'Save Changes' : 'Add Commitment'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="What will you commit to?">
          <TextInput
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="e.g. Complete a 9-mile long run"
            autoFocus
          />
        </Field>

        <Field label="Link to Milestone" hint="Optional — leave unlinked for an On-Deck commitment">
          <Select
            value={form.monthlyMilestoneId}
            onChange={e => update('monthlyMilestoneId', e.target.value)}
          >
            <option value="">On-Deck (no link)</option>
            {relevantMilestones.map(m => {
              const goal = goals.find(g => g.id === m.yearlyGoalId);
              const bucket = buckets.find(b => b.id === goal?.bucketId);
              return (
                <option key={m.id} value={m.id}>
                  {bucket?.name} — {m.title}
                </option>
              );
            })}
          </Select>
        </Field>

        {form.monthlyMilestoneId && (
          <div className="flex items-center gap-2 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
            <Link2 className="w-4 h-4 text-sky-400" />
            <span className="text-sm text-sky-300">
              Linked to milestone
            </span>
          </div>
        )}

        <Field label="Notes" hint="Optional — any context or sub-tasks">
          <TextArea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Additional context..."
            rows={2}
          />
        </Field>
      </div>
    </Modal>
  );
}

interface CommitmentFormData {
  title: string;
  monthlyMilestoneId: string;
  notes: string;
}

function getInitialForm(commitment: WeeklyCommitment | null): CommitmentFormData {
  if (commitment) {
    return {
      title: commitment.title,
      monthlyMilestoneId: commitment.monthlyMilestoneId ?? '',
      notes: commitment.notes ?? '',
    };
  }
  return { title: '', monthlyMilestoneId: '', notes: '' };
}
