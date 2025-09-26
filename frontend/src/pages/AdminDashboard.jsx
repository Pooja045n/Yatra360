import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

// Ensure auth header always set (hybrid safety) & retry logic placeholder
axios.interceptors.request.use(config => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axios.interceptors.response.use(r=>r, err => {
  if (err.response && err.response.status === 401) {
    // Could add redirect to login or toast
    console.warn('Unauthorized - ensure you are logged in as admin');
  }
  return Promise.reject(err);
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [noToken, setNoToken] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [places, setPlaces] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [festivalForm, setFestivalForm] = useState({
    name: '',
    description: '',
    date: '',
    month: '',
    region: '',
    duration: 1,
    significance: '',
    traditions: '',
    image: ''
  });
  const [currencyEdits, setCurrencyEdits] = useState({});

  // Attach token automatically
  // Bootstrap token + user; react if absent
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Try to fetch /auth/me once to validate + capture role/isAdmin (silent failure tolerated)
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }})
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          if (d && d.user) setAuthUser(d.user);
        })
        .catch(()=>{});
    } else {
      setNoToken(true);
    }
  }, []);

  useEffect(() => {
    if (noToken) return; // Skip firing requests with missing token
    // Avoid returning a Promise from useEffect (React treats return value as cleanup function)
    (async () => {
      switch (activeTab) {
        case 'dashboard': await fetchDashboardStats(); break;
        case 'users': await fetchUsers(); break;
        case 'guides': await fetchGuides(); break;
        case 'places': await fetchPlaces(); break;
        case 'alerts': await fetchAlerts(); break;
        case 'festivals': await fetchFestivals(); break;
        case 'currency': await fetchCurrencies(); break;
        default: break;
      }
    })();
  }, [activeTab, noToken]);

  const withAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) { setNoToken(true); return null; }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchDashboardStats = async () => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get('/api/admin/dashboard', cfg); setDashboardStats(data); } catch (e) { console.error('[dashboard]', e); } finally { setLoading(false); }
  };
  const fetchUsers = async (page=1, search='') => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`, cfg); setUsers(data.users); setPagination(data.pagination);} catch(e){console.error('[users]', e);} finally{setLoading(false);} };
  const fetchGuides = async (status='all') => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get(`/api/admin/guides?status=${status}`, cfg); setGuides(data.guides); setPagination(data.pagination);} catch(e){console.error('[guides]', e);} finally{setLoading(false);} };
  const fetchPlaces = async (page=1) => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get(`/api/admin/places?page=${page}`, cfg); setPlaces(data.places || []); setPagination(data.pagination);} catch(e){console.error('[places]', e);} finally{setLoading(false);} };
  const fetchAlerts = async (page=1) => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get(`/api/admin/alerts?page=${page}`, cfg); setAlerts(data.alerts); setPagination(data.pagination);} catch(e){console.error('[alerts]', e);} finally{setLoading(false);} };
  const fetchFestivals = async () => { // public festivals list not admin-only
    try { setLoading(true); const { data } = await axios.get('/api/festivals'); setFestivals(data);} catch(e){console.error('[festivals]', e);} finally{setLoading(false);} };
  const fetchCurrencies = async () => {
    const cfg = withAuth(); if (!cfg) return;
    try { setLoading(true); const { data } = await axios.get('/api/admin/currency', cfg); setCurrencies(data); setCurrencyEdits({}); } catch(e){console.error('[currency]', e);} finally{setLoading(false);} };

  // Actions
  const updateGuideStatus = async (guideId, status) => { try { await axios.put(`/api/admin/guides/${guideId}/status`, { status }); fetchGuides(); } catch(e){ console.error(e);} };
  const deleteAlert = async (id) => { if(!window.confirm('Delete alert?')) return; try { await axios.delete(`/api/admin/alerts/${id}`); fetchAlerts(); } catch(e){console.error(e);} };
  const deleteFestival = async (id) => { if(!window.confirm('Delete festival?')) return; try { await axios.delete(`/api/admin/festivals/${id}`); fetchFestivals(); } catch(e){console.error(e);} };

  // Festival form handlers
  const openFestivalModal = (fest=null) => {
    if (fest) {
      setEditingFestival(fest);
      setFestivalForm({
        name: fest.name || '',
        description: fest.description || '',
        date: fest.date ? fest.date.split('T')[0] : '',
        month: fest.month || '',
        region: fest.region || '',
        duration: fest.duration || 1,
        significance: fest.significance || '',
        traditions: (fest.traditions || []).join(', '),
        image: fest.image || ''
      });
    } else {
      setEditingFestival(null);
      setFestivalForm({ name:'', description:'', date:'', month:'', region:'', duration:1, significance:'', traditions:'', image:'' });
    }
    setShowFestivalModal(true);
  };
  const submitFestival = async (e) => {
    e.preventDefault();
    const payload = { ...festivalForm, traditions: festivalForm.traditions.split(',').map(t=>t.trim()).filter(Boolean) };
    try {
      const cfg = withAuth(); if (!cfg) return;
      if (editingFestival) await axios.put(`/api/admin/festivals/${editingFestival._id}`, payload, cfg); else await axios.post('/api/admin/festivals', payload, cfg);
      setShowFestivalModal(false); fetchFestivals();
    } catch(e){ console.error(e);} };

  const updateCurrencyRates = async () => {
    try { await axios.put('/api/admin/currency', { rates: currencyEdits }); fetchCurrencies(); } catch(e){ console.error(e);} };

  // Renderers
  const renderDashboard = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <Stat label="Total Users" value={dashboardStats.stats?.totalUsers} icon="👥" cls="users" />
        <Stat label="Approved Guides" value={dashboardStats.stats?.totalGuides} icon="🗺️" cls="guides" />
        <Stat label="Pending Applications" value={dashboardStats.stats?.pendingGuides} icon="⏳" cls="pending" />
        <Stat label="Total Places" value={dashboardStats.stats?.totalPlaces} icon="📍" cls="places" />
        <Stat label="Active Alerts" value={dashboardStats.stats?.activeAlerts} icon="⚠️" cls="alerts" />
        <Stat label="Total Festivals" value={dashboardStats.stats?.totalFestivals} icon="🎭" cls="festivals" />
      </div>
      <div className="recent-activity">
        <RecentList title="Recent Users" items={dashboardStats.recentUsers} icon="👤" primary={(u)=>u.name} secondary={(u)=>u.email} time={(u)=>u.createdAt} actions={null} />
        <RecentList title="Pending Guide Applications" items={dashboardStats.recentGuideApplications} icon="🗺️" primary={(g)=>g.name} secondary={(g)=>g.type+ ' - ' + g.region} time={(g)=>g.appliedAt} actions={(g)=> (
          <div className="activity-actions">
            <button className="btn-approve" onClick={()=>updateGuideStatus(g._id,'approved')}>✓</button>
            <button className="btn-reject" onClick={()=>updateGuideStatus(g._id,'rejected')}>✗</button>
          </div>
        )} />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="data-table">
      <div className="table-header"><h3>User Management</h3></div>
      <div className="table-container">
        <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
          {users.map(u => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className={`role-badge ${u.role}`}>{u.role}</span></td><td>{new Date(u.createdAt).toLocaleDateString()}</td><td><div className="action-buttons"><button className="btn-edit">Edit</button><button className="btn-delete">Delete</button></div></td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );

  const renderGuides = () => (
    <div className="data-table">
      <div className="table-header"><h3>Guide Applications</h3><div className="table-actions"><select onChange={(e)=>fetchGuides(e.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div></div>
      <div className="guides-grid">
        {guides.map(g => (
          <div key={g._id} className="guide-application-card">
            <div className="guide-header">
              <div className="guide-avatar">{g.profileImage ? <img src={g.profileImage} alt={g.name} /> : <div className="avatar-placeholder">{g.name.charAt(0)}</div>}</div>
              <div className="guide-info"><h4>{g.name}</h4><p>{g.type} Guide</p><p>{g.city}, {g.region}</p></div>
              <div className={`status-badge ${g.status}`}>{g.status}</div>
            </div>
            <div className="guide-details"><p><strong>Experience:</strong> {g.experience}</p><p><strong>Languages:</strong> {g.languages?.join(', ')}</p><p><strong>Specializations:</strong> {g.specializations?.join(', ')}</p><p><strong>Price:</strong> {g.price}</p><p><strong>Applied:</strong> {new Date(g.appliedAt).toLocaleDateString()}</p></div>
            {g.status === 'pending' && <div className="guide-actions"><button className="btn-approve" onClick={()=>updateGuideStatus(g._id,'approved')}>Approve</button><button className="btn-reject" onClick={()=>updateGuideStatus(g._id,'rejected')}>Reject</button></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="data-table">
      <div className="table-header"><h3>Travel Alerts</h3><div className="table-actions"><button className="btn-primary" onClick={()=>setShowAlertModal(true)}>Create Alert</button></div></div>
      <div className="alerts-grid">
        {alerts.map(a => (
          <div key={a._id} className={`alert-card admin ${a.severity}`}><div className="alert-header"><div className="alert-type-badge">{a.type}</div><div className="alert-severity">{a.severity}</div><button className="delete-btn" onClick={()=>deleteAlert(a._id)}>✗</button></div><h4>{a.title}</h4><p>{a.description}</p>{a.location && <p><strong>Location:</strong> {a.location}</p>}{a.validUntil && <p><strong>Valid Until:</strong> {new Date(a.validUntil).toLocaleDateString()}</p>}<div className="alert-meta"><small>Created: {new Date(a.createdAt).toLocaleDateString()}</small></div></div>
        ))}
      </div>
      {showAlertModal && <AlertModal onClose={()=>setShowAlertModal(false)} onSubmit={()=>{ setShowAlertModal(false); fetchAlerts(); }} />}
    </div>
  );

  const renderFestivals = () => (
    <div className="data-table">
      <div className="table-header"><h3>Festival Management</h3><div className="table-actions"><button className="btn-primary" onClick={()=>openFestivalModal()}>Add Festival</button></div></div>
      <div className="festivals-admin-grid">
        {festivals.map(f => (
          <div key={f._id} className="festival-admin-card">
            <div className="festival-admin-header">
              <h4>{f.name}</h4>
              <div className="festival-admin-actions">
                <button className="btn-edit" onClick={()=>openFestivalModal(f)}>Edit</button>
                <button className="btn-delete" onClick={()=>deleteFestival(f._id)}>Delete</button>
              </div>
            </div>
            <p className="small">{f.region} • {f.month} • {f.duration} days</p>
            <p>{f.description?.slice(0,120)}{f.description?.length>120 && '...'}</p>
            {f.traditions && f.traditions.length>0 && <div className="mini-tags">{f.traditions.slice(0,4).map((t,i)=><span key={i} className="mini-tag">{t}</span>)}</div>}
          </div>
        ))}
      </div>
      {showFestivalModal && (
        <div className="modal-overlay" onClick={()=>setShowFestivalModal(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header"><h2>{editingFestival? 'Edit Festival' : 'Add Festival'}</h2><button className="close-btn" onClick={()=>setShowFestivalModal(false)}>×</button></div>
            <form onSubmit={submitFestival} className="festival-form">
              <div className="form-row"><div className="form-group"><label>Name</label><input value={festivalForm.name} onChange={e=>setFestivalForm({...festivalForm,name:e.target.value})} required/></div><div className="form-group"><label>Region</label><input value={festivalForm.region} onChange={e=>setFestivalForm({...festivalForm,region:e.target.value})} required/></div></div>
              <div className="form-row"><div className="form-group"><label>Month</label><input value={festivalForm.month} onChange={e=>setFestivalForm({...festivalForm,month:e.target.value})} required/></div><div className="form-group"><label>Date</label><input type="date" value={festivalForm.date} onChange={e=>setFestivalForm({...festivalForm,date:e.target.value})} required/></div></div>
              <div className="form-row"><div className="form-group"><label>Duration (days)</label><input type="number" min="1" value={festivalForm.duration} onChange={e=>setFestivalForm({...festivalForm,duration:parseInt(e.target.value)||1})} required/></div><div className="form-group"><label>Image URL</label><input value={festivalForm.image} onChange={e=>setFestivalForm({...festivalForm,image:e.target.value})} /></div></div>
              <div className="form-group"><label>Significance</label><input value={festivalForm.significance} onChange={e=>setFestivalForm({...festivalForm,significance:e.target.value})} /></div>
              <div className="form-group"><label>Traditions (comma separated)</label><input value={festivalForm.traditions} onChange={e=>setFestivalForm({...festivalForm,traditions:e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea value={festivalForm.description} onChange={e=>setFestivalForm({...festivalForm,description:e.target.value})} required/></div>
              <div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setShowFestivalModal(false)}>Cancel</button><button type="submit" className="save-btn">{editingFestival? 'Update':'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrency = () => (
    <div className="data-table">
      <div className="table-header"><h3>Currency Rates</h3><div className="table-actions"><button className="btn-primary" disabled={Object.keys(currencyEdits).length===0} onClick={updateCurrencyRates}>Save Changes</button></div></div>
      <div className="currency-grid">
        {currencies.map(c => (
          <div key={c._id||c.code} className="currency-card">
            <h4>{c.code}</h4>
            <input type="number" step="0.0001" defaultValue={c.rate} onChange={e=>setCurrencyEdits(prev=>({...prev,[c.code]:parseFloat(e.target.value)}))} />
            <small>Last: {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString(): '—'}</small>
          </div>
        ))}
      </div>
    </div>
  );

  if (noToken) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header"><h1>Admin Dashboard</h1></div>
        <div className="admin-container">
          <div className="admin-content">
            <div className="loading-state">
              <p>No authentication token found. Log in below with an admin (or promotable) account.</p>
              <InlineAdminLogin onSuccess={(user)=>{ setAuthUser(user); setNoToken(false); setActiveTab('dashboard'); fetchDashboardStats(); }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attemptBootstrap = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/admin/bootstrap-admin', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        // Update authUser in state so UI reflects new privileges
        setAuthUser(prev => prev ? { ...prev, isAdmin: true, role: 'admin' } : { isAdmin: true, role: 'admin' });
        // Force refresh of current tab now that permissions changed
        switch (activeTab) {
          case 'dashboard': fetchDashboardStats(); break;
          case 'users': fetchUsers(); break;
          case 'guides': fetchGuides(); break;
          case 'places': fetchPlaces(); break;
          case 'alerts': fetchAlerts(); break;
          case 'festivals': fetchFestivals(); break;
          case 'currency': fetchCurrencies(); break;
          default: break;
        }
        console.info('Bootstrap success:', data.message);
      } else {
        const errText = await res.text();
        console.warn('Bootstrap failed:', errText);
      }
    } catch (e) {
      console.error('Bootstrap error', e);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header"><h1>Admin Dashboard</h1><p>Manage Yatra360 platform data</p></div>
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="sidebar-nav">
            {['dashboard','users','guides','alerts','festivals','currency'].map(id => (
              <button key={id} className={`nav-item ${activeTab===id?'active':''}`} onClick={()=>setActiveTab(id)}>{id.charAt(0).toUpperCase()+id.slice(1)}</button>
            ))}
          </div>
          {authUser && !authUser.isAdmin && (
            <div className="non-admin-warning">
              <p>Your account is not marked as admin. Admin endpoints will be blocked.</p>
              <button className="btn-primary" onClick={attemptBootstrap}>Attempt One-Time Admin Bootstrap</button>
            </div>
          )}
        </div>
        <div className="admin-content">
          {loading ? <div className="loading-state"><div className="spinner"/><p>Loading...</p></div> : (
            <>
              {activeTab==='dashboard' && renderDashboard()}
              {activeTab==='users' && renderUsers()}
              {activeTab==='guides' && renderGuides()}
              {activeTab==='alerts' && renderAlerts()}
              {activeTab==='festivals' && renderFestivals()}
              {activeTab==='currency' && renderCurrency()}
              {activeTab==='places' && <div className="coming-soon"><h3>Places</h3><p>Coming soon</p></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable small components
const Stat = ({label,value,icon,cls}) => (
  <div className={`stat-card ${cls}`}> <div className="stat-icon">{icon}</div><div className="stat-content"><h3>{value||0}</h3><p>{label}</p></div></div>
);

const RecentList = ({ title, items=[], icon, primary, secondary, time, actions }) => (
  <div className="activity-section"><h3>{title}</h3><div className="activity-list">{items.map(it => (
    <div key={it._id} className="activity-item"><div className="activity-icon">{icon}</div><div className="activity-content"><p className="activity-title">{primary(it)}</p><p className="activity-subtitle">{secondary(it)}</p><p className="activity-time">{new Date(time(it)).toLocaleDateString()}</p></div>{actions && actions(it)}</div>
  ))}</div></div>
);

// Placeholder AlertModal (unchanged minimal) - could be expanded
const AlertModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ title:'', description:'', type:'safety', severity:'medium', location:'', validUntil:'', actionRequired:'' });
  const submit = e => { e.preventDefault(); onSubmit(formData); };
  return <div className="modal-overlay"><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2>Create Alert</h2><button className="close-btn" onClick={onClose}>×</button></div><form onSubmit={submit} className="alert-form"><div className="form-group"><label>Title</label><input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required /></div><div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} required /></div><div className="form-row"><div className="form-group"><label>Type</label><select value={formData.type} onChange={e=>setFormData({...formData,type:e.target.value})}><option value="safety">Safety</option><option value="weather">Weather</option><option value="health">Health</option><option value="transport">Transport</option><option value="event">Event</option></select></div><div className="form-group"><label>Severity</label><select value={formData.severity} onChange={e=>setFormData({...formData,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div><div className="form-group"><label>Location</label><input value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} /></div><div className="form-group"><label>Valid Until</label><input type="datetime-local" value={formData.validUntil} onChange={e=>setFormData({...formData,validUntil:e.target.value})} /></div><div className="form-group"><label>Action Required</label><input value={formData.actionRequired} onChange={e=>setFormData({...formData,actionRequired:e.target.value})} /></div><div className="modal-actions"><button type="button" className="cancel-btn" onClick={onClose}>Cancel</button><button type="submit" className="save-btn">Create</button></div></form></div></div>;
};

export default AdminDashboard;

// Inline login component for admin page when no token present
const InlineAdminLogin = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const apiBase = process.env.REACT_APP_API_BASE || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${apiBase}/api/auth/login`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        // Fetch fresh /auth/me to ensure role/isAdmin sync
        try {
          const meRes = await axios.get(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${data.token}` } });
          if (meRes?.data?.user) {
            localStorage.setItem('user', JSON.stringify(meRes.data.user));
            onSuccess && onSuccess(meRes.data.user);
            return;
          }
        } catch {}
        onSuccess && onSuccess(data.user || null);
      } else {
        throw new Error('Invalid response payload');
      }
    } catch (err) {
      if (err.response) {
        setError(`Login failed (${err.response.status})`);
      } else if (err.request) {
        setError('Network error contacting API');
      } else {
        setError(err.message || 'Login error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="inline-admin-login" onSubmit={handleSubmit} style={{ maxWidth: 360, width: '100%', marginTop: '1rem' }}>
      <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@example.com" /></div>
      <div className="form-group"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" /></div>
      {error && <div className="error-msg" style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '.5rem' }}>{error}</div>}
      <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%' }}>{submitting ? 'Logging in...' : 'Log In'}</button>
      <p style={{ fontSize: '.7rem', marginTop: '.65rem', color: '#64748b' }}>After first successful login you can use the one-time bootstrap button (if no admin yet).</p>
    </form>
  );
};
