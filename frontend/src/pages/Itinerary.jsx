import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Itinerary.css';

const emptyForm = { title: '', destinations: '', startDate: '', endDate: '', budget: '', notes: '' };

const Itinerary = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState('created-desc');
  const [filterText, setFilterText] = useState('');
  const [draftMerged, setDraftMerged] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const load = async () => {
    if (!token) { setItems([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/itineraries', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load itineraries');
      const data = await res.json();
      setItems(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  // One-time draft merge (from recommendations localStorage draft itinerary list)
  useEffect(() => {
    if (!token || draftMerged || loading) return; // wait until load finished
    try {
      const draftRaw = localStorage.getItem('itineraryDraft');
      if (draftRaw) {
        const draftList = JSON.parse(draftRaw);
        if (Array.isArray(draftList) && draftList.length) {
          // Create a synthetic itinerary if user wants to keep drafts separate
          const already = items.some(i => i.title === 'Draft Collection');
          if (!already) {
            (async () => {
              try {
                const payload = { title: 'Draft Collection', destinations: draftList.map(d=> d.destination?.split(',')[0] || d.destination || 'Unknown'), notes: 'Imported from draft selections', startDate: null, endDate: null, budget: null };
                const res = await fetch('/api/itineraries', { method:'POST', headers: authHeaders, body: JSON.stringify(payload) });
                if (res.ok) {
                  await load();
                  // Keep the raw draft; we could clear it if desired:
                  // localStorage.removeItem('itineraryDraft');
                }
              } catch {}
            })();
          }
        }
      }
    } catch {}
    setDraftMerged(true);
  }, [token, items, draftMerged, loading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      destinations: (item.destinations || []).join(', '),
      startDate: item.startDate ? item.startDate.substring(0,10) : '',
      endDate: item.endDate ? item.endDate.substring(0,10) : '',
      budget: item.budget || '',
      notes: item.notes || ''
    });
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true); setError(null);
    const payload = {
      title: form.title.trim() || 'Untitled Trip',
      destinations: form.destinations.split(',').map(d => d.trim()).filter(Boolean),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      budget: form.budget ? Number(form.budget) : null,
      notes: form.notes || ''
    };
    try {
      const res = await fetch(`/api/itineraries${editingId ? '/' + editingId : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      await load();
      resetForm();
    } catch (e2) { setError(e2.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!token || !window.confirm('Delete this itinerary?')) return;
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Delete failed');
      setItems(items.filter(i => i._id !== id));
    } catch (e) { setError(e.message); }
  };

  const visibleItems = useMemo(() => {
    let list = [...items];
    // filtering
    if (filterText.trim()) {
      const ft = filterText.toLowerCase();
      list = list.filter(i => (i.title||'').toLowerCase().includes(ft) || (i.destinations||[]).some(d=>d.toLowerCase().includes(ft)));
    }
    // sorting
    list.sort((a,b)=>{
      if (sort === 'created-desc') return new Date(b.createdAt||0) - new Date(a.createdAt||0);
      if (sort === 'created-asc') return new Date(a.createdAt||0) - new Date(b.createdAt||0);
      if (sort === 'title-asc') return (a.title||'').localeCompare(b.title||'');
      if (sort === 'title-desc') return (b.title||'').localeCompare(a.title||'');
      return 0;
    });
    return list;
  }, [items, sort, filterText]);

  return (
    <div className="itinerary-page container">
      <h1>Your Itineraries</h1>
      {!token && <p>Please log in to manage itineraries.</p>}
      {error && <div className="itinerary-error">{error}</div>}
      <div className="itinerary-toolbar">
        <input
          type="text"
          placeholder="Filter by title or destination..."
          value={filterText}
          onChange={e=>setFilterText(e.target.value)}
        />
        <select value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="created-desc">Newest First</option>
          <option value="created-asc">Oldest First</option>
          <option value="title-asc">Title A→Z</option>
          <option value="title-desc">Title Z→A</option>
        </select>
      </div>
      <div className="itinerary-layout">
        <div className="itinerary-list">
          {loading ? <p>Loading...</p> : (
            visibleItems.length ? (
              <ul className="itinerary-items">
                {visibleItems.map(item => (
                  <li key={item._id} className="itinerary-item">
                    <div className="itinerary-meta">
                      <h3>{item.title}</h3>
                      <p className="destinations">{(item.destinations || []).join(', ') || '—'}</p>
                      <p className="dates">{item.startDate ? item.startDate.substring(0,10) : '—'} → {item.endDate ? item.endDate.substring(0,10) : '—'}</p>
                      {item.budget && <p className="budget">Budget: ₹{item.budget}</p>}
                      {item.notes && <p className="notes">{item.notes}</p>}
                    </div>
                    <div className="itinerary-actions">
                      <button onClick={() => startEdit(item)}>Edit</button>
                      <button className="danger" onClick={() => remove(item._id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="empty">No itineraries yet. Add one!</p>
          )}
        </div>
        <div className="itinerary-form-panel">
          <h2>{editingId ? 'Edit Itinerary' : 'Add Itinerary'}</h2>
          <form onSubmit={submit} className="itinerary-form">
            <label>Title
              <input name="title" value={form.title} onChange={onChange} placeholder="e.g., Goa Getaway" />
            </label>
            <label>Destinations (comma separated)
              <input name="destinations" value={form.destinations} onChange={onChange} placeholder="Goa, Hampi" />
            </label>
            <div className="row">
              <label>Start Date
                <input type="date" name="startDate" value={form.startDate} onChange={onChange} />
              </label>
              <label>End Date
                <input type="date" name="endDate" value={form.endDate} onChange={onChange} />
              </label>
            </div>
            <label>Budget (₹)
              <input type="number" name="budget" value={form.budget} onChange={onChange} min="0" />
            </label>
            <label>Notes
              <textarea name="notes" value={form.notes} onChange={onChange} rows={3} placeholder="Anything special?" />
            </label>
            <div className="form-actions">
              {editingId && <button type="button" onClick={resetForm} className="secondary">Cancel</button>}
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
