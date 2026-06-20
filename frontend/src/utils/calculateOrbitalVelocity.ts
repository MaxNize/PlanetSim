/**
 * Calculates orbital velocity for a simple two-body approximation.
 *
 * @param {number} massM1 Mass of the primary body in kilograms.
 * @param {number} distanceR Distance between bodies in meters.
 * @returns {number} Orbital velocity in meters per second.
 * @throws {Error} If `distanceR` is less than or equal to zero.
 * @example
 * const velocity = calculateOrbitalVelocity(1e24, 1e8)
 */
export function calculateOrbitalVelocity(massM1: number, distanceR: number): number {
  if (distanceR <= 0) {
    throw new Error('distanceR must be positive');
  }

  const gravitationalConstant = 6.6743e-11;
  return Math.sqrt((gravitationalConstant * massM1) / distanceR);
}
