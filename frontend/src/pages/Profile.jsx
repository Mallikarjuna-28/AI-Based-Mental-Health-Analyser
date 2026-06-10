import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  // Local form states
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [age, setAge] = useState(currentUser?.age || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const updates = {
      name,
      email,
      age: age ? parseInt(age) : null,
      gender: gender || null
    };

    try {
      await updateProfile(updates);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animated">
      <h1>User Profile Settings</h1>
      <p style={{ marginBottom: 'var(--spacing-lg)' }}>Update your personal details and academic demographic information to personalize the clinical recommendations.</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
          <User size={18} color="var(--primary)" />
          <span>Demographics Profile</span>
        </h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                className="form-control"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="10"
                max="100"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Saving updates...' : 'Save Demographics'}
          </button>
        </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  row: {
    display: 'flex',
    gap: 'var(--spacing-md)'
  }
};
