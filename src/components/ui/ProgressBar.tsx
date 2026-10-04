interface ProgressBarProps {
  percent: number;
  color?: string; // bucket color key
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

export function ProgressBar({ percent, color = 'sky', size = 'md', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const barColor = COLOR_MAP[color] ?? COLOR_MAP.sky;
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-slate-500 text-right tabular-nums">{clamped}%</div>
      )}
    </div>
  );
}
