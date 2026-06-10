import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Clipboard, Printer, Download, Plus, AlertCircle, FileText, CheckCircle, ShieldAlert } from 'lucide-react';

export const FinalReport = () => {
  const { token, currentUser } = useAuth();
  
  // States
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load report history on mount
  useEffect(() => {
    fetchReportHistory();
  }, [token]);

  const fetchReportHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Generation failed. Complete at least one analysis module first.");
      }

      const newReport = await res.json();
      setSuccess("Report generated successfully!");
      setSelectedReport(newReport);
      
      // Reload history list
      await fetchReportHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!selectedReport) return;
    const reportId = selectedReport.id || selectedReport._id;
    
    // Redirect browser to trigger native streaming download
    const downloadUrl = `${API_BASE_URL}/reports/${reportId}/csv?token=${token}`;
    
    // Alternatively, fetch with headers to authenticate:
    fetch(`${API_BASE_URL}/reports/${reportId}/csv`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("CSV download failed");
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mental_health_report_${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => {
      setError("Failed to download CSV: " + err.message);
    });
  };

  return (
    <div className="page-container animated">
      <h1 className="no-print">Mental Health Assessment Report</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }} className="no-print">
        Compile a multi-modal analysis aggregating findings from Facial scanning, Voice analytics, Natural Language text patterns, and Questionnaire surveys.
      </p>

      {error && (
        <div style={styles.errorAlert} className="no-print">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successAlert} className="no-print">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={styles.reportLayout}>
        {/* LEFT COLUMN: Report List Selector (Hidden on Print) */}
        <div style={styles.sidebarCol} className="no-print">
          <button onClick={handleGenerateReport} className="btn btn-primary btn-block" disabled={generating} style={{ marginBottom: 'var(--spacing-md)' }}>
            <Plus size={16} />
            <span>{generating ? 'Compiling Fusion...' : 'Generate New Report'}</span>
          </button>

          <div className="card" style={{ padding: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Generated Reports History</h3>
            {reports.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No reports compile yet.</p>
            ) : (
              <div style={styles.reportsList}>
                {reports.map((rep) => (
                  <button
                    key={rep.id || rep._id}
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      ...styles.reportSelectorItem,
                      backgroundColor: (selectedReport?.id === rep.id || selectedReport?._id === rep._id) ? 'var(--primary-light)' : 'transparent',
                      color: (selectedReport?.id === rep.id || selectedReport?._id === rep._id) ? 'var(--primary-dark)' : 'var(--text-primary)'
                    }}
                  >
                    <FileText size={16} />
                    <div style={styles.selectorMeta}>
                      <span style={styles.selectorDate}>{new Date(rep.created_at).toLocaleDateString()}</span>
                      <span style={styles.selectorScore}>Wellness: {rep.overall_wellness_score}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The Document view */}
        <div style={styles.docCol}>
          {selectedReport ? (
            <div style={styles.documentCard} className="card">
              {/* Document Header actions (hidden on print) */}
              <div style={styles.docActions} className="no-print">
                <button onClick={handlePrint} className="btn btn-secondary">
                  <Printer size={16} />
                  <span>Print Report / PDF</span>
                </button>
                <button onClick={handleDownloadCSV} className="btn btn-secondary">
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Printable Document Core */}
              <div style={styles.printableDocument}>
                <div style={styles.docHeader}>
                  <h2 style={styles.docHeaderTitle}>AI-Based Mental Health Analyser</h2>
                  <span style={styles.academicSubtitle}>Integrated Multi-Modal Emotion Detection System Report</span>
                  <div style={styles.docDivider} />
                </div>

                <div style={styles.docMetadataGrid}>
                  <div>
                    <strong>User Information</strong>
                    <div style={styles.metaLine}>Name: {currentUser?.name}</div>
                    <div style={styles.metaLine}>Email: {currentUser?.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>Report Details</strong>
                    <div style={styles.metaLine}>Generated: {new Date(selectedReport.created_at).toLocaleString()}</div>
                    <div style={styles.metaLine}>Ref ID: {selectedReport.id || selectedReport._id}</div>
                  </div>
                </div>

                <div style={styles.docSection}>
                  <h3 style={styles.sectionTitle}>I. Integrated Core Diagnosis</h3>
                  <div style={styles.diagnosisGrid}>
                    <div style={styles.scoreContainer}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Mental Wellness Index</span>
                      <strong style={styles.bigScore}>{selectedReport.overall_wellness_score}%</strong>
                    </div>
                    <div style={styles.diagnosisMeta}>
                      <div style={styles.diagLine}>
                        <span>Combined Risk Category:</span>
                        <strong>
                          {selectedReport.risk_category}
                        </strong>
                      </div>
                      <div style={styles.diagLine}>
                        <span>Stress Arousal Level:</span>
                        <strong>{selectedReport.stress_level}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.docSection}>
                  <h3 style={styles.sectionTitle}>II. Multi-Modal Classifier Output Breakdown</h3>
                  <div style={styles.modalitiesGrid}>
                    <div style={styles.modalityReportCard}>
                      <strong>Facial Analysis (30% Weight)</strong>
                      <p>{selectedReport.facial_emotion}</p>
                    </div>
                    <div style={styles.modalityReportCard}>
                      <strong>Voice Analysis (25% Weight)</strong>
                      <p>{selectedReport.voice_emotion}</p>
                    </div>
                    <div style={styles.modalityReportCard}>
                      <strong>Text Sentiment (20% Weight)</strong>
                      <p>{selectedReport.text_sentiment}</p>
                    </div>
                    <div style={styles.modalityReportCard}>
                      <strong>Questionnaire Rating (20% Weight)</strong>
                      <p>{selectedReport.questionnaire_score}</p>
                    </div>
                    <div style={styles.modalityReportCard}>
                      <strong>Chatbot Insights (5% Weight)</strong>
                      <p>{selectedReport.chatbot_insights}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.docSection}>
                  <h3 style={styles.sectionTitle}>III. Clinical Recommendations & Activity Plan</h3>
                  <div style={styles.recommendationsText}>
                    {selectedReport.recommendations}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Suggested Coping Activities:</strong>
                    <ul style={styles.activitiesList}>
                      {selectedReport.suggested_activities && selectedReport.suggested_activities.map((act, idx) => (
                        <li key={idx} style={styles.activityLi}>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={styles.docFooter}>
                  <p>Developed using Weighted Fusion Theory for engineering final thesis review.</p>
                  <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>This document is a machine learning simulation. It is not an alternative to standard clinical consultation.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={styles.emptyDoc}>
              <Clipboard size={48} color="var(--text-muted)" />
              <h3>No Report Selected</h3>
              <p>Trigger "Generate New Report" on the sidebar panel to compile current modal indicators into a diagnosis worksheet.</p>
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px var(--spacing-md)',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid var(--success)',
    marginBottom: 'var(--spacing-md)',
    fontSize: '0.9rem'
  },
  reportLayout: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
    flexWrap: 'wrap'
  },
  sidebarCol: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  reportSelectorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%'
  },
  selectorMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  selectorDate: {
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  selectorScore: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)'
  },
  docCol: {
    flex: 1,
    minWidth: '320px'
  },
  documentCard: {
    padding: '32px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    position: 'relative'
  },
  docActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-sm)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
    marginBottom: '28px'
  },
  printableDocument: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  docHeader: {
    textAlign: 'center'
  },
  docHeaderTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    marginBottom: '4px'
  },
  academicSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  docDivider: {
    height: '2px',
    backgroundColor: 'var(--primary-dark)',
    width: '100px',
    margin: '16px auto 0 auto'
  },
  docMetadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px'
  },
  metaLine: {
    marginTop: '4px'
  },
  docSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px'
  },
  diagnosisGrid: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
    backgroundColor: 'var(--bg-app)',
    padding: '20px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)'
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid var(--border-color)',
    paddingRight: '30px'
  },
  bigScore: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--primary-dark)'
  },
  diagnosisMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  diagLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  modalitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  modalityReportCard: {
    padding: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-app)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  recommendationsText: {
    fontSize: '0.92rem',
    lineHeight: '1.5',
    color: 'var(--text-primary)'
  },
  activitiesList: {
    marginTop: '10px',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  activityLi: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)'
  },
  docFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
    textAlign: 'center',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  emptyDoc: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
    gap: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  }
};
