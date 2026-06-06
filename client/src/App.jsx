import { useState, useEffect } from 'react';
import './App.css';

const MAX_WEIGHT = 9999;

function sortCargo(data) {
  // Rule 4: Earth is always pinned to the bottom regardless of weight
  const earthRecords = data.filter(r => r.destination === 'Earth');
  const others = data.filter(r => r.destination !== 'Earth');
  others.sort((a, b) => b.weightInKg - a.weightInKg);
  return [...others, ...earthRecords];
}

export default function App() {
  const [cargo, setCargo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  async function fetchCargo() {
    try {
      const res = await fetch('http://localhost:3001/api/cargo');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setCargo(sortCargo(data));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCargo();
  }, []);

  function handleSync() {
    setSyncing(true);
    setTimeout(async () => {
      await fetchCargo();
      setSyncing(false);
    }, 2500);
  }

  return (
    <div className="app">
      <div className="stars" />

      <header className="header">
        <div className="header-inner">
          <div className="title-block">
            <span className="title-icon">🚀</span>
            <div>
              <h1>Intergalactic Cargo Triager</h1>
              <p className="subtitle">Live manifest feed — sorted by mass</p>
            </div>
          </div>
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Aligning quantum drives...' : 'Sync Data'}
          </button>
        </div>
      </header>

      <main className="main">
        {loading && <p className="status-msg">Loading cargo manifest...</p>}
        {error && <p className="status-msg error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table className="cargo-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cargo ID</th>
                  <th>Destination</th>
                  <th>Weight (kg)</th>
                  <th>Mass Bar</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cargo.map((item, index) => {
                  const isEarth = item.destination === 'Earth';
                  const isSector7 = item.destination.includes('Sector-7');
                  const barWidth = Math.max(4, (item.weightInKg / MAX_WEIGHT) * 100);

                  return (
                    <tr key={item.cargoId} className={isEarth ? 'row-earth' : ''}>
                      <td className="rank">{index + 1}</td>
                      <td className="cargo-id">{item.cargoId}</td>
                      <td className="destination">
                        {item.destination}
                        {isEarth && <span className="badge earth-badge">HOME</span>}
                        {isSector7 && <span className="badge sector-badge">SECTOR-7</span>}
                      </td>
                      <td className="weight">{item.weightInKg.toLocaleString()}</td>
                      <td className="bar-cell">
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${isEarth ? 'bar-earth' : ''}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                      <td className="date">{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="record-count">{cargo.length} records loaded</p>
          </div>
        )}
      </main>
    </div>
  );
}
