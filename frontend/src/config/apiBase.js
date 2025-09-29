// Central API base resolution for production & development
// Priority: explicit REACT_APP_API_BASE -> same-origin fallback
const API_BASE = process.env.REACT_APP_API_BASE || '';

// Helper to build full URLs; if path already starts with http just return it
export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  if (API_BASE) return `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  return path; // same-origin proxy or relative fetch fallback
}

export { API_BASE };
