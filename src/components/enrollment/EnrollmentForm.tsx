import { useState } from 'react';
import { ClipboardCopy, Check, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { regeneratePolicyToken } from '../../api/enrollment';
import { useAuthStore } from '../../store/authStore';
import type { Policy } from '../../types';

const AGENT_DOWNLOAD_URL = 'https://github.com/LaLegende971/SupAI/releases/latest/download/supai-agent.exe';
const AGENT_FILENAME = 'supai-agent.exe';

function psCommand(token: string) {
  return [
    `# Exécuter en tant qu'Administrateur`,
    `Invoke-WebRequest -Uri "${AGENT_DOWNLOAD_URL}" -OutFile "${AGENT_FILENAME}" -UseBasicParsing`,
    `.\\${AGENT_FILENAME} -token "${token}" -server "${API_BASE_URL}"`,
  ].join('\n');
}

function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1 border border-white/10 rounded text-white/50
        hover:text-white hover:border-white/20 transition-colors
        ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
    >
      {copied ? <Check size={10} className="text-status-online" /> : <ClipboardCopy size={10} />}
      {copied ? 'Copié' : 'Copier'}
    </button>
  );
}

interface Props {
  policies: Policy[];
  onPolicyUpdated: (policy: Policy) => void;
}

export function EnrollmentForm({ policies, onPolicyUpdated }: Props) {
  const isAdmin = useAuthStore((s) => s.role === 'admin');
  const [regenerating, setRegenerating] = useState<string | null>(null);

  async function handleRegenerate(policy: Policy) {
    if (!confirm(`Régénérer le token de "${policy.name}" ? L'ancien token sera invalide.`)) return;
    setRegenerating(policy.id);
    try {
      const updated = await regeneratePolicyToken(policy.id);
      onPolicyUpdated(updated);
    } finally {
      setRegenerating(null);
    }
  }

  if (policies.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-white/30">
        Aucune politique — créez-en une d'abord.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {policies.map((policy) => {
        const cmd = psCommand(policy.enrollmentToken);
        return (
          <div key={policy.id} className="bg-bg-secondary border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white">{policy.name}</p>
                {policy.description && (
                  <p className="text-xs text-white/30 mt-0.5">{policy.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-online" />
                {policy.agentCount} agent{policy.agentCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Token */}
            <div className="bg-bg-tertiary border border-white/[0.06] rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-wide">Token permanent</span>
                <div className="flex items-center gap-1.5">
                  <CopyBtn text={policy.enrollmentToken} small />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRegenerate(policy)}
                      disabled={regenerating === policy.id}
                      title="Régénérer le token"
                      className="inline-flex items-center gap-1 px-2 py-0.5 border border-white/10 rounded
                        text-[10px] text-white/40 hover:text-status-warning hover:border-status-warning/30
                        disabled:opacity-40 transition-colors"
                    >
                      <RefreshCw size={9} className={regenerating === policy.id ? 'animate-spin' : ''} />
                      Régénérer
                    </button>
                  )}
                </div>
              </div>
              <code className="text-xs font-mono text-accent-blue/80 break-all">
                {policy.enrollmentToken}
              </code>
            </div>

            {/* Commande PowerShell */}
            <div className="bg-bg-tertiary border border-white/[0.06] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-wide">Commande PowerShell</span>
                <CopyBtn text={cmd} small />
              </div>
              <pre className="text-[11px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed">
                {cmd}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
