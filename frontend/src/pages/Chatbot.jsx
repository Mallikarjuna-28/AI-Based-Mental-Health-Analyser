import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { MessageSquare, Send, Globe, BrainCircuit, Heart, Sparkles, Smile } from 'lucide-react';

export const Chatbot = () => {
  const { token } = useAuth();

  // States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('English'); // 'English' | 'Telugu' | 'Hindi'
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // References
  const chatEndRef = useRef(null);

  // Load chat logs on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chatbot/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const userMessage = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistically append user message
    const tempUserMsg = { id: Date.now().toString(), sender: 'user', message: userMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, language })
      });

      if (!res.ok) {
        throw new Error("Chatbot failed to respond.");
      }

      const data = await res.json();
      const tempBotMsg = { id: (Date.now() + 1).toString(), sender: 'bot', message: data.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, tempBotMsg]);
    } catch (err) {
      console.error(err);
      const tempErrorMsg = { id: (Date.now() + 1).toString(), sender: 'bot', message: "I apologize, but my connection failed. Let's try again in a moment.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, tempErrorMsg]);
    } finally {
      setSending(false);
    }
  };

  const languages = ['English', 'Telugu', 'Hindi'];

  const tips = [
    { title: "Grounding Exercises", text: "When anxious, identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste." },
    { title: "Breath Regulation", text: "Slow your breathing. Inhale for 4s, hold for 7s, exhale for 8s to calm the nervous system." },
    { title: "Self-Compassion", text: "Acknowledge stressful thoughts without judgment. Say: 'This is a moment of stress. May I be kind to myself.'" }
  ];

  return (
    <div className="page-container animated" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)' }}>
      <h1 style={{ marginBottom: '4px' }}>AI Wellness Chatbot</h1>
      <p style={{ marginBottom: 'var(--spacing-md)' }}>Chat with our emotion-aware assistant. Support is available in English, Telugu, and Hindi to guide you with wellness practices.</p>

      <div style={styles.chatWrapper}>
        {/* LEFT PANEL: Language & Tips (Notion Sidebar details) */}
        <div style={styles.leftPanel} className="no-print">
          <div style={styles.sectionHeader}>
            <Globe size={16} color="var(--primary)" />
            <span>Select Language</span>
          </div>
          <div style={styles.langSelector}>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  ...styles.langBtn,
                  backgroundColor: language === lang ? 'var(--primary)' : 'var(--bg-app)',
                  color: language === lang ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: language === lang ? '600' : '400'
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          <div style={{ ...styles.sectionHeader, marginTop: '24px' }}>
            <Heart size={16} color="var(--danger)" />
            <span>Wellness Reminders</span>
          </div>
          <div style={styles.tipsList}>
            {tips.map((tip, idx) => (
              <div key={idx} style={styles.tipCard}>
                <strong>{tip.title}</strong>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Box */}
        <div style={styles.chatBox}>
          {/* Chat message stream */}
          <div style={styles.messageStream}>
            {loadingHistory ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner} />
                <span>Loading your conversation logs...</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={styles.emptyChatBox}>
                <BrainCircuit size={48} color="var(--text-muted)" />
                <h3>Start a conversation</h3>
                <p>Speak about your day, query breathing advice, or type whatever is on your mind. I am listening.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      ...styles.bubble,
                      backgroundColor: msg.sender === 'user' ? 'var(--primary-light)' : '#ffffff',
                      color: msg.sender === 'user' ? 'var(--primary-dark)' : 'var(--text-primary)',
                      border: msg.sender === 'user' ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
                      borderRadius: msg.sender === 'user' 
                        ? '14px 14px 2px 14px' 
                        : '14px 14px 14px 2px',
                    }}
                  >
                    <div style={styles.bubbleText}>{msg.message}</div>
                    <div style={styles.bubbleTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.bubble, backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '14px 14px 14px 2px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSend} style={styles.chatInputForm} className="no-print">
            <input
              type="text"
              className="form-control"
              placeholder={`Send message to AI assistant in ${language}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              style={styles.chatInput}
            />
            <button type="submit" className="btn btn-primary" style={styles.sendBtn} disabled={sending || !inputText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  chatWrapper: {
    display: 'flex',
    flex: '1',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
    minHeight: '380px'
  },
  leftPanel: {
    width: '240px',
    borderRight: '1px solid var(--border-color)',
    backgroundColor: '#fdfdfd',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  langSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  langBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  tipCard: {
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#ffffff'
  },
  chatBox: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-app)'
  },
  messageStream: {
    flex: '1',
    padding: 'var(--spacing-lg)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: 'calc(100vh - 280px)'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    gap: '12px',
    color: 'var(--text-secondary)'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #e9ecef',
    borderTop: '2px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyChatBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '40px',
    gap: '12px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    padding: '10px 14px',
    maxWidth: '70%',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  bubbleText: {
    fontSize: '0.92rem',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  bubbleTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end'
  },
  chatInputForm: {
    display: 'flex',
    padding: 'var(--spacing-md)',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    gap: 'var(--spacing-sm)'
  },
  chatInput: {
    flex: '1',
    borderRadius: 'var(--radius-sm)'
  },
  sendBtn: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)'
  }
};
