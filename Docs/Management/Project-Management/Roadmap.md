# Roadmap - Planet Simulation Project

## 🎯 Project Vision

A high-performance, interactive 2-body orbital mechanics simulator for students and physics enthusiasts. Built with Rust/WASM + React to demonstrate systems programming, web technologies, and
real-time  physics simulation.

-

## 📅 Implementation Roadmap

### Phase 1: Foundation & Setup (Weeks 1-2)
**Goal**: Establish project infrastructure and development workflow

| Spec     | Title                      | Dependencies       | Status | Notes                                         |
| -------- | -------------------------- | ------------------ | ------ | --------------------------------------------- |
| SPEC-001 | Project Setup & Guardrails | None               | ✅ Done | Monorepo structure, config files, conventions |
| SPEC-002 | Testing Infrastructure     | SPEC-001           | ✅ Done | Vitest, cargo test, CI integration            |
| SPEC-011 | CI/CD Pipeline             | SPEC-001, SPEC-002 | ✅ Done | GitHub Actions, status checks                 |

**Deliverable**: Developers can `make dev` and start coding immediately

-

### Phase 2: Physics Engine Core (Weeks 3-4)
**Goal**: Implement accurate gravitational calculations

| Spec     | Title                        | Dependencies       | Status | Notes                                          |
| -------- | ---------------------------- | ------------------ | ------ | ---------------------------------------------- |
| SPEC-003 | 2-Body Physics Engine (Rust) | SPEC-001, SPEC-002 | ✅ Done | Newton's laws, Velocity Verlet integrator      |
| SPEC-004 | WASM Integration & JS Bridge | SPEC-003, SPEC-002 | ✅ Done | wasm-bindgen, data marshalling, error handling |

**Deliverable**: `npm run dev` → Browser opens with WASM module loaded

-

### Phase 3: UI Foundation (Weeks 5-6)
**Goal**: Build React component architecture and basic visualization

| Spec     | Title                        | Dependencies       | Status | Notes                                           |
| -------- | ---------------------------- | ------------------ | ------ | ----------------------------------------------- |
| SPEC-005 | React Component Architecture | SPEC-001, SPEC-004 | ✅ Done | Context API, hooks, component structure         |
| SPEC-006 | Canvas Rendering System      | SPEC-004, SPEC-005 | ✅ Done | 2D canvas, coordinate transforms, 60 FPS target |

**Deliverable**: Two bodies orbit each other smoothly on canvas

-

### Phase 4: Core Features (Weeks 7-8)
**Goal**: Add interactivity and learner controls

| Spec     | Title                      | Dependencies       | Status | Notes                                                  |
| -------- | -------------------------- | ------------------ | ------ | ------------------------------------------------------ |
| SPEC-007 | Physics Parameter Controls | SPEC-005, SPEC-006 | ✅ Done | Mass sliders, time scale, presets (Earth-Moon, Binary) |
| SPEC-008 | Trajectory Visualization   | SPEC-005, SPEC-006 | 📋 Todo | Trail rendering, length control, performance           |

**Deliverable**: Students can adjust parameters and see orbit changes in real time

-

### Phase 5: Advanced Features (Weeks 9-10)
**Goal**: Sandbox mode for creative exploration

| Spec     | Title                                | Dependencies                           | Status | Notes                                                    |
| -------- | ------------------------------------ | -------------------------------------- | ------ | -------------------------------------------------------- |
| SPEC-009 | Sandbox Mode - Interactive Placement | SPEC-005, SPEC-006, SPEC-007, SPEC-008 | 📋 Todo | Click to place bodies, properties dialog, max 10 bodies  |
| SPEC-010 | Object Manipulation & Management     | SPEC-009                               | 📋 Todo | Right-click edit/delete, body list sidebar, lock feature |

**Deliverable**: Users can create custom multi-body configurations and experiment

-

### Phase 6: Documentation & DevOps (Weeks 11-12)
**Goal**: Make project production-ready and maintainable

| Spec     | Title                          | Dependencies           | Status | Notes                                         |
| -------- | ------------------------------ | ---------------------- | ------ | --------------------------------------------- |
| SPEC-012 | Deployment Strategy            | SPEC-001, SPEC-011     | 📋 Todo | GitHub Pages, Docker, auto-release            |
| SPEC-013 | API Documentation              | All physics/WASM specs | 📋 Todo | Cargo docs, JSDoc, physics guide              |
| SPEC-014 | Developer Guide & Contribution | All specs              | ✅ Done | CONTRIBUTING.md, architecture guide, examples |

**Deliverable**: App live at `planet-sim.example.com`, docs complete, contributions welcome

-

## 🔄 Dependency Graph

```text
┌─────────────────────────────────────┐
│    SPEC-001: Project Setup          │
│    SPEC-011: CI/CD (parallel)       │
└────────────┬────────────────────────┘
             │
             ├──→ SPEC-002: Testing
             │     ├──→ SPEC-003: Physics Engine
             │         └──→ SPEC-004: WASM Bridge
             │             ├──→ SPEC-005: React Architecture
             │             │   ├──→ SPEC-006: Canvas
             │             │   │   ├──→ SPEC-007: Parameter Controls
             │             │   │   ├──→ SPEC-008: Trajectory
             │             │   │   │   ├──→ SPEC-009: Sandbox Placement
             │             │   │   │   └──→ SPEC-010: Object Manipulation
             │             │   │
             └──────→ SPEC-012: Deployment
                     └──→ SPEC-013: API Docs
                     └──→ SPEC-014: Developer Guide
```
-

## 📊 Parallel Work Opportunities

### Can be done in parallel
- **Phase 1**: SPEC-001, SPEC-002, SPEC-011 (all independent)
- **Phase 3 & 4**: SPEC-007 + SPEC-008 (both use SPEC-006)
- **Phase 6**: All documentation specs can be drafted while Phase 5 is in progress

### Recommended sequential order
1. SPEC-001 → foundation ready
2. SPEC-002 + SPEC-011 in parallel → testing infrastructure ready
3. SPEC-003 → physics engine done
4. SPEC-004 → WASM bridge working
5. SPEC-005 → React structure ready
6. SPEC-006 → basic visualization working
7. SPEC-007 + SPEC-008 in parallel → interactivity added
8. SPEC-009 → sandbox mode
9. SPEC-010 → manipulation features
10. SPEC-012 → deploy to production
11. SPEC-013 + SPEC-014 in parallel → documentation complete

-

## 🎯 Milestone Summary

| Milestone            | Specs         | Week | Deliverable                               |
| -------------------- | ------------- | ---- | ----------------------------------------- |
| **Foundation**       | 001, 002, 011 | 2    | Development environment ready, CI passing |
| **Physics Core**     | 003, 004      | 4    | WASM physics engine integrated            |
| **UI Foundation**    | 005, 006      | 6    | Two-body orbits visualized on canvas      |
| **Core Features**    | 007, 008      | 8    | Interactive parameter controls + trails   |
| **Sandbox Mode**     | 009, 010      | 10   | Multi-body sandbox for experimentation    |
| **Production Ready** | 012, 013, 014 | 12   | Deployed, documented, maintainable        |

-

## 🚀 Post-MVP Enhancements (Future)

### High Priority
- **N-body physics**: Extend beyond 2-body (requires SPEC redesign)
- **Performance optimizations**: SIMD, parallel computations
- **Advanced visualizations**: Velocity vectors, acceleration vectors, energy plots

### Medium Priority
- **Educational features**: Tutorials, challenge scenarios
- **Data export**: Save simulations, share configurations
- **Mobile app**: React Native version

### Low Priority
- **3D visualization**: WebGL upgrade
- **Real observatories**: Live ephemeris data integration
- **Multi-player**: Collaborative simulations

-

## 📝 Notes

- **Time Estimates**: Above estimates assume 1 developer, 20 hrs/week
- **Flexibility**: Specs can be reordered based on team capacity
- **Learning Focus**: Prioritize clear code and documentation over features
- **Quality First**: All features must meet physics DoD before shipping

-

## 🔗 Links

- [All SPECs](./Specs/)
- [Definitions of Done](./DoDs/)
- [Project Vision](../../README.md)
