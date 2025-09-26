import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './PlaceCard.css';

const PlaceCard = ({ place }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rated, setRated] = useState(null); // number or null
  const debounceRef = useRef(null);
  const [toast, setToast] = useState('');

  const base = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:5000', []);

  const redirectToLogin = () => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirect}`);
  };

  const postInteraction = async (action, value) => {
    try {
      setSaving(true);
      await axios.post(`${base}/api/recommendations/interactions`, {
        itemType: 'place',
        itemId: place._id,
        action,
        value,
        metadata: { name: place.name, category: place.category }
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    } catch (e) {
      // log but do not block UI
      // console.error('Failed to record interaction', e);
    } finally {
      setSaving(false);
    }
  };

  const debouncedPost = useCallback((action, value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { postInteraction(action, value); }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, token, user, place?._id]);

  const emitInteraction = useCallback((action, value) => {
    if (!user) {
      setToast('Please login to save your preferences');
      setTimeout(() => setToast(''), 1500);
      setTimeout(() => redirectToLogin(), 800);
      return;
    }
    // optimistic UI
    if (action === 'like') setLiked(true);
    if (action === 'bookmark') setSaved(true);
    if (action === 'rate') setRated(value || 5);
    // debounce network
    debouncedPost(action, value);
  }, [debouncedPost, user]);

  return (
    <div className="place-card">
      <Link to={`/places/${place._id}`} className="place-link">
        <img
          src={place.imageUrl || '/images/placeholder-image.jpeg'}
          alt={place.name || 'Place'}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={400}
          height={300}
          onError={(e)=>{ if(!e.target.dataset.fallback){ e.target.dataset.fallback='1'; e.target.src='/images/placeholder-image.jpeg'; } }}
        />
        <div className="place-info">
          <h3>{place.name}</h3>
          <p className="place-location">{place.location}</p>
          <span className="tag">{place.category}</span>
        </div>
      </Link>
      <div className="place-actions">
        <button className={`action-btn like ${liked ? 'active' : ''}`} disabled={saving} onClick={() => emitInteraction('like', 1)}>
          {liked ? '💖 Liked' : '❤️ Like'}
        </button>
        <button className={`action-btn bookmark ${saved ? 'active' : ''}`} disabled={saving} onClick={() => emitInteraction('bookmark', 1)}>
          {saved ? '📌 Saved' : '🔖 Save'}
        </button>
        <button className={`action-btn rate ${rated ? 'active' : ''}`} disabled={saving} onClick={() => emitInteraction('rate', 5)}>
          {rated ? `⭐ ${rated}/5` : '⭐ Rate'}
        </button>
      </div>
      {toast && <div className="place-toast">{toast}</div>}
    </div>
  );
};

export default PlaceCard;
