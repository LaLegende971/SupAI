import { RefreshCw, FileText, Shield, Trash2 } from 'lucide-react';
import { SlidePanel } from '../shared/SlidePanel';
import { StatusBadge } from '../shared/StatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import type { Agent, Policy, Group } from '../../types';

interface Props {
  agent: Agent | null;
  policies: Policy[];
  groups: Group[];
  onClose: () => void;
  onRestart?: (agent: Agent) => void;
  onUnenroll?: (agent: Agent) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-white/[0.05]">
      <span className="text-xs text-white/35 shrink-0">{label}</span>
      <span className="text-xs text-white/80 text-right ml-4 font-medium">{value}</span>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bg-tertiary border border-white/10 rounded p-3">
      <p className="text-xs text-white/35 mb-2 uppercase tracking-wide">{label}</p>
      <ProgressBar value={value} />
    </div>
  );
}

export function AgentDetailPanel({ agent, policies, groups, onClose, onRestart, onUnenroll }: Props) {
  const policy = policies.find((p) => p.id === agent?.policyId);
  const group = groups.find((g) => g.id === agent?.groupId);

  return (
    <SlidePanel
      open={!!agent}
      onClose={onClose}
      title={agent?.host ?? ''}
      subtitle={agent?.ip}
      width={440}
    >
      {agent && (
        <div className="flex flex-col h-full">
          {/* Status + OS */}
          <div className="px-5 pt-4 pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={agent.status} />
              <span className="text-xs text-white/30">{agent.os}</span>
            </div>

            {/* Info rows */}
            <div>
              <InfoRow label="Groupe" value={
                group ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                    {group.name}
                  </span>
                ) : '—'
              } />
              <InfoRow label="Politique" value={policy?.name ?? '—'} />
              <InfoRow label="Version agent" value={`v${agent.version}`} />
              <InfoRow label="Uptime" value={agent.uptime} />
              <InfoRow label="Dernier push" value={
                agent.status === 'offline'
                  ? <span className="text-status-offline/70">Hors ligne</span>
                  : new Date(agent.lastPush).toLocaleString('fr-FR')
              } />
            </div>
          </div>

          {/* Métriques temps réel */}
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-3">
              Métriques temps réel
            </p>
            {agent.status === 'offline' ? (
              <p className="text-xs text-white/25 text-center py-4">Agent hors ligne</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <MetricBlock label="CPU" value={agent.cpu} />
                <MetricBlock label="RAM" value={agent.ram} />
                <MetricBlock label="Disk" value={agent.disk} />
              </div>
            )}
          </div>

          {/* Services */}
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-3">
              Services surveillés
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agent.services.map((svc) => (
                <span
                  key={svc}
                  className="px-2 py-0.5 bg-bg-tertiary border border-white/10 rounded text-xs text-white/60"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          {(onRestart || onUnenroll) && (
            <div className="px-5 py-4 mt-auto">
              <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {onRestart && (
                  <button
                    onClick={() => onRestart(agent)}
                    disabled={agent.status === 'offline'}
                    className="flex items-center justify-center gap-2 h-9 px-3 border border-white/10
                      text-sm text-white/70 rounded hover:bg-white/5 hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw size={13} />
                    Redémarrer
                  </button>
                )}
                <button
                  disabled
                  title="Bientôt disponible"
                  className="flex items-center justify-center gap-2 h-9 px-3 border border-white/10
                    text-sm text-white/30 rounded cursor-not-allowed opacity-40"
                >
                  <FileText size={13} />
                  Voir logs
                </button>
                <button
                  disabled
                  title="Bientôt disponible"
                  className="flex items-center justify-center gap-2 h-9 px-3 border border-white/10
                    text-sm text-white/30 rounded cursor-not-allowed opacity-40"
                >
                  <Shield size={13} />
                  Changer politique
                </button>
                {onUnenroll && (
                  <button
                    onClick={() => onUnenroll(agent)}
                    className="flex items-center justify-center gap-2 h-9 px-3 border border-status-offline/30
                      text-sm text-status-offline/70 rounded hover:bg-status-offline/10 hover:text-status-offline
                      transition-colors"
                  >
                    <Trash2 size={13} />
                    Désinscrire
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </SlidePanel>
  );
}
