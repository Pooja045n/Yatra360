// /components/RegionHeader.jsx
import React from 'react';
import './RegionHeader.css';

const RegionHeader = ({ name, banner }) => {
  return (
    <div className="region-header" style={{ backgroundImage: `url(${banner})` }}>
      <div className="region-overlay">
        <h1>{name}</h1>
      </div>
    </div>
  );
};

export default RegionHeader;
