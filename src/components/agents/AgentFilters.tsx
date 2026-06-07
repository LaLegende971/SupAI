import { Search } from 'lucide-react';
import type { AgentStatus } from '../../types';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: AgentStatus | 'all';
  onStatusFilter: (v: AgentStatus | 'all') => void;
}

const STATUS_OPTIONS: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' },
  { value: 'warning', label: 'Avertissement' },
];

export function AgentFilters({ search, onSearch, statusFilter, onStatusFilter }: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Rechercher un hôte…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="h-8 pl-8 pr-3 text-sm bg-bg-tertiary border border-white/10 rounded
            text-white/80 placeholder:text-white/25 focus:outline-none focus:border-accent-blue/60 w-52"
        />
      </div>

      {/* Status filter */}
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusFilter(opt.value)}
            className={`h-8 px-3 text-xs rounded border transition-colors ${
              statusFilter === opt.value
                ? 'border-accent-blue/60 bg-accent-blue/10 text-accent-blue'
                : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
