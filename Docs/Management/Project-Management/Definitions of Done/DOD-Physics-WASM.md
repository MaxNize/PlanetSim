# Definition of Done - Physics & WASM

## Physics Engine (SPEC-003) DoD

- [ ] All gravitational calculations verified against reference values
- [ ] Numerical integration stable (energy conservation ± 0.1%)
- [ ] Edge cases handled:
  - [ ] Zero distance between bodies
  - [ ] Extreme mass ratios (e.g., Sun vs Mercury)
  - [ ] High-velocity encounters
  - [ ] Parabolic/hyperbolic orbits
- [ ] Performance: Single step < 1ms, 1000 steps < 1 second
- [ ] Float precision documented (64-bit, typical error < 1e-10)
- [ ] Units consistent throughout (SI: meters, kg, seconds)

## WASM Integration (SPEC-004) DoD

- [ ] WASM builds without warnings (`wasm-pack build`)
- [ ] Data marshalling round-trip tested (Rust → JS → Rust)
- [ ] No memory leaks after 10k simulation steps
- [ ] Error handling: Rust panics caught and converted to JS errors
- [ ] Performance overhead < 5% of physics step time
- [ ] Bundle size < 500KB (WASM module)
- [ ] Works in latest 2 browser versions

## Canvas Rendering (SPEC-006) DoD

- [ ] 60 FPS maintained on standard hardware
- [ ] Frame time < 16.67ms (including physics + render)
- [ ] Canvas responsive to viewport changes
- [ ] Device pixel ratio handled (sharp on high-DPI displays)
- [ ] No memory leaks with long trails (1000+ points)
- [ ] Body positions accurate within display precision