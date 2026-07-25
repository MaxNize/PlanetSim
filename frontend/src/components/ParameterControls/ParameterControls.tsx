import React from 'react';
import { ParameterControlsProps } from '../../types';

/**
 * Presentational component for simulation parameter inputs and buttons.
 */
export function ParameterControls({ massM1, setMassM1, massM2, setMassM2, distanceR, setDistanceR, speedMultiplier, setSpeedMultiplier, isPaused, setIsPaused, onReset }: ParameterControlsProps) {
  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Simulation Controls</h3>

      <div style={{ marginBottom: '12px' }}>
        <button onClick={() => setIsPaused(!isPaused)} style={{ marginRight: '8px', padding: '8px 16px', cursor: 'pointer' }}>
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button onClick={onReset} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          🔄 Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>
          <strong>Mass 1 (Primary, kg):</strong>
          <input type="number" value={massM1} onChange={(e) => setMassM1(Number(e.target.value))} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          <input type="range" min={1e23} max={1e26} step={1e23} value={massM1} onChange={(e) => setMassM1(Number(e.target.value))} style={{ width: '100%', marginTop: '4px' }} />
        </label>

        <label>
          <strong>Mass 2 (Secondary, kg):</strong>
          <input type="number" value={massM2} onChange={(e) => setMassM2(Number(e.target.value))} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          <input type="range" min={1e21} max={1e24} step={1e21} value={massM2} onChange={(e) => setMassM2(Number(e.target.value))} style={{ width: '100%', marginTop: '4px' }} />
        </label>

        <label>
          <strong>Distance R (m):</strong>
          <input type="number" value={distanceR} onChange={(e) => setDistanceR(Number(e.target.value))} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          <input type="range" min={1e7} max={1e9} step={1e7} value={distanceR} onChange={(e) => setDistanceR(Number(e.target.value))} style={{ width: '100%', marginTop: '4px' }} />
        </label>

        <label>
          <strong>Speed Multiplier (time scale):</strong>
          <input type="number" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(Number(e.target.value))} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
          <input type="range" min={100} max={100000} step={100} value={speedMultiplier} onChange={(e) => setSpeedMultiplier(Number(e.target.value))} style={{ width: '100%', marginTop: '4px' }} />
        </label>
      </div>
    </div>
  );
}
