import React, { useState, useEffect, useCallback } from 'react';
import './PersonalizedRecommendations.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../services/analytics';

const PersonalizedRecommendations = ({ userId, userPreferences, currentLocation }) => {
  const { user, token } = useAuth();
  const effectiveUserId = userId || user?.id || user?._id || null;
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [recommendationType, setRecommendationType] = useState('hybrid');
  const { post: track } = useAnalytics();
  const [toast, setToast] = useState(null);
  const [draftCount, setDraftCount] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('itineraryDraft')||'[]')).length; } catch { return 0; }
  });

  // Note: Previously had mock behavioral and feature maps; removed to avoid unused variables.

  // User-generated content for social recommendations
  const socialRecommendations = [
    {
      source: 'traveler_reviews',
      destination: 'Rishikesh, Uttarakhand',
      reason: 'Highly rated by adventure seekers like you',
      rating: 4.8,
      reviewCount: 1250,
      tags: ['adventure', 'spiritual', 'river rafting']
    },
    {
      source: 'similar_users',
      destination: 'Hampi, Karnataka',
      reason: 'Users with similar interests loved this place',
      rating: 4.7,
      reviewCount: 890,
      tags: ['heritage', 'photography', 'backpacking']
    }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Fallback reason builder for backend responses that do not include a `reasons` array
  const buildDefaultReasons = (rec) => {
    const out = [];
    if (rec.type === 'content') out.push('Feature similarity match');
    if (rec.type === 'collaborative') out.push('Similar travelers liked this');
    if (rec.type === 'hybrid') out.push('Blended content + behavior score');
    if (rec.confidence != null) out.push(`Confidence ${(rec.confidence * 100).toFixed(0)}%`);
    if (!out.length) out.push('Recommended for you');
    return out.slice(0, 3);
  };

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const limit = 8;
      let recs = [];
      // Only call protected endpoints if we truly have a token. Do NOT send userId explicitly – backend derives from JWT.
      if (token) {
        const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
        let url = `${base}/api/recommendations/hybrid`;
        if (recommendationType === 'collaborative') url = `${base}/api/recommendations/collaborative`;
        else if (recommendationType === 'content') url = `${base}/api/recommendations/content`;
        const { data } = await axios.get(url, { params: { limit }, headers: { Authorization: `Bearer ${token}` } });
        recs = Array.isArray(data) ? data : [];
      }
      // Local fallback (guest or empty server result)
      if (!recs.length) {
        if (recommendationType === 'collaborative') recs = generateCollaborativeRecommendations();
        else if (recommendationType === 'content') recs = generateContentBasedRecommendations();
        else if (recommendationType === 'location') recs = generateLocationBasedRecommendations();
        else recs = generateHybridRecommendations();
      }
      // Normalize reasons so UI never breaks if backend omits them
      const normalized = recs.map(r => ({
        ...r,
        reasons: Array.isArray(r.reasons) && r.reasons.length ? r.reasons.slice(0, 5) : buildDefaultReasons(r)
      }));
      setRecommendations(normalized);
    } catch (e) {
      let recs = [];
      if (recommendationType === 'collaborative') recs = generateCollaborativeRecommendations();
      else if (recommendationType === 'content') recs = generateContentBasedRecommendations();
      else if (recommendationType === 'location') recs = generateLocationBasedRecommendations();
      else recs = generateHybridRecommendations();
      const normalized = recs.map(r => ({ ...r, reasons: buildDefaultReasons(r) }));
      setRecommendations(normalized);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [recommendationType, token, initialLoad]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // Track impressions when list updates
  useEffect(() => {
    if (!loading && recommendations?.length) {
      recommendations.forEach((rec) => {
        track('rec_impression', { id: rec.id, type: rec.type, score: rec.confidence }, 'recommendations');
      });
    }
  }, [loading, recommendations, track]);

  // generateRecommendations is defined via useCallback above

  const generateCollaborativeRecommendations = () => {
    // Find users with similar behavior and recommend their liked destinations
    return [
      {
        id: 1,
        type: 'collaborative',
        destination: 'Ladakh, Jammu & Kashmir',
        title: 'Adventure Paradise',
        description: 'Users who visited Rajasthan and Kerala also loved Ladakh for its unique landscape and adventure opportunities.',
        image: '/images/ladakh.jpg',
        confidence: 0.92,
        reasons: ['Similar users loved this', 'Matches your adventure preference'],
        details: {
          bestTime: 'May to September',
          duration: '7-10 days',
          budget: '₹35,000 - ₹60,000',
          highlights: ['Pangong Lake', 'Nubra Valley', 'Monasteries']
        }
      },
      {
        id: 2,
        type: 'collaborative',
        destination: 'Hampi, Karnataka',
        title: 'Historical Marvel',
        description: 'Heritage lovers who enjoyed Rajasthan found Hampi equally fascinating with its ancient ruins and stories.',
        image: '/images/hampi.jpg',
        confidence: 0.88,
        reasons: ['Heritage enthusiasts recommend', 'Similar historical significance'],
        details: {
          bestTime: 'October to March',
          duration: '3-4 days',
          budget: '₹8,000 - ₹15,000',
          highlights: ['Virupaksha Temple', 'Stone Chariot', 'Royal Enclosure']
        }
      }
    ];
  };

  const generateContentBasedRecommendations = () => {
    // Recommend based on features of previously liked destinations
    return [
      {
        id: 3,
        type: 'content',
        destination: 'Jodhpur, Rajasthan',
        title: 'Blue City Extension',
        description: 'Since you loved Rajasthan, explore more royal heritage in the magnificent Blue City of Jodhpur.',
        image: '/images/jodhpur.jpg',
        confidence: 0.95,
        reasons: ['Same state as your favorite', 'Similar royal heritage', 'Desert culture match'],
        details: {
          bestTime: 'October to March',
          duration: '2-3 days',
          budget: '₹12,000 - ₹25,000',
          highlights: ['Mehrangarh Fort', 'Blue Houses', 'Umaid Bhawan Palace']
        }
      },
      {
        id: 4,
        type: 'content',
        destination: 'Kumarakom, Kerala',
        title: 'Backwater Bliss',
        description: 'Experience more of Kerala\'s natural beauty with serene backwaters and bird sanctuary.',
        image: '/images/kumarakom.jpg',
        confidence: 0.89,
        reasons: ['Same tropical climate', 'Natural beauty focus', 'Relaxation match'],
        details: {
          bestTime: 'November to February',
          duration: '2-3 days',
          budget: '₹15,000 - ₹30,000',
          highlights: ['Vembanad Lake', 'Bird Sanctuary', 'Luxury Resorts']
        }
      }
    ];
  };

  const generateSocialRecommendations = () => {
    return socialRecommendations.map((rec, index) => ({
      id: index + 5,
      type: 'social',
      destination: rec.destination,
      title: `Community Favorite`,
      description: rec.reason,
      image: rec.tags.includes('adventure') ? '/images/adventure.jpg' : rec.tags.includes('heritage') ? '/images/heritage.jpg' : '/images/community.jpg',
      confidence: rec.rating / 5,
      reasons: [`${rec.rating} stars from ${rec.reviewCount} reviews`, 'Trending among similar travelers'],
      details: {
        tags: rec.tags,
        source: rec.source,
        rating: rec.rating,
        reviewCount: rec.reviewCount
      }
    }));
  };

  const generateLocationBasedRecommendations = () => {
    // Recommend based on current location and proximity
    const locationDistance = currentLocation || 'Delhi';
    
    return [
      {
        id: 7,
        type: 'location',
        destination: 'Agra, Uttar Pradesh',
        title: 'Iconic Wonder Nearby',
        description: `Just 3 hours from ${locationDistance}, visit the world-famous Taj Mahal and Mughal heritage.`,
        image: '/images/agra.jpg',
        confidence: 0.85,
        reasons: ['Close to your location', 'Easy day trip', 'Must-visit landmark'],
        details: {
          distance: '230 km from Delhi',
          travelTime: '3 hours by car',
          budget: '₹5,000 - ₹12,000',
          highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri']
        }
      },
      {
        id: 8,
        type: 'location',
        destination: 'Rishikesh, Uttarakhand',
        title: 'Adventure Gateway',
        description: `5 hours from ${locationDistance}, perfect for weekend adventure and spiritual retreat.`,
        image: '/images/rishikesh.jpg',
        confidence: 0.82,
        reasons: ['Weekend getaway distance', 'Adventure activities', 'Spiritual significance'],
        details: {
          distance: '240 km from Delhi',
          travelTime: '5-6 hours by car',
          budget: '₹8,000 - ₹18,000',
          highlights: ['River Rafting', 'Yoga Capital', 'Lakshman Jhula']
        }
      }
    ];
  };

  const generateHybridRecommendations = () => {
    // Combine all recommendation types with weighted scoring
    const collaborative = generateCollaborativeRecommendations();
    const content = generateContentBasedRecommendations();
    const social = generateSocialRecommendations().slice(0, 1);
    const location = generateLocationBasedRecommendations().slice(0, 1);
    
    return [...collaborative, ...content, ...social, ...location]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  };

  const getTypeLabel = (type) => {
    const map = { hybrid: 'Hybrid AI', collaborative: 'Similar Travelers', content: 'Feature Match', social: 'Social Trend', location: 'Near You' };
    return map[type] || type;
  };

  const getTypeAccent = (type) => {
    switch(type){
      case 'collaborative': return '168,85,247'; // purple
      case 'content': return '34,197,94'; // green
      case 'social': return '244,114,182'; // rose
      case 'location': return '14,165,233'; // sky
      case 'hybrid': return '249,115,22'; // orange
      default: return '71,85,105';
    }
  };

  const buildScoreStyle = (confidence, type) => {
    const deg = Math.min(360, Math.max(0, confidence * 360));
    const accent = getTypeAccent(type);
    return { background: `conic-gradient(rgba(${accent},0.95) ${deg}deg, rgba(255,255,255,0.12) ${deg}deg 360deg)` };
  };

  // Map requested image names to ones that actually exist in /public/images
  const existingImageMap = {
    '/images/jodhpur.jpg': '/images/rajasthan.jpg',
    '/images/kumarakom.jpg': '/images/kerala.jpg',
    '/images/adventure.jpg': '/images/himachal-pradesh.jpg',
    '/images/community.jpg': '/images/heritage.jpg',
    '/images/agra.jpg': '/images/delhi.jpg', // placeholder similar theme
    '/images/rishikesh.jpg': '/images/himachal-pradesh.jpg'
  };

  const ensureExistingImage = (path) => existingImageMap[path] || path;

  const handleAddToItinerary = (rec) => {
    try {
      // Minimal client-side draft storage until itinerary UI is built
      const existing = JSON.parse(localStorage.getItem('itineraryDraft') || '[]');
      if (!existing.find(r => r.id === rec.id)) {
        existing.push({
          id: rec.id,
          destination: rec.destination,
          title: rec.title,
          bestTime: rec.details?.bestTime,
          duration: rec.details?.duration,
          budget: rec.details?.budget,
          addedAt: Date.now()
        });
        localStorage.setItem('itineraryDraft', JSON.stringify(existing));
        setDraftCount(existing.length);
        showToast(`${rec.destination.split(',')[0]} added to draft itinerary`);
      }
      track('rec_add_to_itinerary_local', { id: rec.id, type: rec.type }, 'recommendations');
    } catch(e) {
      // swallow for now
    }
  };

  const handleDetails = (rec) => {
    track('rec_details_open', { id: rec.id, type: rec.type }, 'recommendations');
    // Placeholder: integrate with modal or navigate when detailed route exists
    // navigate(`/destination/${normalizeSlug(rec.destination)}`)
    // Could set a selected recommendation state if a modal is introduced
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(current => (current && current.id === toast?.id ? null : current));
    }, 3200);
  };

  const backgroundImageUrl = `${process.env.PUBLIC_URL || ''}/images/personalBackground.jpg`;

  return (
    <section className="personalized-recommendations-section">
      <div className="rec-bg-layer" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      <div className="rec-bg-overlay" />
      <div className="rec-inner">
    <div className="personalized-recommendations">
      {toast && (
        <div className="toast-container" role="alert" aria-live="polite">
          <div className="toast" data-type={toast.type}>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>×</button>
            <div className="toast-bar" />
          </div>
        </div>
      )}
      <div className="recommendations-header">
        <h2>Personalized Recommendations</h2>
        <p>Adaptive suggestions blending traveler similarity, content features, social proof & proximity.</p>
        <div className="recommendation-filters" role="tablist" aria-label="Recommendation types">
          {['hybrid', 'collaborative', 'content', 'social', 'location'].map(type => {
            const active = recommendationType === type;
            return (
              <button
                key={type}
                role="tab"
                aria-selected={active}
                className={`filter-btn ${active ? 'active' : ''}`}
                onClick={() => setRecommendationType(type)}
                style={{ '--accent': getTypeAccent(type) }}
              >
                <span className="filter-dot" />
                <span className="filter-label">{getTypeLabel(type)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {draftCount > 0 && (
        <div className="draft-itinerary-banner" role="status" aria-live="polite">
          <span>{draftCount} item{draftCount>1?'s':''} in draft itinerary.</span>
          <button className="view-draft-btn" onClick={() => showToast('Draft itinerary page coming soon')}>View Draft Itinerary</button>
        </div>
      )}

      {loading ? (
        <div className={`recommendations-grid ${initialLoad ? 'skeleton-phase' : ''}`} aria-live="polite" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="recommendation-card skeleton-card">
              <div className="rec-media skeleton-block" />
              <div className="card-content">
                <div className="skeleton-line w-60" />
                <div className="skeleton-line w-40" />
                <div className="skeleton-line w-90" />
                <div className="skeleton-line w-80" />
                <div className="skeleton-tag-row">
                  <span className="skeleton-pill" />
                  <span className="skeleton-pill" />
                  <span className="skeleton-pill" />
                </div>
              </div>
              <div className="card-actions skeleton-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="recommendations-grid" aria-live="polite" aria-busy="false">
          {recommendations.map(recommendation => {
            const percent = Math.round(recommendation.confidence * 100);
            let safeImage = recommendation.image;
            if (safeImage && safeImage.startsWith('/images/')) {
              safeImage = ensureExistingImage(safeImage);
            } else if (safeImage && !safeImage.startsWith('http')) {
              // If image is just a file name like 'foo.jpg'
              safeImage = ensureExistingImage(`/images/${safeImage}`);
            }
            return (
              <div key={recommendation.id} className={`recommendation-card type-${recommendation.type}`} style={{ '--accent': getTypeAccent(recommendation.type) }}>
                <div className="rec-media">
                  {safeImage ? (
                    <img src={safeImage} alt={recommendation.destination} loading="lazy" />
                  ) : (
                    <div className="media-fallback">{recommendation.destination.charAt(0)}</div>
                  )}
                  <div className="rec-overlay" />
                  <div className="rec-gradient" />
                  <div className="rec-badges">
                    <span className="rec-type-badge">{getTypeLabel(recommendation.type)}</span>
                    <span className="rec-score" aria-label={`Match score ${percent}%`}>
                      <span className="score-ring" style={buildScoreStyle(recommendation.confidence, recommendation.type)} />
                      <span className="score-text">{percent}<span className="pct">%</span></span>
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="destination-name">{recommendation.destination}</h3>
                  <h4 className="destination-title">{recommendation.title}</h4>
                  <p className="destination-description">{recommendation.description}</p>

                  <div className="tags-row">
                    {recommendation.details?.highlights?.slice(0,3).map((h, i) => (
                      <span key={i} className="mini-tag">{h}</span>
                    ))}
                    {recommendation.details?.tags?.slice(0,3).map((t, i) => (
                      <span key={`t-${i}`} className="mini-tag alt">{t}</span>
                    ))}
                  </div>

                  <div className="recommendation-reasons">
                    <ul>
                      {(recommendation.reasons || []).slice(0,3).map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.details && (
                    <div className="destination-details">
                      {recommendation.details.bestTime && (
                        <div className="detail-item"><span className="detail-label">Best:</span><span className="detail-value">{recommendation.details.bestTime}</span></div>
                      )}
                      {recommendation.details.duration && (
                        <div className="detail-item"><span className="detail-label">Stay:</span><span className="detail-value">{recommendation.details.duration}</span></div>
                      )}
                      {recommendation.details.budget && (
                        <div className="detail-item"><span className="detail-label">Budget:</span><span className="detail-value">{recommendation.details.budget}</span></div>
                      )}
                      {recommendation.details.distance && (
                        <div className="detail-item"><span className="detail-label">Dist:</span><span className="detail-value">{recommendation.details.distance}</span></div>
                      )}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button className="btn-primary" onClick={() => handleDetails(recommendation)}>Details</button>
                  <button className="btn-secondary" onClick={() => handleAddToItinerary(recommendation)}>Add</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="recommendations-info">
        <h3>How The Engine Thinks</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Similar Travelers</h4>
            <p>Patterns from travelers with overlapping interaction histories unlock serendipitous finds.</p>
          </div>
            <div className="info-item">
            <h4>Feature Matching</h4>
            <p>Vector similarity across attributes (region, vibe, activities) surfaces aligned destinations.</p>
          </div>
          <div className="info-item">
            <h4>Social Momentum</h4>
            <p>Weighted signals from ratings, review velocity & current buzz adjust ranking sensitivity.</p>
          </div>
          <div className="info-item">
            <h4>Context & Proximity</h4>
            <p>Location & temporal context adapt suggestions for realistic, actionable travel windows.</p>
          </div>
        </div>
      </div>
    </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
