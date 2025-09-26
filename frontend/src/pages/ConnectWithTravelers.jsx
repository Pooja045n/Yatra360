import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import { useAuth } from '../contexts/AuthContext';
import './ConnectWithTravelers.css';

const ConnectWithTravelers = () => {
  const { user, token } = useAuth();
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    interests: '',
    travelStyle: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [connectingIds, setConnectingIds] = useState(new Set());

  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.interests) params.append('interests', filters.interests);
      if (filters.travelStyle) params.append('travelStyle', filters.travelStyle);

      const response = await axios.get(`http://localhost:5000/api/connect?${params}`);
      setTravelers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetUserId) => {
    try {
      if (!user || !token) {
        alert('Please log in to connect with travelers.');
        return;
      }
      if (targetUserId === user._id) return;
      setConnectingIds(prev => new Set(prev).add(targetUserId));
      await axios.post('http://localhost:5000/api/connect/connect', { targetUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTravelers(prev => prev.map(t => t._id === targetUserId ? { ...t, connectionStatus: 'pending' } : t));
      alert('Connection request sent!');
    } catch (error) {
      console.error('Error connecting with user:', error);
      alert('Failed to send connection request. Please try again.');
    } finally {
      setConnectingIds(prev => { const next = new Set(prev); next.delete(targetUserId); return next; });
    }
  };

  const filteredTravelers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return travelers;
    return travelers.filter(traveler =>
      traveler.name?.toLowerCase().includes(term) ||
      (traveler.location && traveler.location.toLowerCase().includes(term)) ||
      (Array.isArray(traveler.interests) && traveler.interests.some(i => i.toLowerCase().includes(term)))
    );
  }, [travelers, searchTerm]);

  if (loading) return <Loader />;

  return (
    <div className="connect-travelers-page">
      <div className="container">
        <h1>Connect With Fellow Travelers</h1>
        <p className="subtitle">Find and connect with other travelers who share your interests and destinations.</p>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, location, or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
            </select>

            <select
              value={filters.travelStyle}
              onChange={(e) => setFilters({...filters, travelStyle: e.target.value})}
            >
              <option value="">All Travel Styles</option>
              <option value="Budget">Budget</option>
              <option value="Luxury">Luxury</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Family">Family</option>
            </select>

            <button onClick={fetchTravelers} className="filter-btn">Apply Filters</button>
          </div>
        </div>

        {/* Travelers Grid */}
        <div className="travelers-grid">
          {filteredTravelers.length === 0 ? (
            <div className="no-results">
              <p>No travelers found matching your criteria.</p>
            </div>
          ) : (
            filteredTravelers.map((traveler) => (
              <div key={traveler._id} className="traveler-card">
                <div className="traveler-avatar">
                  {traveler.profilePicture ? (
                    <img src={traveler.profilePicture} alt={traveler.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {traveler.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="traveler-info">
                  <h3>{traveler.name}</h3>
                  <p className="location">📍 {traveler.location || 'Location not specified'}</p>
                  
                  {traveler.travelStyle && (
                    <span className="travel-style">{traveler.travelStyle} Traveler</span>
                  )}

                  {traveler.interests && traveler.interests.length > 0 && (
                    <div className="interests">
                      {traveler.interests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="interest-tag">{interest}</span>
                      ))}
                      {traveler.interests.length > 3 && (
                        <span className="interest-tag">+{traveler.interests.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {traveler.bio && (
                    <p className="bio">{traveler.bio.substring(0, 100)}...</p>
                  )}

                  <div className="languages">
                    {traveler.languages && traveler.languages.length > 0 && (
                      <span>🗣️ {traveler.languages.join(', ')}</span>
                    )}
                  </div>
                </div>

                <div className="traveler-actions">
                  <Link to={`/connect/${traveler._id}`} className="view-profile-btn">
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleConnect(traveler._id)}
                    className="connect-btn"
                    disabled={
                      !user ||
                      traveler._id === user?._id ||
                      traveler.connectionStatus === 'pending' ||
                      traveler.connectionStatus === 'accepted' ||
                      connectingIds.has(traveler._id)
                    }
                    title={!user ? 'Login required' : traveler._id === user?._id ? 'This is you' : ''}
                  >
                    {traveler._id === user?._id && 'You'}
                    {traveler._id !== user?._id && (
                      connectingIds.has(traveler._id)
                        ? 'Sending...'
                        : traveler.connectionStatus === 'pending'
                          ? 'Pending'
                          : traveler.connectionStatus === 'accepted'
                            ? 'Connected'
                            : 'Connect'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectWithTravelers;
