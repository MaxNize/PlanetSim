import React from 'react';
import { Simulator } from '../Simulator/Simulator';

/**
 * Layout component providing a responsive structure for the application.
 */
export function Layout() {
  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#05070a',
        fontFamily: 'sans-serif',
      }}
    >
      <header
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 10,
          background: 'rgba(5, 7, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '400px',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>Restricted 3-Body Planet Simulation</h1>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#aaa', lineHeight: '1.4' }}>Simulates orbital mechanics of a test particle in a primary/secondary gravitational system.</p>
      </header>

      <Simulator />
    </main>
  );
}
