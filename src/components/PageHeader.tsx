import type { ViewKey } from '../types';
import { VIEW_LABELS, VIEW_DESCRIPTIONS } from '../lib/constants';

interface PageHeaderProps {
  view: ViewKey;
  actions?: React.ReactNode;
  subtitle?: string;
}

export function PageHeader({ view, actions, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {VIEW_LABELS[view]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle ?? VIEW_DESCRIPTIONS[view]}</p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
