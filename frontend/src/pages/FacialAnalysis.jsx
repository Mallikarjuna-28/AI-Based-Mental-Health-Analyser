import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Camera, Upload, AlertCircle, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export const FacialAnalysis = () => {
  const { token } = useAuth();
  
  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop webcam stream when component unmounts
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Synchronize webcam stream when the video DOM element mounts
  useEffect(() => {
    if (isWebcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.log("Webcam autoplay deferred: ", err));
    }
  }, [isWebcamActive]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
      stopWebcam();
    }
  };

  const startWebcam = async () => {
    setError('');
    setResult(null);
    setSelectedFile(null);
    setPreviewUrl('');
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setIsWebcamActive(true);
    } catch (err) {
      setError("Unable to access the camera. Please check webcam permissions or upload an image file instead.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureFrameAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setLoading(true);
    setError('');
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      let width = video.videoWidth || video.clientWidth || 640;
      let height = video.videoHeight || video.clientHeight || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to process captured frame. Captured image was empty.");
          setLoading(false);
          return;
        }
        
        // Setup preview
        const fileObj = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setPreviewUrl(URL.createObjectURL(fileObj));
        
        // Send to API
        await uploadImageFile(fileObj);
      }, 'image/jpeg');
      
      stopWebcam();
    } catch (err) {
      setError("Failed to capture frame from webcam: " + err.message);
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }
    setLoading(true);
    setError('');
    await uploadImageFile(selectedFile);
  };

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/analysis/facial`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload analysis failed.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred during facial emotion detection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animated">
      <h1>Facial Emotion Detection</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Capture a photo using your webcam or upload an existing image to analyze facial emotional markers and stress response profiles.</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* LEFT SIDE: Media Feed */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Capture or Upload Media</h3>
          
          {/* Webcam streaming box */}
          {isWebcamActive ? (
            <div style={styles.mediaContainer}>
              <video ref={videoRef} style={styles.webcamView} autoPlay playsInline muted />
              <div style={styles.cameraOverlay}>
                <span style={styles.overlayBadge}>Live Camera Active</span>
              </div>
            </div>
          ) : previewUrl ? (
            // Preview selected/captured image
            <div style={styles.mediaContainer}>
              <img src={previewUrl} alt="Preview" style={styles.webcamView} />
            </div>
          ) : (
            // Empty State
            <div style={styles.emptyMediaBox}>
              <Camera size={48} color="var(--text-muted)" />
              <p>No active camera feed or image preview.</p>
            </div>
          )}

          {/* Action button triggers */}
          <div style={styles.btnRow}>
            {isWebcamActive ? (
              <>
                <button onClick={captureFrameAndAnalyze} className="btn btn-primary" disabled={loading}>
                  Capture Frame & Analyze
                </button>
                <button onClick={stopWebcam} className="btn btn-secondary">
                  Cancel Camera
                </button>
              </>
            ) : (
              <>
                <button onClick={startWebcam} className="btn btn-secondary">
                  <Camera size={16} />
                  <span>Start Camera</span>
                </button>
                <div style={styles.uploadWrapper}>
                  <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }}>
                    <Upload size={16} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </>
            )}
            
            {selectedFile && !isWebcamActive && !result && (
              <button onClick={handleUploadSubmit} className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Uploaded Photo'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Result Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Analysis Result</h3>

          {loading ? (
            <div style={styles.loadingState}>
              <div className="btn-primary" style={styles.spinner} />
              <p>Extracting facial coordinates and classifying emotions via CNN + FER2013 pipeline...</p>
            </div>
          ) : result ? (
            <div style={styles.resultBox} className="animated">
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Detected Emotion</div>
                  <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>{result.emotion}</h2>
                </div>
                <div style={styles.badgeContainer}>
                  {result.face_detected ? (
                    <span className="badge badge-success">Face Detected</span>
                  ) : (
                    <span className="badge badge-warning">Simulated Feed</span>
                  )}
                </div>
              </div>
              {previewUrl && (
                <div style={styles.resultImageContainer}>
                  <img src={previewUrl} alt="Analyzed Face" style={styles.resultImage} />
                </div>
              )}

              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Confidence Level</span>
                  <strong style={styles.metricVal}>{result.confidence}%</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Stress Level</span>
                  <strong style={{ ...styles.metricVal, color: result.stress_level === 'High' ? 'var(--danger)' : result.stress_level === 'Moderate' ? 'var(--warning)' : 'var(--success)' }}>
                    {result.stress_level}
                  </strong>
                </div>
              </div>

              <div style={styles.interpretationBox}>
                <div style={styles.interpTitle}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>Interpretation & Guide</span>
                </div>
                <p style={styles.interpText}>{result.interpretation}</p>
              </div>

              <div style={styles.academicNote}>
                <strong>CNN Inference:</strong> Evaluated using Convolutional Neural Network architectures trained on the FER2013 facial database (48x48 pixel mapping).
              </div>
            </div>
          ) : (
            <div style={styles.emptyResult}>
              <Sparkles size={32} color="var(--text-muted)" />
              <p>Capture a frame or select a picture, then run the CNN evaluator to render diagnostics details instantly.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for webcam frame grabbing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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
  mediaContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    backgroundColor: '#1e1e24',
    aspectRatio: '4/3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)'
  },
  webcamView: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cameraOverlay: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 10
  },
  overlayBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  emptyMediaBox: {
    width: '100%',
    aspectRatio: '4/3',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    gap: '12px',
    backgroundColor: 'var(--bg-app)'
  },
  btnRow: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    marginTop: 'var(--spacing-md)',
    flexWrap: 'wrap'
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
  },
  resultImageContainer: {
    width: '100%',
    maxHeight: '220px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg-app)',
    marginTop: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)'
  },
  resultImage: {
    maxHeight: '220px',
    maxWidth: '100%',
    objectFit: 'contain'
  }
};
