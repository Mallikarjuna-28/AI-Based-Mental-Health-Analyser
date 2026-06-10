import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Camera, 
  Mic, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  BarChart3, 
  Clipboard, 
  User, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';

export const Sidebar = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Facial Analysis', path: '/facial-analysis', icon: Camera },
    { name: 'Voice Analysis', path: '/voice-analysis', icon: Mic },
    { name: 'Text Analysis', path: '/text-analysis', icon: FileText },
    { name: 'Questionnaire', path: '/questionnaire', icon: ClipboardList },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Final Report', path: '/final-report', icon: Clipboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar} className="no-print">
      {/* Brand Logo Header */}
      <div style={styles.brand}>
        <Activity size={22} color="var(--primary)" />
        <span style={styles.brandText}>HealthAnalyser</span>
      </div>

      {/* Nav Link items */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                borderRadius: isActive ? '0 var(--radius-sm) var(--radius-sm) 0' : 'var(--radius-sm)',
                paddingLeft: isActive ? '11px' : '14px'
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{currentUser?.name || 'User'}</span>
          <span style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: '0',
    top: '0',
    backgroundColor: '#ffffff',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '100',
    padding: 'var(--spacing-md) 0'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: '0 var(--spacing-lg) var(--spacing-md) var(--spacing-lg)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: 'var(--spacing-md)'
  },
  brandText: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  nav: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 var(--spacing-sm)',
    overflowY: 'auto'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.15s ease'
  },
  footer: {
    padding: 'var(--spacing-md) var(--spacing-md) 0 var(--spacing-md)',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  userEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.15s ease'
  }
};
