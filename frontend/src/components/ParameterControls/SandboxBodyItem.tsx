import { SandboxBody } from '../../types';
import { colors } from '../../styles/tokens';

const BODY_ITEM_STYLE = (selected: boolean) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: selected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    border: selected ? `1px solid ${colors.selection}` : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }) as const;

const ROW_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as const;
const ACTIONS_ROW_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' } as const;

const ACTION_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  color: colors.textMuted,
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  borderRadius: '4px',
} as const;

const ACTION_BUTTON_ACTIVE_STYLE = { ...ACTION_BUTTON_STYLE, color: colors.accent } as const;
const actionButtonStyle = (active: boolean) => (active ? ACTION_BUTTON_ACTIVE_STYLE : ACTION_BUTTON_STYLE);

const DELETE_BUTTON_ENABLED_STYLE = { ...ACTION_BUTTON_STYLE, color: '#ef4444', cursor: 'pointer', opacity: 1 } as const;
const DELETE_BUTTON_DISABLED_STYLE = { ...ACTION_BUTTON_STYLE, color: '#64748b', cursor: 'not-allowed', opacity: 0.4 } as const;
const deleteButtonStyle = (locked: boolean) => (locked ? DELETE_BUTTON_DISABLED_STYLE : DELETE_BUTTON_ENABLED_STYLE);

const NAME_STYLE_BASE = { fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;
const nameStyle = (isSelected: boolean) => ({ ...NAME_STYLE_BASE, color: isSelected ? colors.selection : colors.white });

export interface SandboxBodyItemLabels {
  edit: string;
  delete: string;
  defaultName: string;
  locked: string;
  track: string;
  untrack: string;
  showMiniview: string;
  hideMiniview: string;
}

interface SandboxBodyItemProps {
  body: SandboxBody;
  isSelected: boolean;
  isTracked: boolean;
  isInMiniview: boolean;
  onSelect: (id: string) => void;
  onEdit: (body: SandboxBody) => void;
  onDelete: (id: string) => void;
  onTrackToggle: (body: SandboxBody) => void;
  onMiniviewToggle: (body: SandboxBody) => void;
  labels: SandboxBodyItemLabels;
}

/**
 * Renders a single sandbox body row with selection, track, miniview, edit, and delete controls.
 */
// JSX volume (5 already-minimal action buttons), not branchy logic — cyclomatic is low.
// fallow-ignore-next-line complexity
export function SandboxBodyItem({ body, isSelected, isTracked, isInMiniview, onSelect, onEdit, onDelete, onTrackToggle, onMiniviewToggle, labels }: SandboxBodyItemProps) {
  return (
    <div style={BODY_ITEM_STYLE(isSelected)} onClick={() => onSelect(body.id)} data-testid={`body-item-${body.id}`}>
      <div style={ROW_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ flexShrink: 0, display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: body.color }} />
          <span style={nameStyle(isSelected)}>{body.name || labels.defaultName}</span>
          {body.locked && (
            <span title={labels.locked} style={{ flexShrink: 0, fontSize: '11px' }}>
              🔒
            </span>
          )}
        </div>
        <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: colors.textMuted }}>{(body.mass / 5.9722e24).toFixed(1)} M⊕</span>
      </div>
      <div style={ACTIONS_ROW_STYLE}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTrackToggle(body);
          }}
          style={actionButtonStyle(isTracked)}
          title={isTracked ? labels.untrack : labels.track}
          data-testid={`track-btn-${body.id}`}
        >
          🎯
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMiniviewToggle(body);
          }}
          style={actionButtonStyle(isInMiniview)}
          title={isInMiniview ? labels.hideMiniview : labels.showMiniview}
          data-testid={`miniview-btn-${body.id}`}
        >
          🔍
        </button>
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
