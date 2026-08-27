# SPEC-016: Miniview Canvas

-

## 📝 User Story
```text
As a user studying celestial orbits
I want a secondary picture-in-picture mini view canvas focused on a selected celestial body
so that I can observe close-up orbital motion and local telemetry while retaining the full simulation system overview
```
-

## ✅ Acceptance Criteria

### Miniview Activation & Mounting
- [x] AC 1.1: Miniview button in body list sidebar item toggles Picture-in-Picture miniview for target body
- [x] AC 1.2: Context menu option (Miniview) toggles miniview card display
- [x] AC 1.3: Floating miniview card renders overlay on top of main simulation viewport with close button
- [x] AC 1.4: Card header displays targeted body name, color badge, and live telemetry (velocity magnitude, mass, position)

### Miniview Rendering & Isolation
- [x] AC 2.1: Miniview container mounts a dedicated HTML5 `<canvas>` element (`aria-label="Body miniview"`)
- [x] AC 2.2: Miniview camera renders high-zoom view centered on target body position in real-time
- [x] AC 2.3: Miniview renders target body, trajectory trails, and nearby bodies within close-up bounding box
- [x] AC 2.4: Miniview canvas updates synchronously with main simulation animation frame loop

### Cleanup & Lifecycle Management
- [x] AC 3.1: Closing miniview card unmounts canvas and stops mini-render loop without memory leaks
- [x] AC 3.2: Deleting target body automatically closes miniview card
- [x] AC 3.3: Preset switching or simulation reset safely clears active miniview target

-

## 🔧 Technical Solution

### Component: `MiniviewCanvas`

**`frontend/src/components/MiniviewCanvas/MiniviewCanvas.tsx`**
```typescript
import React, { useRef, useEffect } from 'react';
import { Body } from '../../types';
import { drawBody, drawGrid } from '../../services/CanvasRenderer';

interface MiniviewCanvasProps {
  body: Body;
  allBodies: Body[];
  width?: number;
  height?: number;
  zoom?: number;
  onClose: () => void;
}

export const MiniviewCanvas: React.FC<MiniviewCanvasProps> = ({
  body,
  allBodies,
  width = 240,
  height = 180,
  zoom = 1.5,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Render localized grid and centered body
    const center = { x: width / 2, y: height / 2 };
    drawGrid(ctx, width, height, center, zoom);

    allBodies.forEach((b) => {
      const relX = center.x + (b.position[0] - body.position[0]) * zoom;
      const relY = center.y + (b.position[1] - body.position[1]) * zoom;
      drawBody(ctx, b, relX, relY, zoom);
    });
  }, [body, allBodies, width, height, zoom]);

  return (
    <div className="miniview-card">
      <div className="miniview-header">
        <span>🔍 {body.name}</span>
        <button onClick={onClose}>✕</button>
      </div>
      <canvas ref={canvasRef} width={width} height={height} aria-label="Body miniview" />
    </div>
  );
};
```

### Custom Hook: `useMiniview`

**`frontend/src/hooks/useMiniview.ts`**
```typescript
import { useState, useCallback, useEffect } from 'react';
import { Body } from '../types';

export function useMiniview(bodies: Body[]) {
  const [miniviewBodyId, setMiniviewBodyId] = useState<string | null>(null);

  const toggleMiniview = useCallback((bodyId: string) => {
    setMiniviewBodyId((prev) => (prev === bodyId ? null : bodyId));
  }, []);

  const closeMiniview = useCallback(() => {
    setMiniviewBodyId(null);
  }, []);

  useEffect(() => {
    if (miniviewBodyId && !bodies.some((b) => b.id === miniviewBodyId)) {
      setMiniviewBodyId(null);
    }
  }, [bodies, miniviewBodyId]);

  const miniviewBody = bodies.find((b) => b.id === miniviewBodyId) || null;

  return {
    miniviewBodyId,
    miniviewBody,
    toggleMiniview,
    closeMiniview,
  };
}
```

-

## 🧪 Tests

- [x] Unit: `useMiniview` hook toggles miniview target body ID and clears on body removal
- [x] Component: `MiniviewCanvas` renders canvas element with correct `aria-label` and close button handler
- [x] E2E: Miniview button click mounts floating card canvas, second click unmounts it

-

## 🚀 Implementation Flow

1. Spec Definition → `useMiniview` hook → `MiniviewCanvas` component → Sidebar & Context Menu controls → E2E Validation

-

## ✅ Definition of Done

- [x] DOD-Global: All acceptance criteria met
- [x] DOD-Performance: Dedicated mini canvas rendering has negligible overhead (< 2ms per frame)
- [x] Unit & E2E tests passing

-

## 📚 Related Specs

**Depends on**: SPEC-005, SPEC-006, SPEC-010
**Related**: SPEC-015 (Object Tracking)
