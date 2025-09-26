import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import PlaceCard from '../components/PlaceCard';
import './Places.css';

const categories = ['All', 'Historical', 'Nature', 'Adventure'];

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:5000/api/places') // Update this to your actual backend URL
      .then(res => {
        setPlaces(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFiltered(places);
    } else {
      setFiltered(places.filter(place => place.category === category));
    }
  };

 if (loading) return <Loader />;

  return (
    <div className="places-page">
      <h2>Popular Places in India</h2>

      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={cat === selectedCategory ? 'active' : ''}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="places-grid">
        {filtered.map(place => (
          <PlaceCard key={place._id} place={place} />
        ))}
      </div>
    </div>
  );
};

export default Places;
