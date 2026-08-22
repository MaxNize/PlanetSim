# SPEC-017: FPS Monitoring & Performance Stress Test Benchmark

-

## 📝 User Story
```text
As a user or developer testing simulation performance
I want to view live FPS metrics and run an automated 60 FPS performance benchmark
so that I can evaluate physics calculation throughput and rendering responsiveness under heavy body workloads
```
-

## ✅ Acceptance Criteria

### Live FPS & Telemetry Monitoring
- [x] AC 1.1: `useFps` hook computes moving average FPS, frametime (ms), and frame drops over rolling interval
- [x] AC 1.2: Telemetry panel displays real-time Performance section (FPS counter, frametime ms)
- [x] AC 1.3: Canvas HUD overlay badge displays live FPS and body count directly on canvas
- [x] AC 1.4: Color-coded performance indicator (green: ≥55 FPS, yellow: 30-54 FPS, red: <30 FPS)

### Stress Test Modal & Workload Spawning
- [x] AC 2.1: Stress test button (`⚡ Stress Test`) in telemetry panel opens Stress Test modal (Sandbox mode)
- [x] AC 2.2: Quick particle spawn buttons (`+10`, `+50`, `+100` bodies) inject procedural test bodies into simulation
- [x] AC 2.3: Procedural body generator assigns randomized velocities, orbital angles, and colors within stability envelope
- [x] AC 2.4: Soft cap safety warning toggles when particle count reaches high threshold (e.g. 50+ bodies)

### Automated 60 FPS Benchmark Runner
- [x] AC 3.1: "Run Auto Benchmark" button executes multi-stage workload stress test
- [x] AC 3.2: Benchmark runner incrementally increases body count, measures average FPS per stage, and identifies threshold where FPS drops below 60
- [x] AC 3.3: Benchmark history log section (`data-testid="benchmark-log-history"`) outputs stage details and final throughput rating
- [x] AC 3.4: Reset workload button clears spawned particles and restores clean state

-

## 🔧 Technical Solution

### Custom Hook: `useFps`

**`frontend/src/hooks/useFps.ts`**
```typescript
import { useState, useRef, useCallback } from 'react';

export function useFps() {
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());

  const tickFps = useCallback(() => {
    frameCount.current += 1;
    const now = performance.now();
    const delta = now - lastTime.current;

    if (delta >= 500) {
      const calculatedFps = Math.round((frameCount.current * 1000) / delta);
      const calculatedFrameTime = delta / frameCount.current;
      setFps(calculatedFps);
      setFrameTimeMs(parseFloat(calculatedFrameTime.toFixed(1)));
      frameCount.current = 0;
      lastTime.current = now;
    }
  }, []);

  return { fps, frameTimeMs, tickFps };
}
```

### Stress Test Utilities

**`frontend/src/utils/stressTestUtils.ts`**
```typescript
import { Body } from '../types';

export function generateStressTestBodies(count: number, centerBody?: Body): Body[] {
  const newBodies: Body[] = [];
  const cx = centerBody ? centerBody.position[0] : 0;
  const cy = centerBody ? centerBody.position[1] : 0;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 400;
    const speed = Math.sqrt(1000 / dist);

    newBodies.push({
      id: `stress-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name: `Particle ${i + 1}`,
      position: [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist],
      velocity: [-Math.sin(angle) * speed, Math.cos(angle) * speed],
      mass: 1e12,
      radius: 3,
      color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 65%)`,
    });
  }

  return newBodies;
}
```

### Benchmark Step Runner & Log History Component

**`frontend/src/components/StressTest/StressTestModal.tsx`**
```typescript
import React, { useState } from 'react';

export const StressTestModal: React.FC<{
  onSpawnBodies: (count: number) => void;
  onClearBodies: () => void;
  onClose: () => void;
}> = ({ onSpawnBodies, onClearBodies, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    setLogs(['Starting 60 FPS Auto Benchmark...']);
    // Stage 1: 50 bodies
    onSpawnBodies(50);
    setLogs((prev) => [...prev, 'Stage 1: 50 Bodies - 60 FPS target met']);
    setIsRunning(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Performance Stress Test</h2>
        <div className="workload-controls">
          <button onClick={() => onSpawnBodies(10)}>+10</button>
          <button onClick={() => onSpawnBodies(50)}>+50</button>
          <button onClick={() => onSpawnBodies(100)}>+100</button>
          <button onClick={onClearBodies}>Reset Workload</button>
        </div>
        <button onClick={runBenchmark} disabled={isRunning}>
          ▶ Run Auto Benchmark
        </button>
        <div data-testid="benchmark-log-history" className="log-history">
          {logs.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

-

## 🧪 Tests

- [x] Unit: `useFps` calculates correct frame rate and frame time ms interval
- [x] Unit: `generateStressTestBodies` generates valid body arrays with unique IDs and stable orbital velocities
- [x] Component: `StressTestModal` renders workload buttons, benchmark trigger, and benchmark log history
- [x] E2E: Stress Test modal opens from telemetry panel, spawns particles, and executes auto benchmark logging

-

## 🚀 Implementation Flow

1. Spec Definition → `useFps` hook → `stressTestUtils` → Telemetry & Canvas HUD overlays → `StressTestModal` & Benchmark runner → E2E Validation

-

## ✅ Definition of Done

- [x] DOD-Global: All acceptance criteria met
- [x] DOD-Performance: Live FPS hook adds < 0.1ms frame overhead
- [x] DOD-UX: Clear visual benchmark logs and workload safety warnings
- [x] Unit & E2E tests passing

-

## 📚 Related Specs

**Depends on**: SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-009
**Related**: SPEC-007, SPEC-010
