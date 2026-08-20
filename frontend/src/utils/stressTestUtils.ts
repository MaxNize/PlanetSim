import { SandboxBody } from '../types';

const G = 6.6743e-11;
const PRIMARY_MASS = 1.989e30;

const PALETTE = ['#48dbfb', '#ff9ff3', '#feca57', '#ff6b6b', '#1dd1a1', '#54a0ff', '#5f27cd', '#c8d6e5'];

/**
 * Generates N customizable celestial bodies positioned in Keplerian orbital paths around the central mass.
 *
 * @param count Number of bodies to generate.
 * @param startIndex Starting index offset for body IDs and colors.
 * @returns Array of SandboxBody objects.
 */
export function generateStressTestBodies(count: number, startIndex: number = 0): SandboxBody[] {
  const bodies: SandboxBody[] = [];

  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const angle = (idx * 137.5 * Math.PI) / 180; // Golden ratio spiral distribution
    const r = 1.4e11 + (idx % 120) * 6e9 + Math.floor(idx / 120) * 1.5e10;

    const posX = r * Math.cos(angle);
    const posY = r * Math.sin(angle);

    const vMag = Math.sqrt((G * PRIMARY_MASS) / r);
    const velX = -vMag * Math.sin(angle);
    const velY = vMag * Math.cos(angle);

    bodies.push({
      id: `stress-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: `Test Body ${idx + 1}`,
      position: [posX, posY],
      velocity: [velX, velY],
      mass: 5.972e24,
      radius: 1e9,
      color: PALETTE[idx % PALETTE.length],
      locked: false,
    });
  }

  return bodies;
}
