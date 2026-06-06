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

function WeightBar({ weight, isEarth }) {
  const pct = Math.max(2, (weight / MAX_WEIGHT) * 100);
  return (
    <div className="bar-track" role="meter" aria-valuenow={weight} aria-valuemin={0} aria-valuemax={MAX_WEIGHT} aria-label={`${weight} kg`}>
      <div className={`bar-fill ${isEarth ? 'bar-earth' : ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function App() {
  const [cargo, setCargo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  async function fetchCargo() {
    try {
      const res = await fetch('http://localhost:3001/api/cargo');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setCargo(sortCargo(data));
      setLastSynced(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCargo(); }, []);

  function handleSync() {
    setSyncing(true);
    setTimeout(async () => {
      await fetchCargo();
      setSyncing(false);
    }, 2500);
  }

  const totalWeight = cargo.reduce((sum, r) => sum + r.weightInKg, 0);

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />

      {/* Header */}
      <header className="header" role="banner">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">🚀</span>
            <div>
              <h1>Intergalactic Cargo Triager</h1>
              <p className="subtitle">Fleet manifest — sorted by mass descending</p>
            </div>
          </div>
          <div className="header-right">
            {lastSynced && (
              <span className="last-synced">
                Last synced {lastSynced.toLocaleTimeString()}
              </span>
            )}
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
              aria-busy={syncing}
            >
              {syncing
                ? <><span className="spinner" aria-hidden="true" /> Aligning quantum drives...</>
                : <><span aria-hidden="true">⟳</span> Sync Data</>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="stats-bar" role="region" aria-label="Summary statistics">
          <div className="stat">
            <span className="stat-value">{cargo.length}</span>
            <span className="stat-label">Active Shipments</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat">
            <span className="stat-value">{totalWeight.toLocaleString()} kg</span>
            <span className="stat-label">Total Mass</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat">
            <span className="stat-value">{cargo.filter(r => r.destination.includes('Sector-7')).length}</span>
            <span className="stat-label">Sector-7 Routes</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat">
            <span className="stat-value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="stat-label">Report Date</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="main" role="main">
        {loading && (
          <div className="feedback-state" role="status" aria-live="polite">
            <span className="loader" aria-hidden="true" />
            <p>Loading cargo manifest...</p>
          </div>
        )}

        {error && (
          <div className="feedback-state error-state" role="alert">
            <span className="error-icon" aria-hidden="true">⚠</span>
            <p>Failed to load cargo data</p>
            <p className="error-detail">{error}</p>
            <button className="retry-btn" onClick={fetchCargo}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrapper" role="region" aria-label="Cargo manifest">
            <table className="cargo-table" aria-label="Cargo shipments sorted by weight">
              <thead>
                <tr>
                  <th scope="col" abbr="Rank">#</th>
                  <th scope="col">Cargo ID</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Weight (kg)</th>
                  <th scope="col">Mass Distribution</th>
                  <th scope="col">Manifest Date</th>
                </tr>
              </thead>
              <tbody>
                {cargo.map((item, index) => {
                  const isEarth = item.destination === 'Earth';
                  const isSector7 = item.destination.includes('Sector-7');

                  return (
                    <tr key={item.cargoId} className={isEarth ? 'row-earth' : ''}>
                      <td className="col-rank" aria-label={`Rank ${index + 1}`}>{index + 1}</td>
                      <td className="col-id">
                        <code>{item.cargoId}</code>
                      </td>
                      <td className="col-dest">
                        <span className="dest-name">{item.destination}</span>
                        <span className="badges">
                          {isEarth && <span className="badge badge-earth" title="Earth — pinned to bottom">HOME</span>}
                          {isSector7 && <span className="badge badge-sector7" title="Sector-7 weight multiplier applied">SECTOR-7</span>}
                        </span>
                      </td>
                      <td className="col-weight">
                        <span className="weight-val">{item.weightInKg.toLocaleString()}</span>
                        <span className="weight-unit">kg</span>
                      </td>
                      <td className="col-bar">
                        <WeightBar weight={item.weightInKg} isEarth={isEarth} />
                      </td>
                      <td className="col-date">
                        <time dateTime={item.date}>
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-footer">
              <span>{cargo.length} records · Earth pinned to bottom per protocol</span>
            </div>
          </div>
        )}
      </main>

      <footer className="footer" role="contentinfo">
        <span>IntergalacticCargoTriager · Modugu · 2026</span>
      </footer>
    </div>
  );
}
