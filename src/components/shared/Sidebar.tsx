import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor, Shield, UserPlus, Layers, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboards', icon: LayoutDashboard, label: 'Dashboards' },
  { to: '/agents', icon: Monitor, label: 'Agents' },
  { to: '/policies', icon: Shield, label: 'Politiques' },
  { to: '/enrollment', icon: UserPlus, label: 'Enrollment' },
  { to: '/groups', icon: Layers, label: 'Groupes' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

export function Sidebar() {
  const { username, logout } = useAuthStore();

  return (
    <aside className="w-[200px] shrink-0 bg-bg-secondary border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent-blue flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">SupAI</span>
        </div>
        <p className="text-[10px] text-white/30 mt-0.5 pl-8">Infrastructure Monitor</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-accent-blue bg-accent-blue/10 border-r-2 border-accent-blue'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer : utilisateur + logout */}
      <div className="px-4 py-3 border-t border-white/10">
        {username && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40 truncate">{username}</span>
            <button
              type="button"
              onClick={() => logout()}
              title="Se déconnecter"
              className="text-white/25 hover:text-status-offline transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
        <p className="text-[10px] text-white/20">v1.0.0</p>
      </div>
    </aside>
  );
}
