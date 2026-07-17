/**
 * Loads the WASM API entry point.
 *
 * @returns A promise that resolves when the WASM module is ready.
 */
export async function loadWasmApi(): Promise<void> {
  await import('planet-sim-wasm');
}
