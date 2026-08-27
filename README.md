# Planet Simulation — Project (Monorepo)

High-performance browser-based physics sandbox (Rust/WASM + React/TypeScript).

Quick start

1. Install Node (use .nvmrc): `nvm install`
2. Run setup: `make setup`
3. Start dev: `make dev`

Structure

- frontend/ — Vite + React + TypeScript
- wasm/ — Rust library compiled to WASM (wasm-bindgen)
- Docs/ — project docs and specs
  - [arc42 Architecture Documentation](./Docs/arc42.md) — Full arc42 architecture document

See Docs/Management/Project-Management/Specs/SPEC-001-project-setup-guardrails.md for conventions and guardrails.

# Planet Simulation – Advanced Programming

A high-performance 2D planet simulation web application for learning gravitational physics. Built with **Rust** for the physics engine (compiled to WebAssembly) and **React/TypeScript** for the
interactive web interface.

## The Problem

Existing JavaScript-based physics simulations are slow and difficult to extend. Students and hobbyist astronomers need a fluid, responsive tool to explore gravitational interactions in real-time.

## The Solution

A browser-based sandbox where users can:

- **Experiment interactively** with planetary masses and orbital distances
- **Visualize gravitational forces** and planetary trajectories in real-time
- **Adjust parameters** (mass, time flow, initial positions) on-the-fly
- **Experience smooth performance** through Rust's computational efficiency

## Key Features

- **2-Body Orbital Mechanics**: Accurate simulation of gravitational interactions between celestial bodies
- **Real-time Parameter Control**: Adjust mass and time scale without restarting
- **Interactive Sandbox** (stretch goal): Add/remove planets via mouse clicks
- **Trajectory Visualization**: Visual display of planetary paths
- **Performance**: No stuttering or garbage collection jank—guaranteed smooth 60 FPS

## Tech Stack

### Frontend (Web Interface)

- **React** + **TypeScript** for reactive UI components
- **Vite** for fast development builds
- **Canvas API** for smooth 2D rendering

### Backend (Physics Engine)

- **Rust** compiled to **WebAssembly (WASM)** for near-native performance
- **wasm-bindgen** for seamless Rust ↔ JavaScript communication
- **nalgebra** for efficient vector mathematics
- **64-bit floats** for high-precision physics calculations

### Architecture

Physics calculations run in Rust/WASM, while DOM interactions and visualization run in JavaScript—the best of both worlds.

## Learning Goals

This project demonstrates:

- **Systems programming** with Rust (memory efficiency, no garbage collection overhead)
- **Web technologies** (WASM, Canvas, modern JavaScript)
- **Physics simulation** (gravitational mechanics, numerical methods)
- **Performance optimization** techniques for computational workloads

- **Exam project for Advanced Programming Module** | Team: Gemming, Müller, Tsigaropoulos
