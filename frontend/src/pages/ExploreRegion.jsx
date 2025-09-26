import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RegionHeader from '../components/RegionHeader';
import Loader from '../components/Loader';
import './ExploreRegion.css';
const ExploreRegion = () => {
  const { regionId } = useParams();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/regionsData.json')
      .then(res => res.json())
      .then(data => {
        setRegion(data[regionId]);
        setLoading(false);
      });
  }, [regionId]);


  if (loading) return <Loader />;
  if (!region) return <p>Region not found.</p>;

  return (
    <div className="region-detail-page">
      <RegionHeader name={region.name} banner={region.banner} />

      <div className="region-content">
        <p className="region-description">{region.description}</p>

        <div className="region-section">
          <h2>🌟 Popular Places</h2>
          <div className="card-grid">
            {region.popularPlaces && region.popularPlaces.map((place, idx) => (
              <div className="info-card" key={idx}>{place}</div>
            ))}
          </div>
        </div>

        <div className="region-section">
          <h2>🎉 Festivals</h2>
          <div className="card-grid">
            {region.festivals && region.festivals.map((fest, idx) => (
              <div className="info-card" key={idx}>{fest}</div>
            ))}
          </div>
        </div>

        <div className="region-section">
          <h2>📌 Facts</h2>
          <ul className="fact-list">
            {region.facts && region.facts.map((fact, idx) => (
              <li key={idx}>✅ {fact}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExploreRegion;
