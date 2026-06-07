import { useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AGENT_DOWNLOAD_URL = 'https://github.com/LaLegende971/SupAI/releases/latest/download/supai-agent.exe';
const AGENT_FILENAME = 'supai-agent.exe';
import type { Policy, Group, EnrollmentToken } from '../../types';

interface Props {
  policies: Policy[];
  groups: Group[];
  defaultPolicyId?: string;
  onGenerate: (host: string, policyId: string, groupId: string) => Promise<EnrollmentToken>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-white/40 mb-1.5">{children}</label>;
}

function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
        focus:outline-none focus:border-accent-blue/60 ${className}`}
    />
  );
}

export function EnrollmentForm({ policies, groups, defaultPolicyId, onGenerate }: Props) {
  const [host, setHost] = useState('');
  const [policyId, setPolicyId] = useState(defaultPolicyId ?? policies[0]?.id ?? '');
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [token, setToken] = useState<EnrollmentToken | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const psCommand = token
    ? [
        `# Exécuter en tant qu'Administrateur`,
        `Invoke-WebRequest -Uri "${AGENT_DOWNLOAD_URL}" -OutFile "${AGENT_FILENAME}" -UseBasicParsing`,
        `.\\${AGENT_FILENAME} -token "${token.token}" -server "${API_BASE_URL}"`,
      ].join('\n')
    : '';

  async function handleGenerate() {
    if (!host.trim() || !policyId || !groupId) return;
    setLoading(true);
    try {
      const t = await onGenerate(host.trim(), policyId, groupId);
      setToken(t);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(psCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-md p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Générer un token d'enrollment</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <Label>Nom d'hôte *</Label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="SRV-PROD-WEB02"
            className="w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
              focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20"
          />
        </div>
        <div>
          <Label>Groupe</Label>
          <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Politique</Label>
          <Select value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!host.trim() || loading}
        className="h-9 px-5 bg-accent-blue text-white text-sm rounded font-medium
          hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Génération…' : 'Générer le token'}
      </button>

      {token && (
        <div className="mt-5 p-4 bg-bg-tertiary border border-white/10 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wide">Commande PowerShell</p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/10
                rounded text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              {copied ? <Check size={11} className="text-status-online" /> : <ClipboardCopy size={11} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <pre className="text-xs font-mono text-accent-blue/90 whitespace-pre-wrap break-all leading-relaxed">
            {psCommand}
          </pre>
          <p className="mt-3 text-[11px] text-white/25">
            Token valide 24h • usage unique •{' '}
            expire le {new Date(token.expiresAt).toLocaleString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
}
