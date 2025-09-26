import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import './Guides.css';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    region: '',
    search: ''
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/guides');
      setGuides(response.data);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setGuides([]); // Set empty array if API fails
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const name = guide.name || '';
    const region = guide.region || '';
    const specializations = guide.specializations || [];
    const type = guide.type || '';
    
    return (
      (filters.type === '' || type === filters.type) &&
      (filters.region === '' || region.toLowerCase().includes(filters.region.toLowerCase())) &&
      (filters.search === '' || 
        name.toLowerCase().includes(filters.search.toLowerCase()) ||
        specializations.some(spec => spec && spec.toLowerCase().includes(filters.search.toLowerCase())) ||
        region.toLowerCase().includes(filters.search.toLowerCase())
      )
    );
  });

  const handleContact = (guide) => {
    if (guide.type === 'Virtual') {
      alert(`Starting virtual session: ${guide.name}`);
    } else {
      window.open(`tel:${guide.contact}`, '_self');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="guides-page">
      <div className="container">
        <div className="header">
          <h1>Travel Guides</h1>
          <p>Connect with expert local guides for authentic travel experiences</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search guides, specializations, or regions..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="filter-controls">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="Physical">Physical Guides</option>
              <option value="Virtual">Virtual Guides</option>
            </select>

            <select
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
            >
              <option value="">All Regions</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Kerala">Kerala</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Jammu & Kashmir">Jammu & Kashmir</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Goa">Goa</option>  
              <option value="Punjab">Punjab</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Odisha">Odisha</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Assam">Assam</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            </select>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="guides-grid">
          {filteredGuides.length === 0 ? (
            <div className="no-results">
              <h3>No guides found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div key={guide._id} className="guide-card">
                <div className="guide-header">
                  <div className="guide-avatar">
                    {guide.profileImage ? (
                      <img src={guide.profileImage} alt={guide.name} onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }} />
                    ) : null}
                    <div className="avatar-placeholder" style={{display: guide.profileImage ? 'none' : 'flex'}}>
                      {guide.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="guide-info">
                    <h3>{guide.name || 'Unknown Guide'}</h3>
                    <div className="guide-type">
                      <span className={`type-badge ${(guide.type || 'physical').toLowerCase()}`}>
                        {guide.type === 'Virtual' ? '🖥️ Virtual' : '👤 Physical'}
                      </span>
                    </div>
                  </div>

                  <div className="rating">
                    <span className="stars">⭐ {guide.rating || 4.0}</span>
                  </div>
                </div>

                <div className="guide-details">
                  <div className="location">
                    <span>📍 {guide.city || guide.location || 'Unknown'}, {guide.region || 'Unknown Region'}</span>
                  </div>

                  <div className="experience">
                    <span>🎯 {guide.experience || '1 year'} experience</span>
                  </div>

                  <div className="specializations">
                    <h4>Specializations:</h4>
                    <div className="spec-tags">
                      {(guide.specializations || []).slice(0, 3).map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))}
                      {(guide.specializations || []).length > 3 && (
                        <span className="spec-tag">+{(guide.specializations || []).length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="languages">
                    <span>🗣️ {(guide.languages || []).join(', ') || 'Not specified'}</span>
                  </div>

                  <div className="description">
                    <p>{guide.description || 'No description available.'}</p>
                  </div>

                  <div className="pricing">
                    <span className="price">{guide.price || 'Contact for pricing'}</span>
                  </div>
                </div>

                <div className="guide-actions">
                  <button 
                    onClick={() => handleContact(guide)}
                    className="contact-btn"
                  >
                    {guide.type === 'Virtual' ? 'Start Virtual Tour' : 'Contact Guide'}
                  </button>
                  
                  {guide.email && guide.type === 'Physical' && (
                    <a href={`mailto:${guide.email}`} className="email-btn">
                      📧 Email
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Guides;
