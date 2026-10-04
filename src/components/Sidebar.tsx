import { Target, LayoutDashboard, Telescope, CalendarRange, ListChecks, ClipboardCheck, Goal } from 'lucide-react';
import type { ViewKey } from '../types';
import { VIEW_LABELS } from '../lib/constants';

interface SidebarProps {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  weeklyProgress: number;
  activeCommitments: number;
}

const NAV_ITEMS: { key: ViewKey; icon: typeof Target; label: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: VIEW_LABELS.dashboard },
  { key: 'vision', icon: Telescope, label: VIEW_LABELS.vision },
  { key: 'milestones', icon: CalendarRange, label: VIEW_LABELS.milestones },
  { key: 'commitments', icon: ListChecks, label: VIEW_LABELS.commitments },
  { key: 'review', icon: ClipboardCheck, label: VIEW_LABELS.review },
];

export function Sidebar({ activeView, onNavigate, weeklyProgress, activeCommitments }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/0 border border-sky-500/30">
          <Goal className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">GoalFlow</h1>
          <p className="text-xs text-slate-500">Executive Goal System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
          const active = activeView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-sky-400' : 'text-slate-500'}`} />
              <span>{label}</span>
              {key === 'commitments' && activeCommitments > 0 && (
                <span className="ml-auto text-xs tabular-nums bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {activeCommitments}/5
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-800/50 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">This Week</span>
            <span className="text-xs tabular-nums text-slate-300">{weeklyProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {activeCommitments} active commitment{activeCommitments !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </aside>
  );
}
