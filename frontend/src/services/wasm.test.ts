import { describe, it, expect, vi } from 'vitest';

vi.mock('planet-sim-wasm', () => ({}));

import { loadWasmApi } from './wasm';

describe('loadWasmApi', () => {
  it('resolves once the wasm module has been imported', async () => {
    await expect(loadWasmApi()).resolves.toBeUndefined();
  });
});
