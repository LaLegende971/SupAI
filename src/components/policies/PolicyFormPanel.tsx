import { useState, useEffect } from 'react';
import { SlidePanel } from '../shared/SlidePanel';
import { AVAILABLE_METRICS } from '../../types';
import type { Policy } from '../../types';

interface Props {
  open: boolean;
  policy: Policy | null;
  onClose: () => void;
  onSave: (data: Omit<Policy, 'id' | 'agentCount'>) => void;
}

const INTERVALS = [
  { value: 10, label: '10 secondes' },
  { value: 30, label: '30 secondes' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
] as const;

const DEFAULT_THRESHOLDS = { CPU: 80, RAM: 85, Disk: 90 };

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-white/40 mb-1.5">{children}</label>;
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
        focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20 ${className}`}
    />
  );
}

export function PolicyFormPanel({ open, policy, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pushInterval, setPushInterval] = useState<10 | 30 | 60 | 300>(30);
  const [metrics, setMetrics] = useState<string[]>(['CPU', 'RAM', 'Disk']);
  const [thresholds, setThresholds] = useState<Record<string, number>>(DEFAULT_THRESHOLDS);

  useEffect(() => {
    if (policy) {
      setName(policy.name);
      setDescription(policy.description);
      setPushInterval(policy.pushInterval);
      setMetrics(policy.metrics);
      setThresholds(policy.thresholds);
    } else {
      setName('');
      setDescription('');
      setPushInterval(30);
      setMetrics(['CPU', 'RAM', 'Disk']);
      setThresholds(DEFAULT_THRESHOLDS);
    }
  }, [policy, open]);

  function toggleMetric(m: string) {
    setMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description, pushInterval, metrics, thresholds });
    onClose();
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={policy ? 'Modifier la politique' : 'Nouvelle politique'}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <Label>Nom *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production Standard" />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la politique…"
              rows={2}
              className="w-full px-3 py-2 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
                focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <Label>Fréquence de push</Label>
            <div className="flex gap-2 flex-wrap">
              {INTERVALS.map((iv) => (
                <button
                  key={iv.value}
                  onClick={() => setPushInterval(iv.value)}
                  className={`h-8 px-3 text-xs rounded border transition-colors ${
                    pushInterval === iv.value
                      ? 'border-accent-blue/60 bg-accent-blue/10 text-accent-blue'
                      : 'border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Métriques à collecter</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_METRICS.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMetric(m)}
                  className={`h-7 px-2.5 text-xs rounded border transition-colors ${
                    metrics.includes(m)
                      ? 'border-accent-blue/60 bg-accent-blue/10 text-accent-blue'
                      : 'border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Seuils d'alerte (%)</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['CPU', 'RAM', 'Disk'] as const).map((key) => (
                <div key={key}>
                  <p className="text-xs text-white/30 mb-1">{key}</p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={thresholds[key] ?? 80}
                    onChange={(e) =>
                      setThresholds((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                  />
                </div>
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
            {policy ? 'Enregistrer' : 'Créer la politique'}
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
