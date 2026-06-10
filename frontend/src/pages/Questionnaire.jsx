import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { ClipboardList, AlertCircle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Questionnaire = () => {
  const { token } = useAuth();

  // Form responses state (1 to 10 scale)
  const [responses, setResponses] = useState({
    sleep_quality: 5,
    anxiety_level: 5,
    stress_level: 5,
    mood_score: 5,
    energy_level: 5,
    motivation_level: 5
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSliderChange = (name, val) => {
    setResponses(prev => ({
      ...prev,
      [name]: parseInt(val)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Prepare payload matching FastAPI router schema
    const payload = {
      sleep_quality: responses.sleep_quality,
      anxiety_level: responses.anxiety_level,
      stress_level: responses.stress_level,
      mood_score: responses.mood_score,
      energy_level: responses.energy_level,
      motivation_level: responses.motivation_level
    };

    try {
      const res = await fetch(`${API_BASE_URL}/analysis/questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit survey scores.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred during score calculation.");
    } finally {
      setLoading(false);
    }
  };

  // Questions configuration
  const questionsList = [
    { name: 'sleep_quality', label: 'Sleep Quality', desc: 'Rate the restfulness of your sleep last night.', minLabel: 'Restless', maxLabel: 'Deep/Restful' },
    { name: 'anxiety_level', label: 'Anxiety Level', desc: 'Rate your level of worry, panic, or nervousness today.', minLabel: 'None/Calm', maxLabel: 'Severe Panic' },
    { name: 'stress_level', label: 'Stress Level', desc: 'Rate the pressure or tension you felt during daily tasks.', minLabel: 'Relaxed', maxLabel: 'Overwhelmed' },
    { name: 'mood_score', label: 'General Mood', desc: 'Rate your overall emotional valence or happiness today.', minLabel: 'Very Low', maxLabel: 'Excellent' },
    { name: 'energy_level', label: 'Energy Levels', desc: 'Rate your physical stamina and alertness today.', minLabel: 'Exhausted', maxLabel: 'Vibrant' },
    { name: 'motivation_level', label: 'Motivation Levels', desc: 'Rate your drive, goal orientation, and interest in work.', minLabel: 'Apathetic', maxLabel: 'Highly Driven' }
  ];

  return (
    <div className="page-container animated">
      <h1>Psychological Assessment</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Conduct a brief self-report to track cognitive indicators. Results are compiled instantly to produce risk warnings and wellness balances.</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* LEFT COLUMN: The Form */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Daily Self-Rating Survey</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            {questionsList.map((q) => (
              <div key={q.name} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <strong style={styles.qLabel}>{q.label}</strong>
                  <span style={styles.qVal}>{responses[q.name]}/10</span>
                </div>
                <p style={styles.qDesc}>{q.desc}</p>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={responses[q.name]}
                  onChange={(e) => handleSliderChange(q.name, e.target.value)}
                  style={styles.slider}
                />
                
                <div style={styles.sliderLabels}>
                  <span>{q.minLabel}</span>
                  <span>{q.maxLabel}</span>
                </div>
              </div>
            ))}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Evaluating answers...' : 'Calculate Wellness Matrix'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Scored result */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Instant Scoring Summary</h3>

          {loading ? (
            <div style={styles.loadingState}>
              <div className="btn-primary" style={styles.spinner} />
              <p>Analyzing psychological indicators against standard wellness metrics...</p>
            </div>
          ) : result ? (
            <div style={styles.resultBox} className="animated">
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Risk Category</div>
                  <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>{result.risk_category}</h2>
                </div>
                <div style={styles.badgeContainer}>
                  {result.risk_category === 'Low Risk' && (
                    <span className="badge badge-success" style={{ gap: '4px' }}><CheckCircle2 size={12} /> Healthy State</span>
                  )}
                  {result.risk_category === 'Moderate Risk' && (
                    <span className="badge badge-warning" style={{ gap: '4px' }}><AlertCircle size={12} /> Under Strain</span>
                  )}
                  {result.risk_category === 'High Risk' && (
                    <span className="badge badge-danger" style={{ gap: '4px' }}><ShieldAlert size={12} /> Urgent Self-Care</span>
                  )}
                </div>
              </div>

              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Mental Wellness Score</span>
                  <strong style={{ ...styles.metricVal, color: 'var(--success)' }}>{result.wellness_score}%</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Stress Index</span>
                  <strong style={{ ...styles.metricVal, color: result.stress_index >= 70 ? 'var(--danger)' : result.stress_index >= 40 ? 'var(--warning)' : 'var(--success)' }}>
                    {result.stress_index}%
                  </strong>
                </div>
              </div>

              <div style={styles.scoresInterpretation}>
                <h4>Detailed Index Evaluation:</h4>
                <ul style={styles.evalList}>
                  <li>
                    <span>Arousal Load:</span>
                    <strong>{responses.stress_level >= 7 ? 'High' : responses.stress_level >= 4 ? 'Moderate' : 'Low'}</strong>
                  </li>
                  <li>
                    <span>Emotional Recovery:</span>
                    <strong>{responses.sleep_quality >= 7 ? 'Good' : responses.sleep_quality >= 4 ? 'Adequate' : 'Poor'}</strong>
                  </li>
                  <li>
                    <span>Task Drive:</span>
                    <strong>{responses.motivation_level >= 7 ? 'Active' : responses.motivation_level >= 4 ? 'Neutral' : 'Blocked'}</strong>
                  </li>
                </ul>
              </div>

              <div style={styles.academicNote}>
                <strong>Algorithmic Mapping:</strong> Wellness Score is computed using a weighted balance mapping negative triggers (anxiety, stress) and restorative baselines.
              </div>
            </div>
          ) : (
            <div style={styles.emptyResult}>
              <Sparkles size={32} color="var(--text-muted)" />
              <p>Adjust the sliders on the left corresponding to your states today and submit to produce diagnostic scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px var(--spacing-md)',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid var(--danger)',
    marginBottom: 'var(--spacing-md)',
    fontSize: '0.9rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  questionCard: {
    padding: '14px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-app)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  qLabel: {
    fontSize: '0.92rem',
    color: 'var(--text-primary)'
  },
  qVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    backgroundColor: 'var(--primary-light)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  qDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '4px'
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: 'var(--primary)'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    gap: '16px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '40px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e9ecef',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  resultBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px'
  },
  resultTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  badgeContainer: {
    marginTop: '4px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  metricItem: {
    padding: '14px',
    backgroundColor: 'var(--bg-app)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  metricVal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  scoresInterpretation: {
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-app)'
  },
  evalList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },
  evalListLi: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  academicNote: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    fontStyle: 'italic',
    lineHeight: '1.3'
  },
  emptyResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    color: 'var(--text-secondary)',
    gap: '12px',
    textAlign: 'center',
    padding: '40px'
  }
};

// Add nested styling override for evaluate items
styles.evalList = {
  ...styles.evalList,
  padding: 0
};
// Add dynamic child style mapping helper inside render to stay inline
