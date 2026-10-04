interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'subtle' | 'outline';
  className?: string;
}

const SOLID_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500 text-slate-950',
  sky: 'bg-sky-500 text-slate-950',
  amber: 'bg-amber-500 text-slate-950',
  rose: 'bg-rose-500 text-slate-950',
  slate: 'bg-slate-700 text-slate-200',
  green: 'bg-green-500 text-slate-950',
  red: 'bg-red-500 text-slate-950',
  yellow: 'bg-yellow-500 text-slate-950',
};

const SUBTLE_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  slate: 'bg-slate-700/30 text-slate-400 border border-slate-700',
  green: 'bg-green-500/10 text-green-400 border border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border border-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

export function Badge({ children, color = 'slate', variant = 'subtle', className = '' }: BadgeProps) {
  const colorMap = variant === 'solid' ? SOLID_COLORS : SUBTLE_COLORS;
  const classes = colorMap[color] ?? colorMap.slate;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes} ${className}`}
    >
      {children}
    </span>
  );
}
