import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EnhancedHomePage.css';
import PersonalizedRecommendations from './PersonalizedRecommendations';

const EnhancedHomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const heroSlides = [
    {
      id: 1,
      title: "Incredible India Awaits",
      subtitle: "Discover millennia of heritage, living culture and natural diversity",
      image: "/images/delhi.jpg",
      overlay: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 100%)",
      cta: "Start Your Journey"
    },
    {
      id: 2,
      title: "Festival Energy & Tradition",
      subtitle: "Experience vibrant celebrations across every season",
      image: "/images/rajasthan.jpg",
      overlay: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.15) 100%)",
      cta: "Explore Festivals"
    },
    {
      id: 3,
      title: "Himalayan Adventures",
      subtitle: "From snow‑capped peaks to serene valleys and alpine meadows",
      image: "/images/himachal-pradesh.jpg",
      overlay: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)",
      cta: "Plan Adventure"
    }
  ];

  const quickSearchCategories = [
    { name: 'Heritage', query: 'heritage' },
    { name: 'Beaches', query: 'beaches' },
    { name: 'Mountains', query: 'mountains' },
    { name: 'Festivals', query: 'festivals' },
    { name: 'Cuisine', query: 'food' },
    { name: 'Road Trips', query: 'road trips' },
    { name: 'Adventure', query: 'adventure' },
    { name: 'Spiritual', query: 'spiritual' }
  ];

  const indianStates = [
    {
      name: "Rajasthan",
      tagline: "Land of Kings",
      image: "/images/rajasthan.jpg",
      theme: 'warm',
      highlights: ["Jaipur", "Udaipur", "Jaisalmer"],
      specialty: "Royal Palaces & Desert Safari"
    },
    {
      name: "Kerala",
      tagline: "God's Own Country",
      image: "/images/kerala.jpg",
      theme: 'green',
      highlights: ["Backwaters", "Spices", "Ayurveda"],
      specialty: "Houseboats & Natural Beauty"
    },
    {
      name: "Goa",
      tagline: "Pearl of the Orient",
      image: "/images/goa.jpg",
      theme: 'aqua',
      highlights: ["Beaches", "Nightlife", "Portuguese Heritage"],
      specialty: "Beaches & Vibrant Culture"
    },
    {
      name: "Himachal Pradesh",
      tagline: "Land of Gods",
      image: "/images/himachal-pradesh.jpg",
      theme: 'purple',
      highlights: ["Manali", "Shimla", "Dharamshala"],
      specialty: "Hill Stations & Adventure Sports"
    },
    {
      name: "Tamil Nadu",
      tagline: "Cradle of Culture",
      image: "/images/tamilnadu.jpg",
      theme: 'amber',
      highlights: ["Chennai", "Madurai", "Kanyakumari"],
      specialty: "Ancient Temples & Rich Heritage"
    },
    {
      name: "Maharashtra",
      tagline: "Gateway of India",
      image: "/images/maharashtra.jpg",
      theme: 'rose',
      highlights: ["Mumbai", "Pune", "Ajanta Caves"],
      specialty: "Bollywood & Business Hub"
    }
  ];

  const travelHighlights = [
    {
      category: "Festivals",
      cover: "/images/Festivals.jpg",
      title: "Celebrate with India",
      items: [
        { name: "Diwali", period: "Oct-Nov", description: "Festival of Lights" },
        { name: "Holi", period: "March", description: "Festival of Colors" },
        { name: "Durga Puja", period: "Sep-Oct", description: "Bengali Celebration" },
        { name: "Pushkar Fair", period: "November", description: "Camel Trading Fair" }
      ],
      theme: 'warm'
    },
    {
      category: "Cuisine",
      cover: "/images/cuisine.jpg",
      title: "Taste of India",
      items: [
        { name: "North Indian", type: "Butter Chicken, Naan", description: "Rich & Creamy" },
        { name: "South Indian", type: "Dosa, Sambar", description: "Spicy & Tangy" },
        { name: "Street Food", type: "Chaat, Vada Pav", description: "Quick & Flavorful" },
        { name: "Sweets", type: "Gulab Jamun, Jalebi", description: "Sweet Delights" }
      ],
      theme: 'green'
    },
    {
      category: "Heritage",
      cover: "/images/heritage.jpg",
      title: "Architectural Wonders",
      items: [
        { name: "Taj Mahal", location: "Agra", description: "Symbol of Love" },
        { name: "Red Fort", location: "Delhi", description: "Mughal Architecture" },
        { name: "Hampi", location: "Karnataka", description: "Vijayanagara Empire" },
        { name: "Ajanta Caves", location: "Maharashtra", description: "Buddhist Art" }
      ],
      theme: 'purple'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleSearch = (queryParam) => {
    const q = (queryParam !== undefined ? queryParam : searchQuery).trim();
    if (!q) return;
    navigate(`/explore?search=${encodeURIComponent(q)}`);
  };

  const handleQuickSearch = (category) => {
    // Ensure state reflects clicked category before navigation
    setSearchQuery(category.query);
    // Use microtask to allow input update render first
    queueMicrotask(() => handleSearch(category.query));
  };

  return (
    <div className="enhanced-home-page">
      {/* Hero Section with Sliding Banners */}
      <section className="hero-section">
        <div className="hero-container">
          {heroSlides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`hero-slide ${isActive ? 'active' : ''}`}
                style={{
                  backgroundImage: `${slide.overlay}, url(${slide.image})`
                }}
                aria-hidden={!isActive}
              >
                <div className="hero-overlay" />
                <div className="hero-content">
                  <div className="hero-text-panel">
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                    <div className="hero-actions">
                      <button
                        className="btn-hero-primary"
                        onClick={() => navigate('/explore')}
                      >
                        {slide.cta}
                      </button>
                      <button
                        className="btn-hero-secondary"
                        onClick={() => navigate('/planner')}
                      >
                        Plan Your Trip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-selected={index === currentSlide}
                role="tab"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-container">
            <h2>Find Your Perfect Destination</h2>
            <div className="search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, festivals, cuisines, guides..."
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-button"
                onClick={() => handleSearch()}
              >
                🔍 Search
              </button>
            </div>
            
            <div className="quick-search">
              <span className="quick-search-label">Quick Search:</span>
              <div className="quick-search-categories">
                {quickSearchCategories.map((category, index) => (
                  <button
                    key={index}
                    className="quick-search-btn"
                    onClick={() => handleQuickSearch(category)}
                  >
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="home-recommendations" style={{ padding: '32px 0' }}>
        <div className="container">
          <PersonalizedRecommendations />
        </div>
      </section>

      {/* States Showcase */}
      <section className="states-showcase">
        <div className="container">
          <h2 className="section-title">🇮🇳 Explore Incredible Indian States</h2>
          <p className="section-subtitle">Each state tells a unique story of culture, tradition, and natural beauty</p>
          
          <div className="states-grid">
            {indianStates.map((state, index) => (
              <div
                key={index}
                className={`state-card theme-${state.theme}`}
                onClick={() => navigate(`/explore/${state.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="state-media">
                  <img src={state.image} alt={state.name} loading="lazy" />
                  <div className="state-media-overlay" />
                  <div className="state-media-gradient" />
                  <div className="state-heading">
                    <h3 className="state-name">{state.name}</h3>
                    <p className="state-tagline">{state.tagline}</p>
                  </div>
                </div>
                <div className="state-content">
                  <p className="state-specialty">{state.specialty}</p>
                  <div className="state-highlights">
                    {state.highlights.map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">{highlight}</span>
                    ))}
                  </div>
                </div>
                <div className="state-action"><span className="explore-text">Explore {state.name}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Highlights */}
      <section className="travel-highlights">
        <div className="container">
          <h2 className="section-title">✨ Discover India's Rich Tapestry</h2>
          
          <div className="highlights-grid">
            {travelHighlights.map((highlight, index) => (
              <div
                key={index}
                className={`highlight-card theme-${highlight.theme}`}
              >
                <div className="highlight-cover">
                  <img src={highlight.cover} alt={highlight.category} loading="lazy" />
                  <div className="highlight-cover-overlay" />
                  <div className="highlight-cover-gradient" />
                  <div className="highlight-header">
                    <h3 className="highlight-category">{highlight.category}</h3>
                    <p className="highlight-title">{highlight.title}</p>
                  </div>
                </div>
                
                <div className="highlight-items">
                  {highlight.items.map((item, idx) => (
                    <div key={idx} className="highlight-item">
                      <div className="item-main">
                        <span className="item-name">{item.name}</span>
                        <span className="item-detail">
                          {item.period || item.type || item.location}
                        </span>
                      </div>
                      <p className="item-description">{item.description}</p>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="highlight-cta"
                  onClick={() => navigate('/explore')}
                >Explore More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-container">
            <div className="cta-content">
              <h2>Ready to Start Your Indian Adventure?</h2>
              <p>Join thousands of travelers who have discovered the magic of India with Yatra360</p>
              <div className="cta-buttons">
                <Link to="/explore" className="cta-btn primary">Explore Destinations</Link>
                <Link to="/planner" className="cta-btn secondary">Plan Your Trip</Link>
                <Link to="/connect" className="cta-btn tertiary">Connect with Travelers</Link>
              </div>
            </div>
            <div className="cta-stats">
              <div className="stat-item">
                <span className="stat-number">28+</span>
                <span className="stat-label">States Covered</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Destinations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Festivals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHomePage;
