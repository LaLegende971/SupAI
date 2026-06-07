interface Props {
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ label, value, color = 'text-white' }: Props) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-md px-4 py-3 min-w-[110px]">
      <p className="text-xs text-white/40 mb-1 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-[22px] font-semibold leading-none ${color}`}>{value}</p>
    </div>
  );
}
