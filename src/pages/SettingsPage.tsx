import { useState } from 'react';
import { Save } from 'lucide-react';
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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            <Input
              type="url"
              value={settings.serverUrl}
              onChange={(e) => update('serverUrl', e.target.value)}
              placeholder="http://192.168.1.220:8000"
            />
          </Field>
        </Section>

        <Section title="Ollama">
          <Field label="Host Ollama" hint="Adresse du service Ollama">
            <Input
              type="url"
              value={settings.ollamaHost}
              onChange={(e) => update('ollamaHost', e.target.value)}
              placeholder="http://localhost:11434"
            />
          </Field>
          <Field label="Modèle" hint="Nom du modèle à utiliser">
            <Input
              value={settings.ollamaModel}
              onChange={(e) => update('ollamaModel', e.target.value)}
              placeholder="llama3.2"
            />
          </Field>
        </Section>

        <Section title="Rétention des métriques">
          <Field label="Durée de rétention" hint="En jours">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={settings.metricsRetentionDays}
                onChange={(e) => update('metricsRetentionDays', Number(e.target.value))}
                className="w-28"
              />
              <span className="text-sm text-white/30">jours</span>
            </div>
          </Field>
        </Section>

        <Section title="Alertes SMTP">
          <Field label="Alertes activées">
            <button
              onClick={() => update('alertsEnabled', !settings.alertsEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings.alertsEnabled ? 'bg-accent-blue' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.alertsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </Field>
          <Field label="Serveur SMTP">
            <Input
              value={settings.smtpHost}
              onChange={(e) => update('smtpHost', e.target.value)}
              placeholder="smtp.example.com"
            />
          </Field>
          <Field label="Port SMTP">
            <Input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => update('smtpPort', Number(e.target.value))}
              className="w-28"
            />
          </Field>
          <Field label="Utilisateur SMTP">
            <Input
              value={settings.smtpUser}
              onChange={(e) => update('smtpUser', e.target.value)}
              placeholder="alerts@supai.local"
            />
          </Field>
          <Field label="Expéditeur">
            <Input
              value={settings.smtpFrom}
              onChange={(e) => update('smtpFrom', e.target.value)}
              placeholder="SupAI Alerts <alerts@supai.local>"
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}
