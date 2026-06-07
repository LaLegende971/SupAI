import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Shield, User as UserIcon } from 'lucide-react';
import { listUsers, createUser, updateUser, deleteUser } from '../api/users';
import type { UserOut } from '../api/users';
import { useAuthStore } from '../store/authStore';

type Modal =
  | { type: 'create' }
  | { type: 'edit'; user: UserOut }
  | { type: 'delete'; user: UserOut }
  | null;

function RoleBadge({ role }: { role: string }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent-blue/15 text-accent-blue">
      <Shield size={10} />
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/8 text-white/40">
      <UserIcon size={10} />
      Viewer
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[10px] text-status-online">
      <span className="w-1.5 h-1.5 rounded-full bg-status-online" />
      Actif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] text-status-offline">
      <span className="w-1.5 h-1.5 rounded-full bg-status-offline" />
      Désactivé
    </span>
  );
}

// ── Modal création ──────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserOut) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      const user = await createUser({ username, password, role });
      onCreated(user);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Nouvel utilisateur" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner msg={error} />}
        <Field label="Nom d'utilisateur">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className={inputCls}
          />
        </Field>
        <Field label="Mot de passe">
          <PasswordField value={password} onChange={setPassword} show={showPwd} onToggle={() => setShowPwd(!showPwd)} />
        </Field>
        <Field label="Rôle">
          <RoleSelect value={role} onChange={setRole} />
        </Field>
        <ModalActions onClose={onClose} loading={loading} disabled={!username || !password} label="Créer" />
      </form>
    </ModalShell>
  );
}

// ── Modal édition ───────────────────────────────────────────────────────────
function EditModal({ user, onClose, onUpdated }: { user: UserOut; onClose: () => void; onUpdated: (u: UserOut) => void }) {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<'admin' | 'viewer'>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = user.username === 'admin';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body: { password?: string; role?: 'admin' | 'viewer'; isActive?: boolean } = {};
      if (password) body.password = password;
      if (role !== user.role) body.role = role;
      if (isActive !== user.isActive) body.isActive = isActive;
      const updated = await updateUser(user.id, body);
      onUpdated(updated);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title={`Modifier — ${user.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner msg={error} />}
        <Field label="Nouveau mot de passe (laisser vide = inchangé)">
          <PasswordField value={password} onChange={setPassword} show={showPwd} onToggle={() => setShowPwd(!showPwd)} placeholder="••••••••" />
        </Field>
        <Field label="Rôle">
          <RoleSelect value={role} onChange={setRole} disabled={isAdmin} />
        </Field>
        {!isAdmin && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-accent-blue"
            />
            <span className="text-xs text-white/60">Compte actif</span>
          </label>
        )}
        <ModalActions onClose={onClose} loading={loading} label="Enregistrer" />
      </form>
    </ModalShell>
  );
}

// ── Modal suppression ───────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }: { user: UserOut; onClose: () => void; onDeleted: (id: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteUser(user.id);
      onDeleted(user.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Supprimer l'utilisateur" onClose={onClose}>
      <p className="text-sm text-white/60 mb-6">
        Supprimer <span className="text-white font-medium">{user.username}</span> ? Cette action est irréversible.
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={cancelBtnCls}>Annuler</button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-1.5 rounded text-sm bg-status-offline text-white hover:bg-status-offline/80 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Suppression…' : 'Supprimer'}
        </button>
      </div>
    </ModalShell>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm bg-bg-secondary border border-white/10 rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordField({ value, onChange, show, onToggle, placeholder }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        placeholder={placeholder ?? ''}
        className={`${inputCls} pr-9`}
      />
      <button type="button" onClick={onToggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

function RoleSelect({ value, onChange, disabled }: { value: 'admin' | 'viewer'; onChange: (v: 'admin' | 'viewer') => void; disabled?: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'admin' | 'viewer')}
      disabled={disabled}
      className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <option value="viewer">Viewer — lecture seule</option>
      <option value="admin">Admin — accès complet</option>
    </select>
  );
}

function ModalActions({ onClose, loading, disabled, label }: { onClose: () => void; loading: boolean; disabled?: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onClose} className={cancelBtnCls}>Annuler</button>
      <button type="submit" disabled={loading || disabled} className="px-4 py-1.5 rounded text-sm bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-40 transition-colors">
        {loading ? '…' : label}
      </button>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="px-3 py-2 bg-status-offline/10 border border-status-offline/20 rounded text-xs text-status-offline">
      {msg}
    </div>
  );
}

const inputCls = 'w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80 focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20';
const cancelBtnCls = 'px-4 py-1.5 rounded text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors';

// ── Page principale ─────────────────────────────────────────────────────────
export function UsersPage() {
  const { username: me } = useAuthStore();
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    listUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Utilisateurs</h1>
          <p className="text-xs text-white/30 mt-0.5">{users.length} compte{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'create' })}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-blue text-white text-xs rounded hover:bg-accent-blue/90 transition-colors"
        >
          <Plus size={13} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-xs text-white/30 text-center pt-12">Chargement…</div>
        ) : (
          <div className="bg-bg-secondary border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[11px] text-white/30 font-medium">Utilisateur</th>
                  <th className="px-4 py-3 text-[11px] text-white/30 font-medium">Rôle</th>
                  <th className="px-4 py-3 text-[11px] text-white/30 font-medium">Statut</th>
                  <th className="px-4 py-3 text-[11px] text-white/30 font-medium w-20" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white/80 text-xs font-medium">{u.username}</span>
                      {u.username === me && (
                        <span className="ml-2 text-[10px] text-white/25">(vous)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={u.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'edit', user: u })}
                          title="Modifier"
                          className="text-white/25 hover:text-white/70 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => setModal({ type: 'delete', user: u })}
                            title="Supprimer"
                            className="text-white/25 hover:text-status-offline transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'create' && (
        <CreateModal
          onClose={() => setModal(null)}
          onCreated={(u) => { setUsers((prev) => [...prev, u]); setModal(null); }}
        />
      )}
      {modal?.type === 'edit' && (
        <EditModal
          user={modal.user}
          onClose={() => setModal(null)}
          onUpdated={(u) => { setUsers((prev) => prev.map((x) => x.id === u.id ? u : x)); setModal(null); }}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal
          user={modal.user}
          onClose={() => setModal(null)}
          onDeleted={(id) => { setUsers((prev) => prev.filter((x) => x.id !== id)); setModal(null); }}
        />
      )}
    </div>
  );
}
