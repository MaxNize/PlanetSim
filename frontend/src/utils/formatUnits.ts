const AU_IN_METERS = 1.495978707e11;
const EARTH_MASS_KG = 5.9722e24;
const SOLAR_MASS_KG = 1.989e30;

const DISTANCE_UNITS = [
  { threshold: 0.1 * AU_IN_METERS, divisor: AU_IN_METERS, suffix: ' AU', decimals: 3 },
  { threshold: 1e9, divisor: 1e9, suffix: ' Gm', decimals: 2 },
  { threshold: 1e6, divisor: 1e6, suffix: ' Mm', decimals: 2 },
  { threshold: 1e3, divisor: 1e3, suffix: ' km', decimals: 2 },
];

/**
 * Formats a distance in meters as a human-readable string, auto-scaling to km, Mm, Gm, or AU.
 *
 * @param {number} meters Distance in meters.
 * @returns {string} Human-readable distance with unit suffix.
 * @example
 * formatDistance(3.844e8) // "384.40 Mm"
 */
export function formatDistance(meters: number): string {
  const abs = Math.abs(meters);
  const unit = DISTANCE_UNITS.find((u) => abs >= u.threshold);
  if (!unit) return `${meters.toFixed(1)} m`;
  return `${(meters / unit.divisor).toFixed(unit.decimals)}${unit.suffix}`;
}

/**
 * Formats a speed in meters/second as a human-readable string, auto-scaling to km/s.
 *
 * @param {number} metersPerSecond Speed in meters per second.
 * @returns {string} Human-readable speed with unit suffix.
 * @example
 * formatVelocity(1022) // "1.02 km/s"
 */
export function formatVelocity(metersPerSecond: number): string {
  const abs = Math.abs(metersPerSecond);
  if (abs >= 1e3) return `${(metersPerSecond / 1e3).toFixed(2)} km/s`;
  return `${metersPerSecond.toFixed(1)} m/s`;
}

/**
 * Formats a mass in kilograms as a human-readable string, auto-scaling to Earth masses (M⊕)
 * or solar masses (M☉).
 *
 * @param {number} kg Mass in kilograms.
 * @returns {string} Human-readable mass with unit suffix.
 * @example
 * formatMass(5.9722e24) // "1.000 M⊕"
 */
export function formatMass(kg: number): string {
  const abs = Math.abs(kg);
  if (abs >= 0.1 * SOLAR_MASS_KG) return `${(kg / SOLAR_MASS_KG).toFixed(3)} M☉`;
  if (abs >= 0.01 * EARTH_MASS_KG) return `${(kg / EARTH_MASS_KG).toFixed(3)} M⊕`;
  return `${kg.toExponential(3)} kg`;
}
