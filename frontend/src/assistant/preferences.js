const LS_KEY = 'assistantPreferences';

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { budgetTier: null, interests: [] };
    const parsed = JSON.parse(raw);
    return {
      budgetTier: parsed.budgetTier || null,
      interests: Array.isArray(parsed.interests) ? parsed.interests : []
    };
  } catch { return { budgetTier: null, interests: [] }; }
}

export function savePreferences(prefs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(prefs)); } catch {}
}

export function updatePreferences(update) {
  const current = loadPreferences();
  const merged = { ...current, ...update };
  savePreferences(merged);
  return merged;
}

export function addInterests(newInterests) {
  const current = loadPreferences();
  const set = new Set(current.interests.map(i=>i.toLowerCase()));
  newInterests.forEach(i => set.add(i.toLowerCase()));
  const merged = { ...current, interests: [...set] };
  savePreferences(merged);
  return merged;
}
