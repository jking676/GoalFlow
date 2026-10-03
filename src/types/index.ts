export type Archetype = 'target_metric' | 'milestone_project' | 'condition_event';

export type ViewKey = 'dashboard' | 'vision' | 'milestones' | 'commitments' | 'review';

export interface Bucket {
  id: string;
  name: string;
  color: string; // emerald | sky | amber | rose
  icon: string; // lucide icon name
}

export interface YearlyGoal {
  id: string;
  bucketId: string;
  year: number;
  title: string;
  description?: string;
  archetype: Archetype;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  status: 'active' | 'completed' | 'recalibrated' | 'archived';
  targetDate?: string;
}

export interface MonthlyMilestone {
  id: string;
  yearlyGoalId: string;
  year: number;
  month: number; // 1 - 12
  title: string;
  archetype: Archetype;
  targetValue?: number;
  currentValue: number;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
}

export interface WeeklyCommitment {
  id: string;
  monthlyMilestoneId?: string;
  year: number;
  weekNumber: number; // 1 - 52
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WeeklyReview {
  id: string;
  year: number;
  weekNumber: number;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  reflectionNotes: string;
  createdAt: string;
}

export interface AppData {
  buckets: Bucket[];
  goals: YearlyGoal[];
  milestones: MonthlyMilestone[];
  commitments: WeeklyCommitment[];
  reviews: WeeklyReview[];
}
