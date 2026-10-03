import type { Bucket, Archetype, ViewKey } from '../types';

export const BUCKET_COLORS: Record<string, { text: string; bg: string; border: string; ring: string; dot: string; gradient: string }> = {
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/20',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-500/0',
  },
  sky: {
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    ring: 'ring-sky-500/20',
    dot: 'bg-sky-500',
    gradient: 'from-sky-500/20 to-sky-500/0',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/20',
    dot: 'bg-amber-500',
    gradient: 'from-amber-500/20 to-amber-500/0',
  },
  rose: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/20',
    dot: 'bg-rose-500',
    gradient: 'from-rose-500/20 to-rose-500/0',
  },
};

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  target_metric: 'Target Metric',
  milestone_project: 'Milestone Project',
  condition_event: 'Condition / Event',
};

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  target_metric: 'A measurable number to hit',
  milestone_project: 'A project with discrete deliverables',
  condition_event: 'A specific event or condition to achieve',
};

export const GOAL_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  recalibrated: 'Recalibrated',
  archived: 'Archived',
};

export const MILESTONE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  missed: 'Missed',
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const VIEW_LABELS: Record<ViewKey, string> = {
  dashboard: 'Dashboard',
  vision: 'Annual Vision',
  milestones: 'Monthly Milestones',
  commitments: 'Weekly Commitments',
  review: 'Weekly Review',
};

export const VIEW_DESCRIPTIONS: Record<ViewKey, string> = {
  dashboard: 'Overview of your goal ecosystem',
  vision: 'Year-level objectives by category',
  milestones: 'Monthly milestones driving your annual goals',
  commitments: 'This week — max 5 active commitments',
  review: 'Reflect on your week and track completion',
};

export function getBucketColorClass(color: string) {
  return BUCKET_COLORS[color] ?? BUCKET_COLORS.sky;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

export function getMonthShort(month: number): string {
  return MONTH_SHORT[month - 1] ?? '';
}

export function formatProgress(current: number, target?: number): string {
  if (target === undefined || target === 0) return `${current}`;
  return `${current} / ${target}`;
}

export function calcPercent(current: number, target?: number): number {
  if (target === undefined || target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export const DEFAULT_BUCKETS: Bucket[] = [
  { id: 'bkt-health', name: 'Health & Vitality', color: 'emerald', icon: 'HeartPulse' },
  { id: 'bkt-craft', name: 'Craft & Projects', color: 'sky', icon: 'Wrench' },
  { id: 'bkt-finance', name: 'Finance & Wealth', color: 'amber', icon: 'TrendingUp' },
  { id: 'bkt-home', name: 'Home & Family', color: 'rose', icon: 'Home' },
  { id: 'bkt-leisure', name: 'Leisure & Growth', color: 'sky', icon: 'BookOpen' },
];

export const LUCIDE_ICONS = [
  'HeartPulse', 'Wrench', 'TrendingUp', 'Home', 'BookOpen',
  'Dumbbell', 'Brain', 'Plane', 'Code2', 'Palette',
  'DollarSign', 'GraduationCap', 'Music', 'Coffee', 'Leaf',
  'Bike', 'PencilRuler', 'Target', 'Briefcase', 'Users',
];
