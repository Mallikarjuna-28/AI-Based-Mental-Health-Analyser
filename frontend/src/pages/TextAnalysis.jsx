import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { FileText, AlertCircle, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

export const TextAnalysis = () => {
  const { token } = useAuth();
  
  // States
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please type some thoughts or journal entries first.");
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/analysis/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Text sentiment analysis failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred during text analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animated">
      <h1>Text Sentiment Analysis</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Type your diary logs, thoughts, or emotional experiences. The text classifier will analyze sentence tokens, detect sentiment values, stress flags, and emotional topics.</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* LEFT PANEL: TextInput */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Journal Logging Space</h3>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type your feelings here (min 1 word)</label>
              <textarea
                className="form-control"
                rows={8}
                placeholder="Today I felt a bit overwhelmed with assignments, but going for a short walk made me feel relaxed and calm..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div style={styles.formFooter}>
              <span style={styles.charCounter}>{wordCount} words / {text.length} characters</span>
              <button type="submit" className="btn btn-primary" disabled={loading || wordCount === 0}>
                {loading ? 'Running NLP Model...' : 'Analyze Thoughts'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Result */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Semantic Findings</h3>

          {loading ? (
            <div style={styles.loadingState}>
              <div className="btn-primary" style={styles.spinner} />
              <p>Analyzing text semantic vectors using transformer lexicons...</p>
            </div>
          ) : result ? (
            <div style={styles.resultBox} className="animated">
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Text Sentiment</div>
                  <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>{result.sentiment}</h2>
                </div>
                <div style={styles.badgeContainer}>
                  {result.bert_extracted ? (
                    <span className="badge badge-success">BERT Vectors</span>
                  ) : (
                    <span className="badge badge-primary">Lexicon Scanned</span>
                  )}
                </div>
              </div>

              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Cognitive Emotion</span>
                  <strong style={styles.metricVal}>{result.emotion_class}</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Arousal Stress score</span>
                  <strong style={{ ...styles.metricVal, color: result.stress_score >= 70 ? 'var(--danger)' : result.stress_score >= 40 ? 'var(--warning)' : 'var(--success)' }}>
                    {result.stress_score}%
                  </strong>
                </div>
              </div>

              {/* Keywords Tag display */}
              <div style={styles.tagsPanel}>
                <span style={styles.tagsLabel}>Detected Sentiment Keywords:</span>
                <div style={styles.tagsContainer}>
                  {result.keywords && result.keywords.length > 0 ? (
                    result.keywords.map((kw, idx) => (
                      <span key={idx} style={styles.tagBadge}>
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No high-intensity emotional words found.</span>
                  )}
                </div>
              </div>

              <div style={styles.interpretationBox}>
                <div style={styles.interpTitle}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>Clinical NLP Summary</span>
                </div>
                <p style={styles.interpText}>
                  {result.sentiment === 'Positive' && "Linguistic profiles reveal highly resilient verbal coping. Vocabulary choices indicate low psychological strain."}
                  {result.sentiment === 'Neutral' && "Balanced lexical distribution. Content expresses normal baseline state without elevated tension."}
                  {result.sentiment === 'Negative' && "Elevated presence of cognitive distress markers. Text analysis indicates active emotional stress or self-reported anxiety. Deep relaxation exercises suggested."}
                </p>
              </div>

              <div style={styles.academicNote}>
                <strong>Semantic Inference:</strong> Tokenized and scored against emotional dictionary lexicons mirroring bidirectional BERT representations.
              </div>
            </div>
          ) : (
            <div style={styles.emptyResult}>
              <Sparkles size={32} color="var(--text-muted)" />
              <p>Type out some thoughts on the left and submit them to reveal immediate natural language features.</p>
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
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px'
  },
  charCounter: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
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
    gap: '18px'
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
  tagsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tagsLabel: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'var(--text-secondary)'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tagBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)'
  },
  interpretationBox: {
    padding: '16px',
    backgroundColor: 'var(--primary-light)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  interpTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    fontSize: '0.88rem',
    color: 'var(--primary-dark)'
  },
  interpText: {
    fontSize: '0.88rem',
    color: 'var(--primary-dark)',
    lineHeight: '1.4',
    margin: 0
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
