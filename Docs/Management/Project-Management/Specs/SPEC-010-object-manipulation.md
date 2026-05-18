# SPEC-010: Object Manipulation & Management

---

## 📝 User Story
```
As a user in sandbox mode
I want to edit and delete bodies after placing them
so that I can refine simulations and explore different configurations
```

---

## ✅ Acceptance Criteria

### Body Selection
- [ ] AC 1.1: Right-click on body to open context menu
- [ ] AC 1.2: Visual feedback when body is selected (highlight/outline)
- [ ] AC 1.3: Only one body selected at a time
- [ ] AC 1.4: Click empty space to deselect

### Edit Menu Options
- [ ] AC 2.1: Delete body (with confirmation)
- [ ] AC 2.2: Edit mass (slider or numeric input)
- [ ] AC 2.3: Edit velocity (magnitude and direction)
- [ ] AC 2.4: Edit color
- [ ] AC 2.5: Lock body (prevent deletion, visual lock indicator)
- [ ] AC 2.6: Edit body name/label

### Real-time Updates
- [ ] AC 3.1: Mass changes immediately affect orbits
- [ ] AC 3.2: Velocity changes apply on next simulation step
- [ ] AC 3.3: No simulation restart required for edits
- [ ] AC 3.4: Changes reflected in state display

### Edit Dialog
- [ ] AC 4.1: Modal dialog with all editable fields
- [ ] AC 4.2: Preview mode shows changes before confirming
- [ ] AC 4.3: Cancel reverts to previous values
- [ ] AC 4.4: Confirm applies changes

### Body List
- [ ] AC 5.1: Sidebar shows list of all bodies
- [ ] AC 5.2: Each entry shows: name, mass, color indicator
- [ ] AC 5.3: Click entry to select body
- [ ] AC 5.4: Quick delete button per entry

### Performance
- [ ] AC 6.1: Edit operations (mass, velocity) don't cause frame drops
- [ ] AC 6.2: Body list updates smoothly with 10+ bodies
- [ ] AC 6.3: No memory leaks when deleting/re-adding bodies

---

## 🔧 Technical Solution

### Context Menu Handler

**`src/components/Canvas/Canvas.tsx` (enhanced)**
```typescript
const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
  e.preventDefault();

  if (!sandboxMode) return;

  const rect = canvasRef.current?.getBoundingClientRect();
  if (!rect) return;

  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;

  // Find body at click position
  const worldPos = canvasToWorld({ x: canvasX, y: canvasY }, viewportConfig);
  const selectedBody = findBodyAtPosition(worldPos, bodies, viewportConfig);

  if (selectedBody) {
    setSelectedBody(selectedBody);
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }
};
```

### Context Menu Component

**`src/components/BodyContextMenu/BodyContextMenu.tsx`**
```typescript
interface BodyContextMenuProps {
  body: Body;
  position: { x: number; y: number };
  onEdit: (body: Body) => void;
  onDelete: (id: string) => void;
  onLock: (id: string, locked: boolean) => void;
  onClose: () => void;
}

export const BodyContextMenu: React.FC<BodyContextMenuProps> = ({
  body,
  position,
  onEdit,
  onDelete,
  onLock,
  onClose,
}) => {
  const handleDelete = () => {
    if (confirm('Delete this body?')) {
      onDelete(body.id);
      onClose();
    }
  };

  return (
    <menu
      style={{ position: 'fixed', left: position.x, top: position.y }}
      className={styles.contextMenu}
      onBlur={onClose}
    >
      <menuitem onClick={() => onEdit(body)}>
        ✏️ Edit
      </menuitem>
      <menuitem onClick={() => onLock(body.id, !body.locked)}>
        {body.locked ? '🔓 Unlock' : '🔒 Lock'}
      </menuitem>
      <hr />
      <menuitem onClick={handleDelete} className={styles.danger}>
        ❌ Delete
      </menuitem>
    </menu>
  );
};
```

### Body Edit Dialog

**`src/components/BodyEditDialog/BodyEditDialog.tsx`**
```typescript
interface BodyEditDialogProps {
  body: Body;
  onConfirm: (body: Body) => void;
  onCancel: () => void;
}

export const BodyEditDialog: React.FC<BodyEditDialogProps> = ({
  body,
  onConfirm,
  onCancel,
}) => {
  const [edited, setEdited] = useState(body);

  const handleChange = (key: keyof Body, value: any) => {
    setEdited({ ...edited, [key]: value });
  };

  const handleVelocityChange = (mag: number, dir: number) => {
    const vx = mag * Math.cos(dir);
    const vy = mag * Math.sin(dir);
    handleChange('velocity', [vx, vy]);
  };

  return (
    <dialog open className={styles.dialog}>
      <h3>Edit Body: {edited.name || edited.id}</h3>

      <div className={styles.field}>
        <label>Name</label>
        <input
          type="text"
          value={edited.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Mass (kg)</label>
        <input
          type="number"
          value={edited.mass}
          onChange={(e) => handleChange('mass', parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label>Velocity Magnitude (m/s)</label>
        <input
          type="number"
          value={Math.hypot(...edited.velocity)}
          onChange={(e) => {
            const mag = parseFloat(e.target.value);
            const dir = Math.atan2(edited.velocity[1], edited.velocity[0]);
            handleVelocityChange(mag, dir);
          }}
        />
      </div>

      <div className={styles.field}>
        <label>Color</label>
        <input
          type="color"
          value={edited.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button onClick={() => onConfirm(edited)}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </dialog>
  );
};
```

### Body List Sidebar

**`src/components/BodyList/BodyList.tsx`**
```typescript
interface BodyListProps {
  bodies: Body[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit: (body: Body) => void;
  onDelete: (id: string) => void;
}

export const BodyList: React.FC<BodyListProps> = ({
  bodies,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.bodyList}>
      <h3>Bodies ({bodies.length}/10)</h3>
      <ul>
        {bodies.map((body) => (
          <li
            key={body.id}
            className={selectedId === body.id ? styles.selected : ''}
            onClick={() => onSelect(body.id)}
          >
            <div
              className={styles.colorDot}
              style={{ backgroundColor: body.color }}
            />
            <span>{body.name || `Body ${body.id.slice(-4)}`}</span>
            <span className={styles.mass}>{(body.mass / 1e24).toFixed(1)}e24 kg</span>
            {body.locked && <span className={styles.lock}>🔒</span>}
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${body.name || body.id}?`)) {
                  onDelete(body.id);
                }
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### State Extension

**`src/types/index.ts`**
```typescript
export interface Body {
  id: string;
  position: [number, number];
  velocity: [number, number];
  mass: number;
  radius: number;
  color: string;
  name?: string;
  locked?: boolean;
}
```

---

## 🧪 Tests

- [ ] Unit: Body selection detection (click → find body)
- [ ] Component: Edit dialog updates state correctly
- [ ] Integration: Edit mass → physics updates
- [ ] Integration: Delete body → removed from simulation
- [ ] Manual: Right-click body, edit properties, verify changes

---

## 🚀 Implementation Flow

1. Spec Review → Context menu handler (RED) → Dialog component (GREEN) → Body list UI → State management → Tests

---

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] DOD-Interaction: Right-click menu works, edits apply
- [ ] DOD-UX: Body list updates smoothly
- [ ] All component tests passing

---

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-005, SPEC-006, SPEC-009
**Related**: SPEC-007, SPEC-008
