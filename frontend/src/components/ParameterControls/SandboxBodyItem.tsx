import { SandboxBody } from '../../types';

const BODY_ITEM_STYLE = (selected: boolean) =>
  ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: selected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    border: selected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }) as const;

const ACTION_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  borderRadius: '4px',
} as const;

const DELETE_BUTTON_ENABLED_STYLE = { ...ACTION_BUTTON_STYLE, color: '#ef4444', cursor: 'pointer', opacity: 1 } as const;
const DELETE_BUTTON_DISABLED_STYLE = { ...ACTION_BUTTON_STYLE, color: '#64748b', cursor: 'not-allowed', opacity: 0.4 } as const;
const deleteButtonStyle = (locked: boolean) => (locked ? DELETE_BUTTON_DISABLED_STYLE : DELETE_BUTTON_ENABLED_STYLE);

const NAME_STYLE_BASE = { fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;
const nameStyle = (isSelected: boolean) => ({ ...NAME_STYLE_BASE, color: isSelected ? '#38bdf8' : '#fff' });

export interface SandboxBodyItemLabels {
  edit: string;
  delete: string;
  defaultName: string;
  locked: string;
}

interface SandboxBodyItemProps {
  body: SandboxBody;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (body: SandboxBody) => void;
  onDelete: (id: string) => void;
  labels: SandboxBodyItemLabels;
}

/**
 * Renders a single sandbox body row with selection, edit, and delete controls.
 */
export function SandboxBodyItem({ body, isSelected, onSelect, onEdit, onDelete, labels }: SandboxBodyItemProps) {
  return (
    <div style={BODY_ITEM_STYLE(isSelected)} onClick={() => onSelect(body.id)} data-testid={`body-item-${body.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: body.color }} />
        <span style={nameStyle(isSelected)}>{body.name || labels.defaultName}</span>
        {body.locked && (
          <span title={labels.locked} style={{ fontSize: '11px' }}>
            🔒
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>{(body.mass / 5.9722e24).toFixed(1)} M⊕</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(body);
          }}
          style={ACTION_BUTTON_STYLE}
          title={labels.edit}
          data-testid={`edit-btn-${body.id}`}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!body.locked) onDelete(body.id);
          }}
          disabled={body.locked}
          style={deleteButtonStyle(Boolean(body.locked))}
          title={labels.delete}
          data-testid={`delete-btn-${body.id}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
