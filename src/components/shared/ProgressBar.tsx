interface Props {
  value: number;
  showLabel?: boolean;
}

function getColor(value: number) {
  if (value >= 85) return 'bg-status-offline';
  if (value >= 70) return 'bg-status-warning';
  return 'bg-accent-blue';
}

export function ProgressBar({ value, showLabel = true }: Props) {
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      {showLabel && (
        <span className="text-xs font-medium text-white/80">{value.toFixed(0)}%</span>
      )}
      <div className="h-[5px] w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor(value)}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
