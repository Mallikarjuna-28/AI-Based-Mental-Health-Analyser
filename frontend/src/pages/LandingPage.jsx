import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, FileText, ClipboardList, MessageSquare, Clipboard, ArrowRight, ShieldCheck, Heart, Sparkles, BrainCircuit } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { title: "Facial Emotion Detection", desc: "Recognize expressions in real-time or from uploads using CNN models trained on FER2013.", icon: Camera },
    { title: "Voice Emotion Detection", desc: "Extract acoustic biomarkers (MFCCs, pitch, energy) using Librosa and classifier algorithms.", icon: Mic },
    { title: "Text Sentiment Analysis", desc: "Evaluate written thoughts and journaling cues utilizing semantic BERT transformer techniques.", icon: FileText },
    { title: "Psychological Assessment", desc: "Conduct validated self-reports tracking sleep, energy, anxiety, and motivational patterns.", icon: ClipboardList },
    { title: "AI Wellness Chatbot", desc: "Chat in English, Telugu, or Hindi with an emotion-aware, supportive conversational agent.", icon: MessageSquare },
    { title: "Final Report Generator", desc: "Generate complete multi-modal diagnostics reports with customizable PDF/CSV exports.", icon: Clipboard }
  ];

  return (
    <div style={styles.container}>
      {/* Navbar header */}
      <header style={styles.navHeader}>
        <div style={styles.logo}>
          <BrainCircuit size={24} color="var(--primary)" />
          <span style={styles.logoText}>Mental Health Analyser</span>
        </div>
        <button onClick={handleGetStarted} className="btn btn-primary">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.pillBadge}>
            <Sparkles size={14} />
            <span>Multi-Modal AI Engine</span>
          </div>
          <h1 style={styles.heroTitle}>AI-Based Mental Health Analyser</h1>
          <p style={styles.heroSub}>
            An academic, production-ready system analyzing emotions and stress patterns. 
            Synthesizing facial expressions, vocal acoustic properties, text sentiments, and psychological assessments 
            to generate complete, clinical-grade wellness reports.
          </p>
          <div style={styles.heroActions}>
            <button onClick={handleGetStarted} className="btn btn-primary" style={styles.heroBtn}>
              Get Started <ArrowRight size={16} />
            </button>
            <button onClick={handleLearnMore} className="btn btn-secondary" style={styles.heroBtn}>
              Learn More
            </button>
          </div>
        </div>
        <div style={styles.heroRight}>
          {/* Custom inline SVG illustration representing mental health & AI */}
          <svg viewBox="0 0 400 400" style={styles.svgIllustration}>
            {/* Background grids */}
            <circle cx="200" cy="200" r="160" fill="var(--bg-app)" />
            <circle cx="200" cy="200" r="120" fill="#ffffff" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Brain/Mind lines representing analysis */}
            <path d="M150,200 C150,150 180,120 200,120 C220,120 250,150 250,200 C250,250 220,280 200,280 C180,280 150,250 150,200 Z" 
                  fill="var(--primary-light)" opacity="0.6" />
            <path d="M170,200 C170,160 190,140 200,140 C210,140 230,160 230,200 C230,240 210,260 200,260 C190,260 170,240 170,200 Z" 
                  fill="var(--accent-light)" opacity="0.6" />
                  
            {/* Core Neural nodes */}
            <circle cx="200" cy="120" r="8" fill="var(--primary)" />
            <circle cx="150" cy="200" r="8" fill="var(--accent)" />
            <circle cx="250" cy="200" r="8" fill="var(--success)" />
            <circle cx="200" cy="280" r="8" fill="var(--warning)" />
            
            {/* Connected data lines */}
            <line x1="200" y1="120" x2="150" y2="200" stroke="var(--text-muted)" strokeWidth="2" />
            <line x1="150" y1="200" x2="200" y2="280" stroke="var(--text-muted)" strokeWidth="2" />
            <line x1="200" y1="280" x2="250" y2="200" stroke="var(--text-muted)" strokeWidth="2" />
            <line x1="250" y1="200" x2="200" y2="120" stroke="var(--text-muted)" strokeWidth="2" />
            <line x1="200" y1="120" x2="200" y2="280" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3,3" />
            
            {/* Pulse circle */}
            <circle cx="200" cy="200" r="30" fill="none" stroke="var(--primary)" strokeWidth="1.5">
              <animate attributeName="r" values="20;50;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* Floating Hearts/Shields */}
            <circle cx="120" cy="140" r="15" fill="var(--success-light)" />
            <path d="M120,135 L123,138 L117,144" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" />
            
            <circle cx="280" cy="260" r="15" fill="var(--danger-light)" />
            <path d="M280,263 C277,260 274,257 274,255 C274,253 276,251 278,251 C279,251 280,252 280,253 C280,252 281,251 282,251 C284,251 286,253 286,255 C286,257 283,260 280,263 Z" fill="var(--danger)" />
          </svg>
        </div>
      </section>

      {/* About Project Section */}
      <section id="about" style={styles.aboutSection}>
        <div style={styles.sectionHeader}>
          <Heart size={20} color="var(--danger)" />
          <h2>About the Project</h2>
        </div>
        <div style={styles.aboutGrid}>
          <div style={styles.aboutCard}>
            <h3>What is the Mental Health Analyser?</h3>
            <p>
              It is a comprehensive engineering prototype designed to aggregate behavioral features from different modalities. 
              By fusing facial recognition coordinates, acoustic voice biomarkers, and natural language sentiment scoring, 
              the system develops a structured wellness matrix representing mental health states objectively.
            </p>
          </div>
          <div style={styles.aboutCard}>
            <h3>The Importance of Early Awareness</h3>
            <p>
              Subtle changes in emotional baselines are often invisible to individuals during daily routines. 
              Continuous evaluation of voice frequencies, text journals, and sleep logs serves as a warning mechanism, 
              advocating for early self-care, meditation techniques, or professional diagnostics when necessary.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <ShieldCheck size={20} color="var(--primary)" />
          <h2>Core Framework Features</h2>
        </div>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section style={styles.workflowSection}>
        <div style={styles.sectionHeader}>
          <BrainCircuit size={20} color="var(--accent)" />
          <h2>The Fusion Workflow</h2>
        </div>
        <div style={styles.workflowTimeline}>
          {[
            { step: "1", title: "Upload / Input", desc: "Upload facial pictures, record voice audio clips, type diary entries, or fill the questionnaire." },
            { step: "2", title: "ML Feature Analysis", desc: "FastAPI server extracts features (CNN facial boxes, Librosa acoustic vectors, text tokens)." },
            { step: "3", title: "Predictive Models", desc: "Individual module estimators compute emotion and stress scores synchronously." },
            { step: "4", title: "Report Fusion & Recommendation", desc: "The weighted formula constructs the overall Wellness score and downloads printable PDF/CSV sheets." }
          ].map((w, index) => (
            <div key={index} style={styles.workflowStep}>
              <div style={styles.stepCircle}>{w.step}</div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section style={styles.techSection}>
        <div style={styles.sectionHeader}>
          <h2>Technology Stack</h2>
        </div>
        <div style={styles.techGrid}>
          <div style={styles.techItem}>
            <strong>React Frontend</strong>
            <span>Vite, Recharts, Lucide, Modular CSS</span>
          </div>
          <div style={styles.techItem}>
            <strong>FastAPI Backend</strong>
            <span>Uvicorn, REST Controllers, Python-jose</span>
          </div>
          <div style={styles.techItem}>
            <strong>Database & Cache</strong>
            <span>MongoDB Atlas (Async Motor / Local JSON storage)</span>
          </div>
          <div style={styles.techItem}>
            <strong>AI & Feature Extraction</strong>
            <span>Librosa, OpenCV Haar-Cascades, Scikit-Learn</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 AI-Based Mental Health Analyser. Built for academic engineering final-year thesis.</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>Designed with Notion/Linear design guidelines. Strictly clinical and research-oriented prototype.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg-app)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-family)',
  },
  navHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px var(--spacing-xl)',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)'
  },
  logoText: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px var(--spacing-xl)',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    gap: '40px',
    flexWrap: 'wrap'
  },
  heroLeft: {
    flex: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)'
  },
  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    alignSelf: 'flex-start',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    fontSize: '0.8rem',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '99px'
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: '700',
    lineHeight: '1.15',
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em'
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '520px'
  },
  heroActions: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    marginTop: 'var(--spacing-sm)'
  },
  heroBtn: {
    padding: '12px 24px',
    fontSize: '0.95rem'
  },
  heroRight: {
    flex: 1,
    minWidth: '320px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  svgIllustration: {
    maxWidth: '380px',
    width: '100%',
    height: 'auto'
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    padding: '60px var(--spacing-xl)',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    marginBottom: '40px'
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  aboutCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)'
  },
  featuresSection: {
    padding: '80px var(--spacing-xl)',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  featureCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '28px',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-sm)'
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  workflowSection: {
    backgroundColor: '#ffffff',
    padding: '80px var(--spacing-xl)',
    borderTop: '1px solid var(--border-color)'
  },
  workflowTimeline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  workflowStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px'
  },
  stepCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
    boxShadow: 'var(--shadow-sm)'
  },
  techSection: {
    padding: '60px var(--spacing-xl)',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'center'
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  },
  techItem: {
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: '40px var(--spacing-xl)',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem'
  }
};
