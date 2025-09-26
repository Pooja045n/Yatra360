import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserConnections();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/connect/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConnections = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/connect/${id}/connections`);
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching user connections:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const currentUserId = '66b1234567890abcdef12345'; // Replace with actual user ID from auth
      
      await axios.post('http://localhost:5000/api/connect/connect', {
        userId: currentUserId,
        targetUserId: id
      });
      
      alert('Connection request sent successfully!');
    } catch (error) {
      console.error('Error connecting with user:', error);
      alert('Failed to send connection request. Please try again.');
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="user-profile-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Travelers
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="location">📍 {user.location || 'Location not specified'}</p>
            
            {user.travelStyle && (
              <span className="travel-style">{user.travelStyle} Traveler</span>
            )}

            <div className="profile-actions">
              <button onClick={handleConnect} className="connect-btn">
                Connect
              </button>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {user.bio && (
            <div className="section">
              <h3>About</h3>
              <p>{user.bio}</p>
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div className="section">
              <h3>Travel Interests</h3>
              <div className="interests">
                {user.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {user.languages && user.languages.length > 0 && (
            <div className="section">
              <h3>Languages</h3>
              <div className="languages">
                {user.languages.map((language, index) => (
                  <span key={index} className="language-tag">{language}</span>
                ))}
              </div>
            </div>
          )}

          {user.socialMedia && Object.keys(user.socialMedia).some(key => user.socialMedia[key]) && (
            <div className="section">
              <h3>Social Media</h3>
              <div className="social-links">
                {user.socialMedia.instagram && (
                  <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                    📷 Instagram
                  </a>
                )}
                {user.socialMedia.facebook && (
                  <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                    📘 Facebook
                  </a>
                )}
                {user.socialMedia.twitter && (
                  <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                    🐦 Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          {connections.length > 0 && (
            <div className="section">
              <h3>Connections ({connections.length})</h3>
              <div className="connections-grid">
                {connections.slice(0, 6).map((connection) => (
                  <div key={connection._id} className="connection-card">
                    <div className="connection-avatar">
                      {connection.profilePicture ? (
                        <img src={connection.profilePicture} alt={connection.name} />
                      ) : (
                        <div className="avatar-placeholder small">
                          {connection.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="connection-info">
                      <h5>{connection.name}</h5>
                      <p>{connection.location}</p>
                    </div>
                  </div>
                ))}
                {connections.length > 6 && (
                  <div className="more-connections">
                    +{connections.length - 6} more connections
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
