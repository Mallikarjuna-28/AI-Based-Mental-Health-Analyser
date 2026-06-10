import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { DashboardCard } from '../components/DashboardCard';
import { Camera, Mic, FileText, ClipboardList, HelpCircle, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { token, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    currentEmotion: 'N/A',
    stressScore: 'N/A',
    wellnessScore: 'N/A',
    latestScanTime: 'No scans yet'
  });

  const [recentScans, setRecentScans] = useState([]);
  const [recommendations, setRecommendations] = useState([
    "Complete the daily psychological questionnaire to baseline your scores.",
    "Record a short voice note under the Voice module to capture vocal stress levels.",
    "Upload a selfie or turn on the camera for immediate Facial Emotion classification."
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analysis/history?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Compute metrics from history lists
          const facial = data.facial || [];
          const voice = data.voice || [];
          const text = data.text || [];
          const quest = data.questionnaire || [];

          // 1. Current Emotion
          let latestEmotion = 'Neutral';
          let hasEmotionData = false;
          if (facial.length > 0) {
            latestEmotion = facial[0].emotion;
            hasEmotionData = true;
          } else if (voice.length > 0) {
            latestEmotion = voice[0].emotion;
            hasEmotionData = true;
          }

          // 2. Average Stress Score
          let totalStress = 0;
          let countStress = 0;
          if (facial.length > 0) {
            totalStress += facial[0].stress_score || 15;
            countStress++;
          }
          if (voice.length > 0) {
            totalStress += voice[0].stress_score || 10;
            countStress++;
          }
          if (text.length > 0) {
            totalStress += text[0].stress_score || 30;
            countStress++;
          }
          if (quest.length > 0) {
            totalStress += quest[0].stress_index || 25;
            countStress++;
          }
          const avgStress = countStress > 0 ? Math.round(totalStress / countStress) : null;

          // 3. Average Wellness Score
          let totalWellness = 0;
          let countWellness = 0;
          if (facial.length > 0) {
            totalWellness += facial[0].wellness_score;
            countWellness++;
          }
          if (voice.length > 0) {
            totalWellness += voice[0].wellness_score;
            countWellness++;
          }
          if (text.length > 0) {
            totalWellness += (100 - (text[0].stress_score || 30));
            countWellness++;
          }
          if (quest.length > 0) {
            totalWellness += quest[0].wellness_score;
            countWellness++;
          }
          const avgWellness = countWellness > 0 ? Math.round(totalWellness / countWellness) : null;

          // 4. Assemble recent activity list
          const combinedHistory = [];
          facial.forEach(item => combinedHistory.push({ type: 'Facial Scan', detail: `Detected: ${item.emotion} (Conf: ${item.confidence}%)`, time: item.created_at }));
          voice.forEach(item => combinedHistory.push({ type: 'Voice Clip', detail: `Detected: ${item.emotion} (Conf: ${item.confidence}%)`, time: item.created_at }));
          text.forEach(item => combinedHistory.push({ type: 'Text Sentiment', detail: `Detected: ${item.sentiment} (Stress: ${item.stress_score}%)`, time: item.created_at }));
          quest.forEach(item => combinedHistory.push({ type: 'Questionnaire', detail: `Wellness Score: ${item.wellness_score}% (${item.risk_category})`, time: item.created_at }));

          // Sort by time descending
          combinedHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
          setRecentScans(combinedHistory.slice(0, 5));

          // Set metrics state
          setMetrics({
            currentEmotion: hasEmotionData ? latestEmotion : 'N/A',
            stressScore: avgStress !== null ? `${avgStress}%` : 'N/A',
            wellnessScore: avgWellness !== null ? `${avgWellness}%` : 'N/A',
            latestScanTime: combinedHistory.length > 0 ? new Date(combinedHistory[0].time).toLocaleDateString() : 'No scans yet'
          });

          // Custom recommendations based on metrics
          if (avgWellness !== null) {
            const recs = [];
            if (avgWellness < 50) {
              recs.push("Highly suggest talking with a supportive counselor or primary physician.");
              recs.push("Explore progressive muscle relaxation (PMR) in our final report page.");
              recs.push("Ensure your sleep schedules are stabilized (aim for 8 hours).");
            } else if (avgWellness < 75) {
              recs.push("Try a 5-minute deep breathing session to ease physical tension.");
              recs.push("Set clear workplace/study limits to restore energy levels.");
              recs.push("Maintain mild outdoor walking or jogging daily.");
            } else {
              recs.push("Your scores indicate excellent balance. Keep up your positive routines!");
              recs.push("Reflect on your achievements in your daily text log.");
            }
            setRecommendations(recs);
          }

        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Utility to map wellness to colors
  const getWellnessColor = (scoreStr) => {
    if (scoreStr === 'N/A') return 'Primary';
    const num = parseInt(scoreStr);
    if (num >= 75) return 'Success';
    if (num >= 50) return 'Warning';
    return 'Danger';
  };

  const getStressColor = (scoreStr) => {
    if (scoreStr === 'N/A') return 'Primary';
    const num = parseInt(scoreStr);
    if (num <= 35) return 'Success';
    if (num <= 70) return 'Warning';
    return 'Danger';
  };

  return (
    <div className="page-container animated">
      {/* Welcome Message Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={{ color: 'var(--primary-dark)', marginBottom: '4px' }}>Hello, {currentUser?.name || 'User'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your academic mental health portal. Here is your current emotional baseline summary.</p>
        </div>
        <div style={styles.bannerIcon}>
          <Activity size={24} color="var(--primary)" />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <DashboardCard
          title="Current Emotion"
          value={metrics.currentEmotion}
          subtitle={metrics.latestScanTime}
          icon={Camera}
          color={metrics.currentEmotion === 'N/A' ? 'Primary' : 'Accent'}
          loading={loading}
        />
        <DashboardCard
          title="Stress Score"
          value={metrics.stressScore}
          subtitle="Arousal intensity index"
          icon={Activity}
          color={getStressColor(metrics.stressScore)}
          loading={loading}
        />
        <DashboardCard
          title="Wellness Score"
          value={metrics.wellnessScore}
          subtitle="Weighted integrated health"
          icon={ShieldCheck}
          color={getWellnessColor(metrics.wellnessScore)}
          loading={loading}
        />
        <DashboardCard
          title="Latest Analysis"
          value={recentScans.length > 0 ? recentScans[0].type : 'N/A'}
          subtitle={recentScans.length > 0 ? 'Recently completed' : 'No records yet'}
          icon={ClipboardList}
          color="Primary"
          loading={loading}
        />
      </div>

      <div className="grid-2">
        {/* Left Card: Recent logs */}
        <div className="card">
          <h3 className="card-title">
            <Activity size={18} color="var(--primary)" />
            <span>Recent Analysis Modules</span>
          </h3>
          <div style={styles.listContainer}>
            {recentScans.length === 0 ? (
              <div style={styles.emptyState}>
                <HelpCircle size={32} color="var(--text-muted)" />
                <p>No tests recorded. Start with an analysis below.</p>
              </div>
            ) : (
              recentScans.map((scan, idx) => (
                <div key={idx} style={styles.listItem}>
                  <div style={styles.itemMeta}>
                    <span style={styles.itemType}>{scan.type}</span>
                    <span style={styles.itemDetail}>{scan.detail}</span>
                  </div>
                  <span style={styles.itemTime}>{new Date(scan.time).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Card: Recommendations */}
        <div className="card">
          <h3 className="card-title">
            <ShieldCheck size={18} color="var(--success)" />
            <span>AI Recommendations & Self-Care</span>
          </h3>
          <div style={styles.recommendationsList}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={styles.recItem}>
                <div style={styles.bulletPoint} />
                <p style={styles.recText}>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Section */}
      <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Get Started with Modules</h3>
        <div style={styles.quickLaunchGrid}>
          <Link to="/facial-analysis" style={styles.moduleLink}>
            <div style={styles.moduleIconBox}><Camera size={18} /></div>
            <div style={styles.moduleMeta}>
              <h4>Facial Scan</h4>
              <p>Scan your face using webcam</p>
            </div>
            <ArrowRight size={16} />
          </Link>
          <Link to="/voice-analysis" style={styles.moduleLink}>
            <div style={styles.moduleIconBox}><Mic size={18} /></div>
            <div style={styles.moduleMeta}>
              <h4>Voice Analysis</h4>
              <p>Record or upload speech samples</p>
            </div>
            <ArrowRight size={16} />
          </Link>
          <Link to="/text-analysis" style={styles.moduleLink}>
            <div style={styles.moduleIconBox}><FileText size={18} /></div>
            <div style={styles.moduleMeta}>
              <h4>Text Sentiment</h4>
              <p>Type out journal details</p>
            </div>
            <ArrowRight size={16} />
          </Link>
          <Link to="/questionnaire" style={styles.moduleLink}>
            <div style={styles.moduleIconBox}><ClipboardList size={18} /></div>
            <div style={styles.moduleMeta}>
              <h4>Questionnaire</h4>
              <p>validated health self-report</p>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  welcomeBanner: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)'
  },
  bannerIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-md)'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px var(--spacing-md)',
    backgroundColor: 'var(--bg-app)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)'
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  itemType: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  itemDetail: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  itemTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    marginTop: 'var(--spacing-md)'
  },
  recItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  bulletPoint: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    marginTop: '6px',
    flexShrink: 0
  },
  recText: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    margin: 0
  },
  quickLaunchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  moduleLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease'
  },
  moduleIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moduleMeta: {
    flex: 1
  }
};
