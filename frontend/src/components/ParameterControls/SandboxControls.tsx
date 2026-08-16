import { useState } from 'react';
import { SandboxControlsProps, SandboxBody } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { SandboxBodyItem } from './SandboxBodyItem';
import { colors } from '../../styles/tokens';

const SECTION_HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: colors.white,
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
  background: colors.accentGradient,
  color: colors.white,
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
} as const;

const ADD_BUTTON_STYLE = (active: boolean) => (active ? ADD_BUTTON_ACTIVE_STYLE : ADD_BUTTON_INACTIVE_STYLE);

/** Prefers the controlled `selectedBodyId` prop when the parent supplies one, falling back to context state. */
function resolveActiveSelectedId(propsSelectedId: string | null | undefined, contextSelectedId: string | null): string | null {
  return propsSelectedId !== undefined ? propsSelectedId : contextSelectedId;
}

/** Notifies both the optional controlled-mode callback and context state of a selection change. */
function notifySelection(id: string | null, onSelectBody: ((id: string | null) => void) | undefined, setSelectedBodyId: ((id: string | null) => void) | undefined): void {
  onSelectBody?.(id);
  setSelectedBodyId?.(id);
}

/**
 * Renders sandbox specific panel controls including custom bodies listing, selection, editing, and active toggling.
 */
// Remaining branches (selection toggle, reset confirmation) are each a single, already-minimal
// condition; the body-sync/style logic they used to carry was already extracted above.
// fallow-ignore-next-line complexity
export function SandboxControls({ placementActive, setPlacementActive, selectedBodyId: propsSelectedId, onSelectBody }: SandboxControlsProps) {
  const { sandboxBodies, removeBody, updateBody, setMode, selectedBodyId: contextSelectedId, setSelectedBodyId } = useSimulationContext();
  const { t } = useI18n();
  const [editingBody, setEditingBody] = useState<SandboxBody | null>(null);

  const activeSelectedId = resolveActiveSelectedId(propsSelectedId, contextSelectedId);

  const handleSelect = (id: string) => {
    notifySelection(activeSelectedId === id ? null : id, onSelectBody, setSelectedBodyId);
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

      {placementActive && <div style={{ fontSize: '11px', color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' }}>{t('sandbox.helpText')}</div>}

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
            labels={{
              edit: t('sandbox.editBody'),
              delete: t('sandbox.deleteBody'),
              defaultName: t('sandbox.defaultBodyName'),
              locked: t('editDialog.locked'),
            }}
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
