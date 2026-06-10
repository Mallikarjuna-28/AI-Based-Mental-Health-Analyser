import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Compass, Activity } from 'lucide-react';

export const Analytics = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Chart state datas
  const [wellnessTrend, setWellnessTrend] = useState([]);
  const [surveyBreakdown, setSurveyBreakdown] = useState([]);
  const [emotionPieData, setEmotionPieData] = useState([]);

  // Curated theme colors for Recharts (Notion/Linear muted tone)
  const COLORS = {
    primary: '#4f6d7a',   // slate blue
    success: '#6b9080',   // sage green
    warning: '#e09f3e',   // ochre yellow
    danger: '#c9184a',    // crimson
    accent: '#8f94fb',    // soft lavender
    neutral: '#98c1d9'    // powder blue
  };

  const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.neutral, COLORS.warning, COLORS.danger, COLORS.accent];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analysis/history?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          const facial = data.facial || [];
          const voice = data.voice || [];
          const text = data.text || [];
          const quest = data.questionnaire || [];

          // Case 1: If there is actual historical data, compile it
          if (facial.length > 0 || voice.length > 0 || text.length > 0 || quest.length > 0) {
            // Compile Line Chart data chronologically
            // Combine all reports/scans with times
            const rawTrend = [];
            quest.forEach((item, index) => {
              rawTrend.push({
                date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                Wellness: item.wellness_score,
                Stress: item.stress_index,
                rawTime: new Date(item.created_at)
              });
            });

            // If no questionnaire data yet, construct basic progression based on other scans
            if (rawTrend.length === 0) {
              const combined = [...facial, ...voice];
              combined.forEach((item, idx) => {
                rawTrend.push({
                  date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                  Wellness: item.wellness_score || 80,
                  Stress: item.stress_score || 20,
                  rawTime: new Date(item.created_at)
                });
              });
            }

            // Sort ascending
            rawTrend.sort((a, b) => a.rawTime - b.rawTime);
            setWellnessTrend(rawTrend);

            // Compile Bar Chart: Category breakdown from latest survey
            if (quest.length > 0) {
              const latest = quest[0].responses || {};
              const breakdown = [
                { name: 'Sleep', score: latest.sleep_quality || 5 },
                { name: 'Anxiety', score: latest.anxiety_level || 5 },
                { name: 'Stress', score: latest.stress_level || 5 },
                { name: 'Mood', score: latest.mood_score || 5 },
                { name: 'Energy', score: latest.energy_level || 5 },
                { name: 'Motivation', score: latest.motivation_level || 5 }
              ];
              setSurveyBreakdown(breakdown);
            } else {
              setSurveyBreakdown(mockSurveyData);
            }

            // Compile Pie Chart: Count frequency of emotions
            const emotionCounts = {};
            [...facial, ...voice].forEach(item => {
              const emo = item.emotion || 'Neutral';
              emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
            });

            const pieData = Object.keys(emotionCounts).map(key => ({
              name: key,
              value: emotionCounts[key]
            }));

            setEmotionPieData(pieData.length > 0 ? pieData : mockPieData);
            setDataLoaded(true);
          } else {
            // Case 2: No user records yet - Fallback to mock clinical study indicators to demonstrate graphs
            setWellnessTrend(mockTrendData);
            setSurveyBreakdown(mockSurveyData);
            setEmotionPieData(mockPieData);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics trends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  // Mock baseline datasets for blank dashboard demonstration
  const mockTrendData = [
    { date: 'Jun 04', Wellness: 78, Stress: 24 },
    { date: 'Jun 05', Wellness: 82, Stress: 18 },
    { date: 'Jun 06', Wellness: 68, Stress: 35 },
    { date: 'Jun 07', Wellness: 74, Stress: 30 },
    { date: 'Jun 08', Wellness: 79, Stress: 20 },
    { date: 'Jun 09', Wellness: 85, Stress: 15 },
    { date: 'Jun 10', Wellness: 88, Stress: 12 }
  ];

  const mockSurveyData = [
    { name: 'Sleep', score: 8 },
    { name: 'Anxiety', score: 3 },
    { name: 'Stress', score: 4 },
    { name: 'Mood', score: 7 },
    { name: 'Energy', score: 8 },
    { name: 'Motivation', score: 9 }
  ];

  const mockPieData = [
    { name: 'Neutral', value: 8 },
    { name: 'Happy', value: 12 },
    { name: 'Calm', value: 6 },
    { name: 'Sad', value: 3 },
    { name: 'Angry', value: 1 },
    { name: 'Surprised', value: 2 }
  ];

  return (
    <div className="page-container animated">
      <h1>Weekly & Monthly Mood Analytics</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>
        {!dataLoaded && "Showing baseline clinical model data. "}
        Review visual breakdowns detailing stress load fluctuations, category metrics, and emotional state distribution frequencies.
      </p>

      {loading ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p>Compiling time-series trend indicators...</p>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>
          {/* Chart 1: Time Series Line Chart */}
          <div className="card" style={styles.chartCard}>
            <h3 className="card-title">
              <TrendingUp size={16} color="var(--primary)" />
              <span>Wellness & Stress Trends</span>
            </h3>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wellnessTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={styles.tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="Wellness" stroke={COLORS.success} strokeWidth={2.5} activeDot={{ r: 6 }} name="Wellness Score (%)" />
                  <Line type="monotone" dataKey="Stress" stroke={COLORS.danger} strokeWidth={2.5} name="Stress Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            {/* Chart 2: Category Bar Chart */}
            <div className="card" style={{ ...styles.chartCard, marginBottom: 0 }}>
              <h3 className="card-title">
                <BarChart3 size={16} color="var(--primary)" />
                <span>Survey Indicators Breakdown (Latest)</span>
              </h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surveyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis domain={[0, 10]} stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={styles.tooltipStyle} />
                    <Bar dataKey="score" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Score (1-10)">
                      {surveyBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 7 ? COLORS.success : entry.score >= 5 ? COLORS.warning : COLORS.danger} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Emotion Frequency Pie Chart */}
            <div className="card" style={{ ...styles.chartCard, marginBottom: 0 }}>
              <h3 className="card-title">
                <Compass size={16} color="var(--primary)" />
                <span>Emotion Frequency Distribution</span>
              </h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {emotionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={styles.tooltipStyle} />
                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" fontSize={11} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    color: 'var(--text-secondary)',
    gap: '16px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e9ecef',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  dashboardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)'
  },
  chartCard: {
    minHeight: '340px'
  },
  chartContainer: {
    width: '100%',
    height: '280px',
    marginTop: 'var(--spacing-md)'
  },
  tooltipStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)'
  }
};
