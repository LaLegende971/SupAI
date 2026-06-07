import { useState } from 'react';
import { Save, Database, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { mockSettings } from '../fixtures/settings';
import type { Settings } from '../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-md p-5">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
      <div>
        <p className="text-sm text-white/70 font-medium">{label}</p>
        {hint && <p className="text-xs text-white/25 mt-0.5">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
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

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        enabled ? 'bg-accent-blue' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

interface PgConfig { host: string; port: number; database: string; user: string; password: string }

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [saved, setSaved] = useState(false);

  // PostgreSQL state
  const [pg, setPg] = useState<PgConfig>({ host: '', port: 5432, database: 'supai', user: 'supai', password: '' });
  const [pgTestStatus, setPgTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [pgTestMsg, setPgTestMsg] = useState('');
  const [migrateStatus, setMigrateStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [migrateMsg, setMigrateMsg] = useState('');
  const [usingPg, setUsingPg] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTestPg() {
    setPgTestStatus('loading');
    setPgTestMsg('');
    // In mock mode, simulate a test
    await new Promise((r) => setTimeout(r, 800));
    if (pg.host && pg.user && pg.database) {
      setPgTestStatus('ok');
      setPgTestMsg('Connexion PostgreSQL réussie');
    } else {
      setPgTestStatus('error');
      setPgTestMsg('Renseignez tous les champs requis');
    }
  }

  async function handleMigrate() {
    if (!confirm('Migrer les données SQLite vers PostgreSQL ? Cette opération est irréversible.')) return;
    setMigrateStatus('loading');
    setMigrateMsg('');
    await new Promise((r) => setTimeout(r, 1500));
    setMigrateStatus('done');
    setMigrateMsg('Migration réussie. Redémarrez le backend pour activer PostgreSQL.');
    setUsingPg(true);
  }

  async function handleDeleteSqlite() {
    if (!confirm('Supprimer définitivement la base SQLite ?')) return;
    await new Promise((r) => setTimeout(r, 500));
    alert('Base SQLite supprimée.');
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Paramètres"
        subtitle="Configuration globale de la plateforme"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs rounded
              font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Save size={12} />
            {saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-w-2xl">
        <Section title="Serveur central">
          <Field label="URL du serveur" hint="Endpoint de l'API FastAPI">
            <Input type="url" value={settings.serverUrl} onChange={(e) => update('serverUrl', e.target.value)} placeholder="http://192.168.1.220:5001" />
          </Field>
        </Section>

        <Section title="Ollama">
          <Field label="Host Ollama">
            <Input type="url" value={settings.ollamaHost} onChange={(e) => update('ollamaHost', e.target.value)} />
          </Field>
          <Field label="Modèle">
            <Input value={settings.ollamaModel} onChange={(e) => update('ollamaModel', e.target.value)} />
          </Field>
        </Section>

        <Section title="Rétention des métriques">
          <Field label="Durée de rétention" hint="En jours">
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={365} value={settings.metricsRetentionDays}
                onChange={(e) => update('metricsRetentionDays', Number(e.target.value))} className="w-28" />
              <span className="text-sm text-white/30">jours</span>
            </div>
          </Field>
        </Section>

        <Section title="Alertes SMTP">
          <Field label="Alertes activées">
            <Toggle enabled={settings.alertsEnabled} onChange={(v) => update('alertsEnabled', v)} />
          </Field>
          <Field label="Serveur SMTP">
            <Input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} />
          </Field>
          <Field label="Port SMTP">
            <Input type="number" value={settings.smtpPort} onChange={(e) => update('smtpPort', Number(e.target.value))} className="w-28" />
          </Field>
          <Field label="Utilisateur SMTP">
            <Input value={settings.smtpUser} onChange={(e) => update('smtpUser', e.target.value)} />
          </Field>
          <Field label="Expéditeur">
            <Input value={settings.smtpFrom} onChange={(e) => update('smtpFrom', e.target.value)} />
          </Field>
        </Section>

        {/* ── PostgreSQL ─────────────────────────────────────────── */}
        <Section title="Base de données">
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-white/30" />
            <span className="text-xs text-white/40">
              {usingPg ? 'PostgreSQL actif' : 'SQLite (défaut)'}
            </span>
            {usingPg && <span className="px-1.5 py-0.5 bg-status-online/10 text-status-online text-[10px] rounded">Actif</span>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-white/35 mb-1">Hôte *</p>
              <Input value={pg.host} onChange={(e) => setPg({ ...pg, host: e.target.value })} placeholder="localhost" />
            </div>
            <div>
              <p className="text-xs text-white/35 mb-1">Port</p>
              <Input type="number" value={pg.port} onChange={(e) => setPg({ ...pg, port: Number(e.target.value) })} className="w-full" />
            </div>
            <div>
              <p className="text-xs text-white/35 mb-1">Base *</p>
              <Input value={pg.database} onChange={(e) => setPg({ ...pg, database: e.target.value })} placeholder="supai" />
            </div>
            <div>
              <p className="text-xs text-white/35 mb-1">Utilisateur *</p>
              <Input value={pg.user} onChange={(e) => setPg({ ...pg, user: e.target.value })} placeholder="supai" />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-white/35 mb-1">Mot de passe</p>
              <Input type="password" value={pg.password} onChange={(e) => setPg({ ...pg, password: e.target.value })} placeholder="••••••••" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleTestPg}
              disabled={pgTestStatus === 'loading'}
              className="flex items-center gap-1.5 h-8 px-3 border border-white/10 text-xs text-white/60
                rounded hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
            >
              {pgTestStatus === 'loading' ? <Loader size={12} className="animate-spin" /> : <Database size={12} />}
              Tester la connexion
            </button>

            {!usingPg && (
              <button
                onClick={handleMigrate}
                disabled={pgTestStatus !== 'ok' || migrateStatus === 'loading'}
                className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs
                  rounded font-medium hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {migrateStatus === 'loading' ? <Loader size={12} className="animate-spin" /> : null}
                Migrer vers PostgreSQL
              </button>
            )}

            {usingPg && (
              <button
                onClick={handleDeleteSqlite}
                className="flex items-center gap-1.5 h-8 px-3 border border-status-offline/30
                  text-xs text-status-offline/70 rounded hover:bg-status-offline/10 transition-colors"
              >
                Supprimer SQLite
              </button>
            )}
          </div>

          {pgTestStatus === 'ok' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-status-online">
              <CheckCircle size={12} /> {pgTestMsg}
            </div>
          )}
          {pgTestStatus === 'error' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-status-offline">
              <AlertTriangle size={12} /> {pgTestMsg}
            </div>
          )}
          {(migrateStatus === 'done' || migrateStatus === 'error') && (
            <div className={`mt-2 text-xs flex items-center gap-2 ${migrateStatus === 'done' ? 'text-status-online' : 'text-status-offline'}`}>
              {migrateStatus === 'done' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              {migrateMsg}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
