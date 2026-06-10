import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Settings as SettingsIcon, AlertCircle, Database, Shield, BookOpen } from 'lucide-react';

export const Settings = () => {
  const { token } = useAuth();
  
  // Environment status states
  const [dbStatus, setDbStatus] = useState({
    status: 'checking...',
    database: 'checking...',
    version: '1.0.0'
  });

  // Local preferences
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [anonymousLogging, setAnonymousLogging] = useState(false);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDbStatus({
            status: data.status,
            database: data.database,
            version: data.version
          });
        }
      } catch (err) {
        setDbStatus({
          status: 'offline',
          database: 'unreachable',
          version: '1.0.0'
        });
      }
    };

    fetchSystemStatus();
  }, [token]);

  return (
    <div className="page-container animated">
      <h1>System Preferences & Configuration</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Configure cognitive tracking thresholds, privacy overrides, and review ML environment attributes.</p>

      <div className="grid-2">
        {/* Left Side: General options */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
            <SettingsIcon size={18} color="var(--primary)" />
            <span>Portal Settings</span>
          </h3>

          <div style={styles.preferenceGroup}>
            <div style={styles.prefItem}>
              <div style={styles.prefMeta}>
                <strong>Enable Self-Care Reminders</strong>
                <p>Deliver notifications suggesting deep breathing, rest cycles, and questionnaire prompts.</p>
              </div>
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={(e) => setAllowNotifications(e.target.checked)}
                style={styles.checkbox}
              />
            </div>

            <div style={styles.prefItem}>
              <div style={styles.prefMeta}>
                <strong>De-identify Data Storage</strong>
                <p>Remove personally identifiable metrics (PII) from compiled analysis tables.</p>
              </div>
              <input
                type="checkbox"
                checked={anonymousLogging}
                onChange={(e) => setAnonymousLogging(e.target.checked)}
                style={styles.checkbox}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Environment status */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
            <Database size={18} color="var(--success)" />
            <span>ML Environment Status</span>
          </h3>

          <div style={styles.statusPanel}>
            <div style={styles.statusLine}>
              <span>FastAPI Backend status:</span>
              <strong style={{ color: dbStatus.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>
                {dbStatus.status.toUpperCase()}
              </strong>
            </div>

            <div style={styles.statusLine}>
              <span>Active Database Engine:</span>
              <strong style={{ color: 'var(--primary-dark)' }}>{dbStatus.database}</strong>
            </div>

            <div style={styles.statusLine}>
              <span>Architecture Version:</span>
              <code>v{dbStatus.version}</code>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <BookOpen size={16} color="var(--primary)" />
              <span>Academic Prototype Attributes</span>
            </div>
            <p style={styles.infoText}>
              This platform compiles multi-modal classifiers using Weighted Fusion algorithms (30% Facial, 25% Voice, 20% Text, 20% Questionnaire, 5% Chatbot) 
              as a computer-assisted psychological screening aid for engineering project evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  preferenceGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  prefItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px'
  },
  prefMeta: {
    flex: 1
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: 'var(--primary)',
    marginTop: '4px'
  },
  statusPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '20px'
  },
  statusLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  infoBox: {
    padding: '16px',
    backgroundColor: 'var(--primary-light)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    fontSize: '0.88rem',
    color: 'var(--primary-dark)'
  },
  infoText: {
    fontSize: '0.82rem',
    color: 'var(--primary-dark)',
    lineHeight: '1.4',
    margin: 0
  }
};
