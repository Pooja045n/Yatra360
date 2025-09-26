import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const useAnalytics = () => {
  const { token, user } = useAuth();

  const post = async (eventType, metadata = {}, context = '', sessionId) => {
    // If there's no auth token, skip analytics to avoid 401 noise in dev/guest sessions
    if (!token) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await axios.post(`${base}/api/analytics`, {
        eventType,
        metadata,
        context,
        sessionId,
        // userId not required; backend pulls from JWT if provided
      }, { headers });
    } catch (e) {
      // swallow errors in analytics path
    }
  };

  return { post, user };
};
