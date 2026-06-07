import { useState, useEffect } from 'react';
import { SlidePanel } from '../shared/SlidePanel';
import type { Group } from '../../types';

interface Props {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSave: (data: Omit<Group, 'id' | 'agentIds'>) => Promise<void>;
}

const PRESET_COLORS = [
  '#3fb950', '#378ADD', '#d29922', '#f85149',
  '#a371f7', '#f78166', '#56d364', '#79c0ff',
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-white/40 mb-1.5">{children}</label>;
}

export function GroupFormPanel({ open, group, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setColor(group.color);
    } else {
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
    }
  }, [group, open]);

  async function handleSave() {
    if (!name.trim()) return;
    await onSave({ name: name.trim(), description, color });
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={group ? 'Modifier le groupe' : 'Nouveau groupe'}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 px-5 py-4 space-y-4">
          <div>
            <Label>Nom *</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production"
              className="w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
                focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20"
            />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du groupe…"
              rows={3}
              className="w-full px-3 py-2 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
                focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <Label>Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-9 bg-accent-blue text-white text-sm rounded font-medium
              hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {group ? 'Enregistrer' : 'Créer le groupe'}
          </button>
          <button
            onClick={onClose}
            className="h-9 px-4 border border-white/10 text-sm text-white/50 rounded
              hover:text-white/80 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}
