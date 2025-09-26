import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'weather': return '🌧️';
      case 'health': return '🏥';
      case 'safety': return '⚠️';
      case 'transport': return '🚗';
      case 'event': return '📅';
      default: return '📢';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'alert-high';
      case 'medium': return 'alert-medium';
      case 'low': return 'alert-low';
      default: return 'alert-info';
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const alertDate = new Date(dateString);
    const diffMs = now - alertDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.type === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.location && alert.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="alerts-page">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="header">
        <h1>Travel Alerts</h1>
        <p>Stay informed with real-time travel alerts and important updates</p>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search alerts by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('all')}
          >
            All Alerts
          </button>
          <button
            className={filter === 'weather' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('weather')}
          >
            Weather
          </button>
          <button
            className={filter === 'health' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('health')}
          >
            Health
          </button>
          <button
            className={filter === 'safety' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('safety')}
          >
            Safety
          </button>
          <button
            className={filter === 'transport' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('transport')}
          >
            Transport
          </button>
          <button
            className={filter === 'event' ? 'tab-active' : 'tab'}
            onClick={() => setFilter('event')}
          >
            Events
          </button>
        </div>
      </div>

      <div className="alerts-container">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div key={alert._id} className={`alert-card ${getAlertColor(alert.severity)}`}>
              <div className="alert-header">
                <div className="alert-icon">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-meta">
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-time">{getTimeAgo(alert.createdAt)}</span>
                </div>
                <div className="alert-severity">
                  <span className={`severity-badge ${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>

              <div className="alert-content">
                <h3 className="alert-title">{alert.title}</h3>
                <p className="alert-description">{alert.description}</p>
                
                {alert.location && (
                  <div className="alert-location">
                    <span className="location-icon">📍</span>
                    <span>{alert.location}</span>
                  </div>
                )}

                {alert.validUntil && (
                  <div className="alert-validity">
                    <span className="validity-label">Valid until:</span>
                    <span className="validity-date">
                      {new Date(alert.validUntil).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {alert.actionRequired && (
                  <div className="alert-action">
                    <span className="action-label">Action Required:</span>
                    <span className="action-text">{alert.actionRequired}</span>
                  </div>
                )}
              </div>

              <div className="alert-footer">
                <button className="share-btn">Share</button>
                <button className="save-btn">Save</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            <div className="no-alerts-icon">📭</div>
            <h3>No alerts found</h3>
            <p>There are currently no alerts matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="emergency-contacts">
        <h3>Emergency Contacts</h3>
        <div className="contacts-grid">
          <div className="contact-card">
            <span className="contact-icon">🚨</span>
            <div>
              <h4>Police</h4>
              <p>100</p>
            </div>
          </div>
          <div className="contact-card">
            <span className="contact-icon">🚑</span>
            <div>
              <h4>Ambulance</h4>
              <p>102</p>
            </div>
          </div>
          <div className="contact-card">
            <span className="contact-icon">🚒</span>
            <div>
              <h4>Fire Brigade</h4>
              <p>101</p>
            </div>
          </div>
          <div className="contact-card">
            <span className="contact-icon">🆘</span>
            <div>
              <h4>Tourist Helpline</h4>
              <p>1363</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
