import React from 'react';
import { Simulator } from '../Simulator/Simulator';

/**
 * Layout component providing a responsive structure for the application.
 */
export function Layout() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Restricted 3-Body Planet Simulation</h1>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>Simulates orbital mechanics of a test particle in a primary/secondary gravitational system.</p>
      </header>

      <Simulator />
    </main>
  );
}
