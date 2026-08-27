# SPEC-015: Object Tracking & Camera Follow

-

## 📝 User Story
```text
As a user exploring planetary systems
I want to lock the camera to follow a specific celestial body as it moves
so that I can continuously observe its relative trajectory and interaction with nearby objects without manual panning
```
-

## ✅ Acceptance Criteria

### Tracking Activation & Selection
- [x] AC 1.1: Track button in body item sidebar list toggles tracking state for the target body
- [x] AC 1.2: Context menu option (Track Body / Stop Tracking) toggles body tracking state
- [x] AC 1.3: Only one body can be tracked at a time (activating tracking on another body replaces target)
- [x] AC 1.4: Visual status badge in HUD indicates active tracking target name

### Dynamic Camera Follow
- [x] AC 2.1: Camera viewport dynamically updates canvas pan offset to center the tracked body at `(canvasWidth / 2, canvasHeight / 2)`
- [x] AC 2.2: Zoom level changes remain centered on the tracked body while tracking is active
- [x] AC 2.3: Real-time physics step updates recalculate viewport pan smooth offset without jitter

### Disengagement & Edge Cases
- [x] AC 3.1: Manual user panning (e.g. holding Space and dragging canvas) disengages camera tracking
- [x] AC 3.2: Untracking via sidebar or context menu releases camera position lock
- [x] AC 3.3: Deleting a tracked body automatically resets tracking state to null without errors
- [x] AC 3.4: Preset switching or simulation reset safely clears target body tracking

-

## 🔧 Technical Solution

### Custom Hook: `useBodyTracking`

**`frontend/src/hooks/useBodyTracking.ts`**
```typescript
import { useState, useCallback, useEffect } from 'react';
import { Body } from '../types';

export function useBodyTracking(bodies: Body[]) {
  const [trackedBodyId, setTrackedBodyId] = useState<string | null>(null);

  const toggleTrackBody = useCallback((bodyId: string) => {
    setTrackedBodyId((prev) => (prev === bodyId ? null : bodyId));
  }, []);

  const clearTracking = useCallback(() => {
    setTrackedBodyId(null);
  }, []);

  // Ensure tracking clears if body is deleted
  useEffect(() => {
    if (trackedBodyId && !bodies.some((b) => b.id === trackedBodyId)) {
      setTrackedBodyId(null);
    }
  }, [bodies, trackedBodyId]);

  const trackedBody = bodies.find((b) => b.id === trackedBodyId) || null;

  return {
    trackedBodyId,
    trackedBody,
    toggleTrackBody,
    clearTracking,
  };
}
```

### Viewport Pan Centering Integration

**`frontend/src/services/CanvasRenderer.ts`**
```typescript
export function calculateTrackedPanOffset(
  trackedBodyPos: [number, number],
  canvasSize: { width: number; height: number },
  zoom: number
): [number, number] {
  const [bx, by] = trackedBodyPos;
  return [
    canvasSize.width / 2 - bx * zoom,
    canvasSize.height / 2 - by * zoom,
  ];
}
```

-

## 🧪 Tests

- [x] Unit: `useBodyTracking` hook toggles target body ID correctly
- [x] Unit: `useBodyTracking` hook resets state when target body is removed from bodies list
- [x] Integration: Viewport centering updates offset when body moves during simulation step
- [x] E2E: Track button in sidebar locks camera and updates tracking status badge

-

## 🚀 Implementation Flow

1. Spec Definition → `useBodyTracking` hook → Canvas pan calculation integration → Sidebar & Context Menu UI controls → E2E Validation

-

## ✅ Definition of Done

- [x] DOD-Global: All acceptance criteria met
- [x] DOD-UX: Smooth tracking without camera jitter or canvas flicker
- [x] DOD-Safety: Deleting or clearing bodies safely resets tracking
- [x] Unit & E2E tests passing

-

## 📚 Related Specs

**Depends on**: SPEC-005, SPEC-006, SPEC-007, SPEC-010
**Related**: SPEC-016 (Miniview Canvas)
