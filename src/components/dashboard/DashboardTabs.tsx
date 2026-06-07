import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import type { Dashboard } from '../../types';

interface Props {
  dashboards: Dashboard[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export function DashboardTabs({ dashboards, activeId, onSelect, onAdd, onDelete }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreate() {
    const name = newName.trim();
    if (name) { onAdd(name); setNewName(''); }
    setCreating(false);
  }

  return (
    <div className="flex items-center gap-0 border-b border-white/10 px-6 overflow-x-auto shrink-0">
      {dashboards.map((d) => (
        <div
          key={d.id}
          className={`group flex items-center gap-1.5 px-4 py-2.5 cursor-pointer border-b-2 text-sm
            whitespace-nowrap transition-colors ${
              d.id === activeId
                ? 'border-accent-blue text-white font-medium'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          onClick={() => onSelect(d.id)}
        >
          {d.name}
          {dashboards.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(d.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-white/30
                hover:text-status-offline rounded transition-all"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}

      {creating ? (
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Nom du dashboard"
            className="h-7 px-2 text-sm bg-bg-tertiary border border-accent-blue/50 rounded
              text-white/80 placeholder:text-white/20 focus:outline-none w-40"
          />
          <button onClick={handleCreate} className="p-1 text-status-online hover:text-status-online/80">
            <Check size={14} />
          </button>
          <button onClick={() => setCreating(false)} className="p-1 text-white/30 hover:text-white/60">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 px-3 py-2.5 text-white/25 hover:text-white/60
            text-sm transition-colors"
          title="Nouveau dashboard"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
