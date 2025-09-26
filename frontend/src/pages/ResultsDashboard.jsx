import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './ResultsDashboard.css';

const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const Bar = ({ label, value, max, color = '#4F46E5' }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="bar-value">{value}</div>
    </div>
  );
};

const Donut = ({ value, total, label, color = '#10B981' }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? Math.min(1, value / total) : 0;
  const offset = circumference * (1 - fraction);
  return (
    <div className="donut">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="#E5E7EB" strokeWidth="12" fill="none" />
        <circle cx="50" cy="50" r={radius} stroke={color} strokeWidth="12" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="54" textAnchor="middle" fontSize="14" fill="#111827">{Math.round(fraction * 100)}%</text>
      </svg>
      <div className="donut-label">{label}</div>
    </div>
  );
};

const ResultsDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({ impressions: 0, clicks: 0, ctr: 0, budgets: 0, connects: 0, uniqueUsers: 0, budgetAdoptionPct: 0, connectUsagePct: 0 });
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const url = params.toString() ? `${base}/api/analytics/summary?${params.toString()}` : `${base}/api/analytics/summary`;
        const res = await axios.get(url, { headers });
        setData(res.data);
      } catch {
        // noop
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token, from, to]);

  const maxBar = useMemo(() => Math.max(data.impressions, data.clicks, data.budgets, data.connects, 1), [data]);

  return (
    <div className="results-dashboard">
      <h1>📊 Results Dashboard</h1>
      <p> Charts visualize CTR and adoption. (Results & Visualization).</p>

      <div className="filters">
        <div className="filter-item">
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter-item">
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {(from || to) && (
          <button className="clear-btn" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading analytics…</div>
      ) : (
        <>
          <div className="cards">
            <div className="card"><div className="card-title">Impressions</div><div className="card-value">{data.impressions}</div></div>
            <div className="card"><div className="card-title">Clicks</div><div className="card-value">{data.clicks}</div></div>
            <div className="card"><div className="card-title">CTR</div><div className="card-value">{data.ctr}%</div></div>
            <div className="card"><div className="card-title">Budget Plans</div><div className="card-value">{data.budgets}</div></div>
            <div className="card"><div className="card-title">Connect Usage</div><div className="card-value">{data.connects}</div></div>
            <div className="card"><div className="card-title">Unique Users</div><div className="card-value">{data.uniqueUsers}</div></div>
            <div className="card"><div className="card-title">Budget Adoption</div><div className="card-value">{data.budgetAdoptionPct}%</div></div>
            <div className="card"><div className="card-title">Connect Adoption</div><div className="card-value">{data.connectUsagePct}%</div></div>
          </div>

          <div className="charts">
            <div className="chart">
              <h3>Engagement Bars</h3>
              <Bar label="Impressions" value={data.impressions} max={maxBar} color="#3B82F6" />
              <Bar label="Clicks" value={data.clicks} max={maxBar} color="#10B981" />
              <Bar label="Budget Plans" value={data.budgets} max={maxBar} color="#F59E0B" />
              <Bar label="Connect Usage" value={data.connects} max={maxBar} color="#8B5CF6" />
            </div>

            <div className="chart">
              <h3>CTR Donut</h3>
              <Donut value={data.clicks} total={Math.max(data.impressions, 1)} label="CTR" />
            </div>

            <div className="chart">
              <h3>Adoption</h3>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around' }}>
                <Donut value={data.budgetAdoptionPct} total={100} label="Budget" color="#F59E0B" />
                <Donut value={data.connectUsagePct} total={100} label="Connect" color="#8B5CF6" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsDashboard;
