import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import './Explore.css';

const Explore = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetch('/data/regions.json') // this will be in public/data/regions.json
      .then((res) => res.json())
      .then((data) => {
        setRegions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="explore-page">
      <h1 className="explore-title">🌏 Explore Incredible India</h1>
      <p className="explore-subtitle">Discover places, festivals, and cultural heritage.</p>

      {/* Personalized recommendations moved to Home page */}

      <input
        type="text"
        className="explore-search"
        placeholder="Search by state name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="explore-grid">
        {filteredRegions.map((region) => (
          <Link key={region.id} to={`/explore/${region.id}`} className="explore-card">
            <img src={region.image} alt={region.name} className="explore-image" />
            <div className="explore-name">{region.name}</div>
          </Link>
        ))}
        
        {filteredRegions.length === 0 && <p>No regions match your search.</p>}
      </div>
    </div>
  );
};

export default Explore;
