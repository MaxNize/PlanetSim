import { useState } from 'react';
import { SandboxControlsProps, SandboxBody } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';

const SECTION_HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fff',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
  margin: 0,
} as const;

const ADD_BUTTON_BASE_STYLE = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  outline: 'none',
} as const;

const ADD_BUTTON_ACTIVE_STYLE = {
  ...ADD_BUTTON_BASE_STYLE,
  border: '1px solid #10b981',
  background: 'rgba(16, 185, 129, 0.15)',
  color: '#10b981',
  boxShadow: 'none',
} as const;

const ADD_BUTTON_INACTIVE_STYLE = {
  ...ADD_BUTTON_BASE_STYLE,
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
} as const;

const ADD_BUTTON_STYLE = (active: boolean) => (active ? ADD_BUTTON_ACTIVE_STYLE : ADD_BUTTON_INACTIVE_STYLE);

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

interface SandboxBodyItemProps {
  body: SandboxBody;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (body: SandboxBody) => void;
  onDelete: (id: string) => void;
  editLabel: string;
  deleteLabel: string;
  defaultNameLabel: string;
  lockedLabel: string;
}

function SandboxBodyItem({ body, isSelected, onSelect, onEdit, onDelete, editLabel, deleteLabel, defaultNameLabel, lockedLabel }: SandboxBodyItemProps) {
  return (
    <div style={BODY_ITEM_STYLE(isSelected)} onClick={() => onSelect(body.id)} data-testid={`body-item-${body.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: body.color }} />
        <span style={{ fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#38bdf8' : '#fff' }}>
          {body.name || defaultNameLabel}
        </span>
        {body.locked && (
          <span title={lockedLabel} style={{ fontSize: '11px' }}>
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
          title={editLabel}
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
          style={{
            ...ACTION_BUTTON_STYLE,
            color: body.locked ? '#64748b' : '#ef4444',
            cursor: body.locked ? 'not-allowed' : 'pointer',
            opacity: body.locked ? 0.4 : 1,
          }}
          title={deleteLabel}
          data-testid={`delete-btn-${body.id}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Renders sandbox specific panel controls including custom bodies listing, selection, editing, and active toggling.
 */
export function SandboxControls({ placementActive, setPlacementActive, selectedBodyId: propsSelectedId, onSelectBody }: SandboxControlsProps) {
  const { sandboxBodies, removeBody, updateBody, setMode, selectedBodyId: contextSelectedId, setSelectedBodyId } = useSimulationContext();
  const { t } = useI18n();
  const [editingBody, setEditingBody] = useState<SandboxBody | null>(null);

  const activeSelectedId = propsSelectedId !== undefined ? propsSelectedId : contextSelectedId;

  const handleSelect = (id: string) => {
    const nextId = activeSelectedId === id ? null : id;
    if (onSelectBody) onSelectBody(nextId);
    if (setSelectedBodyId) setSelectedBodyId(nextId);
  };

  const handleReset = () => {
    if (window.confirm(t('sandbox.resetConfirm'))) {
      setMode('3body');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={SECTION_HEADER_STYLE}>{t('sandbox.creatorTitle')}</h3>

      <button onClick={() => setPlacementActive(!placementActive)} style={ADD_BUTTON_STYLE(placementActive)}>
        {placementActive ? t('sandbox.placingActive') : t('sandbox.addBody')}
      </button>

      {placementActive && <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>{t('sandbox.helpText')}</div>}

      <h3 style={SECTION_HEADER_STYLE}>
        {t('sandbox.bodiesTitle')} ({sandboxBodies.length}/10)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {sandboxBodies.map((b) => (
          <SandboxBodyItem
            key={b.id}
            body={b}
            isSelected={activeSelectedId === b.id}
            onSelect={handleSelect}
            onEdit={setEditingBody}
            onDelete={removeBody}
            editLabel={t('sandbox.editBody')}
            deleteLabel={t('sandbox.deleteBody')}
            defaultNameLabel={t('sandbox.defaultBodyName')}
            lockedLabel={t('editDialog.locked')}
          />
        ))}
      </div>

      {editingBody && (
        <BodyEditDialog
          body={editingBody}
          onConfirm={(updated) => {
            updateBody(updated.id, updated);
            setEditingBody(null);
          }}
          onCancel={() => setEditingBody(null)}
        />
      )}

      {sandboxBodies.length >= 6 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#f59e0b' }}>
          {t('sandbox.highCountWarning')}
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          outline: 'none',
        }}
      >
        {t('sandbox.exitSandbox')}
      </button>
    </div>
  );
}
