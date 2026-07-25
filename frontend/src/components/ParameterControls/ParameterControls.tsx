import React from 'react';
import { ParameterControlsProps } from '../../types';

/**
 * Presentational component for simulation parameter inputs and buttons.
 */
export function ParameterControls({ massM1, setMassM1, massM2, setMassM2, distanceR, setDistanceR, speedMultiplier, setSpeedMultiplier, isPaused, setIsPaused, onReset }: ParameterControlsProps) {
  return (
    <div style={{ padding: '20px', fontFamily: 'inherit' }}>
      <h3
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#fff',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '8px',
        }}
      >
        Simulation Controls
      </h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '6px',
            border: isPaused ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isPaused ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: isPaused ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            outline: 'none',
          }}
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            outline: 'none',
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '6px' }}>Mass 1 (Primary, kg)</span>
          <input type="number" value={massM1} onChange={(e) => setMassM1(Number(e.target.value))} />
          <input type="range" min={1e23} max={1e26} step={1e23} value={massM1} onChange={(e) => setMassM1(Number(e.target.value))} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '6px' }}>Mass 2 (Secondary, kg)</span>
          <input type="number" value={massM2} onChange={(e) => setMassM2(Number(e.target.value))} />
          <input type="range" min={1e21} max={1e24} step={1e21} value={massM2} onChange={(e) => setMassM2(Number(e.target.value))} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '6px' }}>Distance R (m)</span>
          <input type="number" value={distanceR} onChange={(e) => setDistanceR(Number(e.target.value))} />
          <input type="range" min={1e7} max={1e9} step={1e7} value={distanceR} onChange={(e) => setDistanceR(Number(e.target.value))} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '6px' }}>Speed Multiplier (time scale)</span>
          <input type="number" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(Number(e.target.value))} />
          <input type="range" min={100} max={100000} step={100} value={speedMultiplier} onChange={(e) => setSpeedMultiplier(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
