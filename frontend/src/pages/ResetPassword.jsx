import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Optionally verify token validity on component mount
    if (!token) {
      setIsValidToken(false);
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  // Generate floating bubbles (same as login)
  const generateBubbles = () => {
    const bubbles = [];
    for (let i = 0; i < 10; i++) {
      bubbles.push(
        <div
          key={i}
          className="bubble"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      );
    }
    return bubbles;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Error resetting password. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="reset-container">
        <div className="bubbles-container">
          {generateBubbles()}
        </div>
        <div className="reset-card">
          <div className="error-state">
            <h2>🚫 Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      {/* Animated Background Bubbles */}
      <div className="bubbles-container">
        {generateBubbles()}
      </div>
      
      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-icon">🔑</div>
        <div className="floating-icon">🔐</div>
        <div className="floating-icon">🛡️</div>
        <div className="floating-icon">✨</div>
      </div>

      <div className="reset-card">
        <div className="card-header">
          <div className="logo-section">
            <span className="logo-icon">🟣</span>
            <h1>Yatra360</h1>
            <h2>🔑 Reset Your Password</h2>
            <p>Create a new password for your account</p>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label>🔒 New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password (min 6 characters)"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>🔐 Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '🔄 Resetting Password...' : '✅ Reset Password'}
          </button>

          <div className="form-footer">
            <button 
              type="button" 
              className="link-btn"
              onClick={() => navigate('/login')}
            >
              ← Back to Login
            </button>
          </div>
        </form>

        <div className="security-info">
          <h4>🔒 Security Tips:</h4>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Include letters, numbers, and special characters</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Keep your password secure and confidential</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
