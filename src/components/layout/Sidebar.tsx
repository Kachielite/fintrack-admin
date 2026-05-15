import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.state';
import {
  LayoutDashboard,
  Code2,
  Mail,
  Receipt,
  Users,
  Sparkles,
  LogOut,
} from 'lucide-react';

const NAV = [
  { to: '/',             label: 'Overview',     Icon: LayoutDashboard },
  { to: '/regex',        label: 'Regex Engine',  Icon: Code2 },
  { to: '/ingestion',    label: 'Ingestion',     Icon: Mail },
  { to: '/transactions', label: 'Transactions',  Icon: Receipt },
  { to: '/users',        label: 'Users',         Icon: Users },
  { to: '/ai',           label: 'AI Usage',      Icon: Sparkles },
];

export function Sidebar() {
  const { email, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">F</div>
        <div className="sidebar-wordmark">FinTrack</div>
        <div className="sidebar-chip">ADMIN</div>
      </div>
      <div className="sidebar-divider" />
      <nav className="sidebar-nav">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">
              <Icon size={16} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-divider" />
      <div className="sidebar-footer">
        <div className="sidebar-account">{email}</div>
        <button className="signout-btn" onClick={handleSignOut}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
