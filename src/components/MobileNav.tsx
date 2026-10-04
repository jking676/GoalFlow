import { Target, CalendarRange, ListChecks, TrendingUp, ChevronRight } from 'lucide-react';
import type { ViewKey } from '../types';
import { VIEW_LABELS } from '../lib/constants';

interface MobileNavProps {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
}

const NAV_ITEMS: { key: ViewKey; icon: typeof Target }[] = [
  { key: 'dashboard', icon: Target },
  { key: 'vision', icon: TrendingUp },
  { key: 'milestones', icon: CalendarRange },
  { key: 'commitments', icon: ListChecks },
];

export function MobileNav({ activeView, onNavigate }: MobileNavProps) {
  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sky-400" />
          <span className="font-bold text-slate-100 tracking-tight">GoalFlow</span>
        </div>
        <span className="text-xs text-slate-500">{VIEW_LABELS[activeView]}</span>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ key, icon: Icon }) => {
          const active = activeView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{VIEW_LABELS[key].split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => onNavigate('review')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeView === 'review' ? 'text-sky-400' : 'text-slate-500'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
          <span className="text-[10px] font-medium">Review</span>
        </button>
      </nav>
    </>
  );
}
