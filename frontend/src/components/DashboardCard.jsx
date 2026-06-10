import React from 'react';

export const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'primary', loading = false }) => {
  // Mapping color to theme colors
  const colorMap = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    accent: 'var(--accent)'
  };

  const selectedColor = colorMap[color] || 'var(--primary)';

  return (
    <div style={styles.card}>
      {loading ? (
        <div style={styles.skeletonContainer}>
          <div style={styles.skeletonTitle} />
          <div style={styles.skeletonValue} />
          <div style={styles.skeletonSub} />
        </div>
      ) : (
        <>
          <div style={styles.header}>
            <span style={styles.title}>{title}</span>
            {Icon && (
              <div style={{ ...styles.iconWrapper, backgroundColor: `${selectedColor}15`, color: selectedColor }}>
                <Icon size={16} />
              </div>
            )}
          </div>
          <div style={styles.content}>
            <h3 style={styles.value}>{value}</h3>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px',
    transition: 'box-shadow 0.2s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)'
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em'
  },
  iconWrapper: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  value: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    margin: 0
  },
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  skeletonTitle: {
    width: '50%',
    height: '12px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out'
  },
  skeletonValue: {
    width: '80%',
    height: '24px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out'
  },
  skeletonSub: {
    width: '40%',
    height: '10px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out'
  }
};
