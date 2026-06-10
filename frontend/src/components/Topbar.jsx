import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Topbar = ({ title }) => {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Ready for your daily questionnaire?", time: "2h ago" },
    { id: 2, text: "New mental health report generated.", time: "1d ago" },
    { id: 3, text: "Tip: Practice 5-minute deep breathing.", time: "2d ago" },
  ];

  return (
    <header style={styles.header} className="no-print">
      {/* Title */}
      <h2 style={styles.title}>{title || 'Overview'}</h2>

      {/* Right widgets */}
      <div style={styles.widgets}>
        {/* Notification Bell */}
        <div style={styles.bellContainer}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={styles.iconBtn}>
            <Bell size={20} color="var(--text-secondary)" />
            <span style={styles.badge} />
          </button>

          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>Notifications</div>
              <div style={styles.dropdownBody}>
                {notifications.map((n) => (
                  <div key={n.id} style={styles.notificationItem}>
                    <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '2px' }} />
                    <div style={styles.notifContent}>
                      <div style={styles.notifText}>{n.text}</div>
                      <div style={styles.notifTime}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <Link to="/profile" style={styles.profileLink}>
          <div style={styles.userAvatar}>
            <User size={16} color="var(--primary)" />
          </div>
          <span style={styles.userName}>{currentUser?.name || 'User'}</span>
        </Link>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--spacing-lg)',
    position: 'sticky',
    top: '0',
    zIndex: '99'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  },
  widgets: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  bellContainer: {
    position: 'relative'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color 0.15s ease'
  },
  badge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--danger)'
  },
  dropdown: {
    position: 'absolute',
    right: '0',
    top: '38px',
    width: '280px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: '101',
    animation: 'fadeIn 0.2s ease-out'
  },
  dropdownHeader: {
    padding: '12px var(--spacing-md)',
    fontWeight: '600',
    fontSize: '0.85rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  dropdownBody: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '240px',
    overflowY: 'auto'
  },
  notificationItem: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    padding: '12px var(--spacing-md)',
    borderBottom: '1px solid #f8f9fa',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    transition: 'background-color 0.15s ease'
  },
  notifContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  notifText: {
    lineHeight: '1.3'
  },
  notifTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color 0.15s ease'
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '500'
  }
};
