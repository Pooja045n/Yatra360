import React, { useState, useMemo } from 'react';
import './Planner.css';

const defaultAlloc = {
  transport: 30,
  stay: 30,
  food: 20,
  activities: 15,
  buffer: 5
};

const Planner = () => {
  const [total, setTotal] = useState(50000);
  const [alloc, setAlloc] = useState(defaultAlloc);
  const [notes, setNotes] = useState('');

  const sumPercent = useMemo(() => Object.values(alloc).reduce((a,b)=>a+Number(b||0),0), [alloc]);

  const updateAlloc = (key, value) => {
    setAlloc(a => ({ ...a, [key]: Number(value) }));
  };

  const amounts = useMemo(() => {
    return Object.fromEntries(Object.entries(alloc).map(([k,v]) => [k, Math.round((v/100) * total)]));
  }, [alloc, total]);

  return (
    <div className="planner-page container">
      <h1>Trip Budget Planner</h1>
      <div className="planner-grid">
        <div className="planner-config glass">
          <h2>Configuration</h2>
          <label>Total Budget (₹)
            <input type="number" min={0} value={total} onChange={e=>setTotal(Number(e.target.value))} />
          </label>
          <div className="allocations">
            {Object.keys(alloc).map(key => (
              <div key={key} className="alloc-row">
                <label>{key.charAt(0).toUpperCase()+key.slice(1)} %
                  <input type="number" min={0} max={100} value={alloc[key]} onChange={e=>updateAlloc(key, e.target.value)} />
                </label>
                <span className="amount">₹{amounts[key].toLocaleString()}</span>
              </div>
            ))}
          </div>
          <p className={sumPercent === 100 ? 'sum-ok' : 'sum-warn'}>Total Allocation: {sumPercent}% {sumPercent !== 100 && '(should equal 100%)'}</p>
          <label>Notes
            <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Plan details, reminders, etc." />
          </label>
        </div>
        <div className="planner-summary glass">
          <h2>Breakdown</h2>
          <ul className="breakdown-list">
            {Object.entries(amounts).map(([k,v]) => (
              <li key={k}><span className="k">{k}</span><span className="bar"><span style={{width: alloc[k]+'%'}} /></span><span className="val">₹{v.toLocaleString()}</span></li>
            ))}
          </ul>
          <div className="totals">Total: <strong>₹{total.toLocaleString()}</strong></div>
          <div className="advice">
            {sumPercent !== 100 ? 'Adjust percentages to total 100%.' : 'Looks good! You can fine tune or export later.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
