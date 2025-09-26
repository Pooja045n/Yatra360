import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-banner">
        <h1>Welcome to Yatra360</h1>
        <p>Your Tourmate for Incredible India 🇮🇳</p>
        <Link to="/explore" className="btn-explore">Start Exploring</Link>
      </header>

      <section className="features-grid">
        <Link to="/explore" className="feature-card">🌍 Explore Destinations</Link>
        <Link to="/places" className="feature-card">📍 Discover Places</Link>
        <Link to="/guides" className="feature-card">🧭 Local Guides</Link>
        <Link to="/festivals" className="feature-card">🎉 Festivals</Link>
        <Link to="/alerts" className="feature-card">🚨 Live Alerts</Link>
        <Link to="/itinerary" className="feature-card">🗺️ Plan Itinerary</Link>
        <Link to="/budget-planner" className="feature-card">💰 Budget Planner</Link>
        <Link to="/currency-converter" className="feature-card">💱 Currency Converter</Link>
        <Link to="/travel-buddy" className="feature-card">🤝 Connect with Travelers</Link>
      </section>
    </div>
  );
};

export default Home;
