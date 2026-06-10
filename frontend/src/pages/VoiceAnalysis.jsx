import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Mic, Square, Upload, AlertCircle, Play, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';

export const VoiceAnalysis = () => {
  const { token } = useAuth();
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // API states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setAudioBlob(null);
      setResult(null);
      setError('');
    }
  };

  // Start microphone capture
  const startRecording = async () => {
    setError('');
    setResult(null);
    setSelectedFile(null);
    setAudioUrl('');
    setAudioBlob(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobObj = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlobObj);
        setAudioUrl(URL.createObjectURL(audioBlobObj));
        
        // Stop all tracks on the stream to release mic icon
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError("Unable to access the microphone. Check device options or upload a file.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleAnalyze = async () => {
    let fileToUpload = null;
    if (audioBlob) {
      fileToUpload = new File([audioBlob], "recording.wav", { type: "audio/wav" });
    } else if (selectedFile) {
      fileToUpload = selectedFile;
    }

    if (!fileToUpload) {
      setError("Please record an audio snippet or upload a audio file first.");
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await fetch(`${API_BASE_URL}/analysis/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Voice analysis failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred during audio processing.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container animated">
      <h1>Voice Emotion Detection</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Record speech samples using the web microphone or upload an audio file to inspect pitch variations, energy envelopes, and emotional markers.</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* LEFT PANEL: Inputs */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Record or Upload Speech</h3>

          {/* Recorder Widget UI */}
          <div style={styles.recorderWidget}>
            {isRecording ? (
              <div style={styles.recordingIndicator}>
                <div style={styles.recordPulse} />
                <span style={styles.timeCounter}>{formatTime(recordingTime)}</span>
                <span style={{ fontSize: '0.85rem' }}>Recording microphone stream...</span>
              </div>
            ) : audioUrl ? (
              <div style={styles.audioReviewBox}>
                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  {audioBlob ? "Microphone Capture Preview" : `File Upload: ${selectedFile?.name}`}
                </span>
                <audio src={audioUrl} controls style={styles.audioPlayer} />
              </div>
            ) : (
              <div style={styles.emptyAudioBox}>
                <Mic size={40} color="var(--text-muted)" />
                <p style={{ fontSize: '0.88rem' }}>No audio captured or loaded. Trigger recording below.</p>
              </div>
            )}

            <div style={styles.btnRow}>
              {isRecording ? (
                <button onClick={stopRecording} className="btn btn-danger">
                  <Square size={16} />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button onClick={startRecording} className="btn btn-secondary" disabled={loading}>
                  <Mic size={16} />
                  <span>Record Speech</span>
                </button>
              )}

              <div style={styles.uploadWrapper}>
                <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }} disabled={isRecording || loading}>
                  <Upload size={16} />
                  <span>Upload Audio File</span>
                  <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={isRecording || loading} />
                </label>
              </div>
            </div>
          </div>

          {(audioBlob || selectedFile) && !isRecording && !result && (
            <button onClick={handleAnalyze} className="btn btn-primary btn-block" style={{ marginTop: '20px' }} disabled={loading}>
              {loading ? 'Processing audio waveforms...' : 'Analyze Vocal Properties'}
            </button>
          )}
        </div>

        {/* RIGHT PANEL: Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Analysis Results</h3>

          {loading ? (
            <div style={styles.loadingState}>
              <div className="btn-primary" style={styles.spinner} />
              <p>Performing Mel-frequency Cepstral Coefficients (MFCCs) and spectral extraction via Librosa...</p>
            </div>
          ) : result ? (
            <div style={styles.resultBox} className="animated">
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Vocal Emotion</div>
                  <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>{result.emotion}</h2>
                </div>
                <div style={styles.badgeContainer}>
                  {result.librosa_extracted ? (
                    <span className="badge badge-success">Acoustic Math Loaded</span>
                  ) : (
                    <span className="badge badge-primary">Model Inferred</span>
                  )}
                </div>
              </div>

              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Signal Confidence</span>
                  <strong style={styles.metricVal}>{result.confidence}%</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Stress Index</span>
                  <strong style={{ ...styles.metricVal, color: result.stress_level === 'High' ? 'var(--danger)' : result.stress_level === 'Moderate' ? 'var(--warning)' : 'var(--success)' }}>
                    {result.stress_level}
                  </strong>
                </div>
              </div>

              <div style={styles.interpretationBox}>
                <div style={styles.interpTitle}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>Voice Summary Findings</span>
                </div>
                <p style={styles.interpText}>{result.summary}</p>
              </div>

              {result.features && Object.keys(result.features).length > 0 && (
                <div style={styles.featuresPanel}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Acoustic Vector Biomarkers:</strong>
                  <div style={styles.featuresList}>
                    <div style={styles.featureLine}>
                      <span>MFCC Coefficient 0:</span>
                      <code>{result.features.mfcc_mean_0?.toFixed(4)}</code>
                    </div>
                    <div style={styles.featureLine}>
                      <span>MFCC Coefficient 1:</span>
                      <code>{result.features.mfcc_mean_1?.toFixed(4)}</code>
                    </div>
                    <div style={styles.featureLine}>
                      <span>Zero Crossing Rate (ZCR):</span>
                      <code>{result.features.zcr_mean?.toFixed(4)}</code>
                    </div>
                    <div style={styles.featureLine}>
                      <span>Signal Duration:</span>
                      <code>{result.features.duration?.toFixed(2)} seconds</code>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.academicNote}>
                <strong>Biomarker Inference:</strong> Processed using Mel-frequency cepstrum coefficients (MFCCs) mapped to standard RAVDESS vocal emotion classifications.
              </div>
            </div>
          ) : (
            <div style={styles.emptyResult}>
              <Sparkles size={32} color="var(--text-muted)" />
              <p>Record a vocal test snippet or upload a voice file, then run waveform analysis to view biomarkers.</p>
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
  recorderWidget: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
    backgroundColor: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordingIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--danger)'
  },
  recordPulse: {
    width: '16px',
    height: '16px',
    backgroundColor: 'var(--danger)',
    borderRadius: '50%',
    animation: 'pulse 1.2s infinite ease-in-out'
  },
  timeCounter: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  audioReviewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  audioPlayer: {
    width: '100%',
    maxWidth: '360px'
  },
  emptyAudioBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    gap: '12px'
  },
  btnRow: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  uploadWrapper: {
    display: 'inline-block'
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
  interpretationBox: {
    padding: '16px',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success)',
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
    color: 'var(--success)'
  },
  interpText: {
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    margin: 0
  },
  featuresPanel: {
    padding: '14px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-app)'
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '10px'
  },
  featureLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
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
