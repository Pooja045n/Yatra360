import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Festivals.css';

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [regions, setRegions] = useState([]);
  const [view, setView] = useState('grid'); // grid | calendar
  const [icsGenerating, setIcsGenerating] = useState(false);

  useEffect(() => {
    fetchFestivals();
    fetchRegions();
  }, []);

  const fetchFestivals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/festivals');
      setFestivals(response.data);
    } catch (error) {
      console.error('Error fetching festivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/regions');
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredFestivals = festivals.filter(festival => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = festival.name.toLowerCase().includes(s) ||
                         festival.description.toLowerCase().includes(s);
    const matchesRegion = selectedRegion === 'all' || festival.region === selectedRegion;
    const matchesMonth = selectedMonth === 'all' || festival.month === selectedMonth;
    
    return matchesSearch && matchesRegion && matchesMonth;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getDaysUntil = (festivalDate) => {
    const today = new Date();
    const festival = new Date(festivalDate);
    const diffTime = festival - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const exportICS = () => {
    setIcsGenerating(true);
    try {
      const lines = [ 'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Yatra360//Festivals//EN'];
      filteredFestivals.forEach(f => {
        if(!f.date) return;
        const date = new Date(f.date);
        const dt = date.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        lines.push('BEGIN:VEVENT');
        lines.push('UID:'+f._id+'@yatra360');
        lines.push('DTSTAMP:'+dt);
        lines.push('DTSTART:'+dt);
        lines.push('SUMMARY:'+f.name.replace(/,/g,' '));
        lines.push('DESCRIPTION:'+(f.description||'').replace(/\n/g,' '));
        lines.push('END:VEVENT');
      });
      lines.push('END:VCALENDAR');
      const blob = new Blob([lines.join('\r\n')], { type:'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='festivals.ics'; a.click(); URL.revokeObjectURL(url);
    } finally { setTimeout(()=>setIcsGenerating(false),400); }
  };

  if (loading) {
    return (
      <div className="festivals-page">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading festivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="festivals-page">
      <div className="header">
        <h1>Indian Festivals</h1>
        <p>Discover the vibrant celebrations and cultural heritage of India</p>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search festivals by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region._id} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {months.map(month => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <div className="view-toggle">
            <button className={view==='grid'? 'active':''} onClick={()=>setView('grid')}>Grid</button>
            <button className={view==='calendar'? 'active':''} onClick={()=>setView('calendar')}>Calendar</button>
            <button disabled={icsGenerating || filteredFestivals.length===0} onClick={exportICS}>{icsGenerating? 'Generating...':'Export .ICS'}</button>
          </div>
        </div>
      </div>

      {view==='grid' && (
        <div className="festivals-grid">
          {filteredFestivals.length > 0 ? (
            filteredFestivals.map(festival => (
              <div key={festival._id} className="festival-card">
                <div className="festival-image">
                  {festival.image ? (
                    <img src={festival.image} alt={festival.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span>🎭</span>
                    </div>
                  )}
                  <div className="festival-badge">
                    <span className="region-badge">{festival.region}</span>
                    <span className="month-badge">{festival.month}</span>
                  </div>
                </div>

                <div className="festival-content">
                  <div className="festival-header">
                    <h3>{festival.name}</h3>
                    <div className="festival-date">
                      <span className="date">{formatDate(festival.date)}</span>
                      <span className="countdown">{getDaysUntil(festival.date)}</span>
                    </div>
                  </div>

                  <p className="festival-description">{festival.description}</p>

                  <div className="festival-details">
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{festival.duration} days</span>
                    </div>
                    
                    {festival.significance && (
                      <div className="detail-item">
                        <span className="label">Significance:</span>
                        <span className="value">{festival.significance}</span>
                      </div>
                    )}

                    {festival.traditions && festival.traditions.length > 0 && (
                      <div className="traditions">
                        <span className="label">Traditions:</span>
                        <div className="tradition-tags">
                          {festival.traditions.map((tradition, index) => (
                            <span key={index} className="tradition-tag">
                              {tradition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="festival-actions">
                    <button className="learn-more-btn">
                      Learn More
                    </button>
                    <button className="add-calendar-btn" onClick={()=> { setSearchTerm(festival.name); }}>
                      Focus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No festivals found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}

      {view==='calendar' && (
        <div className="festival-calendar-view">
          <div className="calendar-grid">
            {months.map(m => {
              const monthFest = filteredFestivals.filter(f=>f.month===m);
              return (
                <div key={m} className="calendar-month">
                  <h4>{m}</h4>
                  <div className="month-festivals">
                    {monthFest.length === 0 ? (
                      <span className="empty">—</span>
                    ) : (
                      monthFest.slice(0,6).map(f => (
                        <div key={f._id} className="calendar-festival" title={f.name}>
                          {f.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Festivals;
