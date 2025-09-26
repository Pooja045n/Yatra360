import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScrollingAlerts.css';

const ScrollingAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate fetching latest alerts
    const fetchAlerts = () => {
      const latestAlerts = [
        {
          id: 1,
          type: 'weather',
          priority: 'high',
          message: '🌧️ Heavy rainfall alert for Kerala - Travel with caution until Aug 30',
          timestamp: new Date(),
          action: '/alerts'
        },
        {
          id: 2,
          type: 'health',
          priority: 'medium',
          message: '🏥 COVID-19 guidelines updated for international travelers',
          timestamp: new Date(),
          action: '/alerts'
        },
        {
          id: 3,
          type: 'transport',
          priority: 'low',
          message: '🚂 New Vande Bharat route: Delhi to Kashmir inaugurated',
          timestamp: new Date(),
          action: '/alerts'
        },
        {
          id: 4,
          type: 'festival',
          priority: 'medium',
          message: '🎭 Ganesh Chaturthi celebrations: Special travel packages available',
          timestamp: new Date(),
          action: '/festivals'
        },
        {
          id: 5,
          type: 'offer',
          priority: 'high',
          message: '💰 Flash Sale: 40% off on Rajasthan tour packages - Limited time!',
          timestamp: new Date(),
          action: '/explore'
        }
      ];
      
      setAlerts(latestAlerts);
      setIsVisible(true);
    };

    fetchAlerts();
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAlertClick = (alert) => {
    navigate(alert.action);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  return (
    <div className="scrolling-alerts-container">
      <div className="alerts-wrapper">
        <div className="alerts-header">
          <span className="alerts-icon">📢</span>
          <span className="alerts-label">Latest Updates</span>
        </div>
        
        <div className="alerts-scroll">
          <div className="alerts-track">
            {[...alerts, ...alerts].map((alert, index) => (
              <div
                key={`${alert.id}-${index}`}
                className={`alert-item priority-${alert.priority}`}
                onClick={() => handleAlertClick(alert)}
              >
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">
                  {alert.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="alerts-close"
          onClick={handleClose}
          aria-label="Close alerts"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ScrollingAlerts;
