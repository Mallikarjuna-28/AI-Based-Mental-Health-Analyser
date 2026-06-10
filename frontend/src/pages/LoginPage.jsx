import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }
        await register(name, email, password);
        setSuccess('Registration successful! Redirecting...');
      } else {
        await login(email, password);
        setSuccess('Login successful! Redirecting...');
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Reset link simulated: In a production environment, a transactional reset mail is dispatched.");
  };

  return (
    <div style={styles.container}>
      {/* Back to Home Button */}
      <button onClick={() => navigate('/')} style={styles.backHomeBtn}>
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      {/* Main card box split into Left Illustration and Right Form */}
      <div style={styles.cardBox}>
        {/* Left Side: Healthcare illustration */}
        <div style={styles.leftPane}>
          <div style={styles.brandTitle}>
            <BrainCircuit size={28} color="#ffffff" />
            <span style={styles.brandText}>HealthAnalyser AI</span>
          </div>
          <p style={styles.brandSub}>
            Evaluating emotional traits across multi-modal indicators for academic thesis verification.
          </p>

          <svg viewBox="0 0 300 250" style={styles.vectorIllustration}>
            {/* Draw a person in lotus pose meditating */}
            <circle cx="150" cy="70" r="18" fill="#ffffff" opacity="0.9" />
            
            {/* Body */}
            <path d="M150,90 C125,120 100,160 100,180 C100,190 120,195 150,195 C180,195 200,190 200,180 C200,160 175,90 150,90 Z" 
                  fill="#ffffff" opacity="0.75" />
                  
            {/* Meditating arms */}
            <path d="M125,130 Q90,160 110,180" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <path d="M175,130 Q210,160 190,180" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            
            {/* Heart symbol indicating emotional wellness */}
            <path d="M150,145 C147,142 144,139 144,137 C144,135 146,133 148,133 C149,133 150,134 150,135 C150,134 151,133 152,133 C154,133 156,135 156,137 C156,139 153,142 150,145 Z" 
                  fill="var(--danger)" />
                  
            {/* Glowing nodes (energy/wellness flow) */}
            <circle cx="150" cy="180" r="4" fill="#6b9080" />
            <circle cx="150" cy="115" r="4" fill="#5e60ce" />
            
            {/* Orbit lines */}
            <ellipse cx="150" cy="140" rx="90" ry="40" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
            <ellipse cx="150" cy="140" rx="100" ry="70" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,5" opacity="0.3" />
          </svg>
          
          <div style={styles.quoteBox}>
            <Sparkles size={14} color="#e09f3e" />
            <span>"Early recognition leads to progressive recovery."</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={styles.rightPane}>
          <div style={styles.formHeader}>
            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegister ? 'Sign up to begin mental analysis' : 'Log in to view your health dashboard'}</p>
          </div>

          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Name</label>
                <div style={styles.inputContainer}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={styles.inputContainer}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@healthcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={styles.labelRow}>
                <label className="form-label">Password</label>
                {!isRegister && (
                  <button type="button" onClick={handleForgotPassword} style={styles.forgotBtn}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={styles.inputContainer}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: '10px' }}>
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div style={styles.formFooter}>
            <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={styles.toggleBtn}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-app)',
    padding: 'var(--spacing-md)',
    fontFamily: 'var(--font-family)',
    position: 'relative'
  },
  backHomeBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'background-color 0.15s ease'
  },
  cardBox: {
    display: 'flex',
    maxWidth: '850px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    minHeight: '520px',
    flexWrap: 'wrap'
  },
  leftPane: {
    flex: 1,
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: '320px'
  },
  brandTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em'
  },
  brandSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    margin: '20px 0'
  },
  vectorIllustration: {
    width: '100%',
    height: 'auto',
    maxHeight: '200px'
  },
  quoteBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.78rem',
    color: '#ffffffa0',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    paddingTop: '20px'
  },
  rightPane: {
    flex: 1.1,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: '320px'
  },
  formHeader: {
    marginBottom: 'var(--spacing-lg)'
  },
  alertError: {
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: 'var(--spacing-md)',
    borderLeft: '4px solid var(--danger)'
  },
  alertSuccess: {
    backgroundColor: 'var(--success-light)',
    color: 'var(--success)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: 'var(--spacing-md)',
    borderLeft: '4px solid var(--success)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    padding: 0,
    fontWeight: '500'
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '24px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: 0
  }
};
