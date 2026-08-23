import { useState } from 'react';
import { SandboxControlsProps, SandboxBody } from '../../types';
import { useSimulationContext } from '../../context/SimulationContext';
import { useI18n } from '../../context/I18nContext';
import { BodyEditDialog } from '../BodyEditDialog/BodyEditDialog';
import { SandboxBodyItem } from './SandboxBodyItem';
import { colors } from '../../styles/tokens';
import { MAX_SANDBOX_BODIES } from '../../context/useSandbox';

/**
 * The body list is windowed (only rows near the visible scroll area are mounted) so its DOM/React
 * cost stays flat instead of scaling with sandboxBodies.length — at the stress test's 1000-body
 * cap, mounting all rows unconditionally made the whole page (not just the canvas) sluggish.
 */
const LIST_HEIGHT_PX = 200;
const ROW_HEIGHT_PX = 64;
const ROW_GAP_PX = 8;
const ROW_STEP_PX = ROW_HEIGHT_PX + ROW_GAP_PX;
const OVERSCAN_ROWS = 3;

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

const HINT_STYLE = {
  fontSize: '11px',
  color: colors.textMuted,
  textAlign: 'center',
  fontStyle: 'italic',
} as const;

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
// fallow-ignore-next-line complexity
export function SandboxControls({ selectedBodyId: propsSelectedId, onSelectBody, onOpenStressTest }: SandboxControlsProps) {
  const {
    sandboxBodies,
    removeBody,
    updateBody,
    setMode,
    selectedBodyId: contextSelectedId,
    setSelectedBodyId,
    trackedBodyId,
    toggleTracking,
    miniviewBodyId,
    toggleMiniview,
  } = useSimulationContext();
  const { t } = useI18n();
  const [editingBody, setEditingBody] = useState<SandboxBody | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const activeSelectedId = resolveActiveSelectedId(propsSelectedId, contextSelectedId);

  const handleSelect = (id: string) => {
    notifySelection(activeSelectedId === id ? null : id, onSelectBody, setSelectedBodyId);
  };

  const handleReset = () => {
    if (window.confirm(t('sandbox.resetConfirm'))) {
      setMode('3body');
    }
  };

  const totalCount = sandboxBodies.length;
  const visibleRowCount = Math.ceil(LIST_HEIGHT_PX / ROW_STEP_PX) + OVERSCAN_ROWS * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_STEP_PX) - OVERSCAN_ROWS);
  const endIndex = Math.min(totalCount, startIndex + visibleRowCount);
  const visibleBodies = sandboxBodies.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * ROW_STEP_PX;
  const bottomSpacerHeight = (totalCount - endIndex) * ROW_STEP_PX;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={SECTION_HEADER_STYLE}>{t('sandbox.creatorTitle')}</h3>

      <div style={HINT_STYLE}>{t('sandbox.helpText')}</div>

      <h3 style={SECTION_HEADER_STYLE}>
        {t('sandbox.bodiesTitle')} ({sandboxBodies.length}/{MAX_SANDBOX_BODIES})
      </h3>

      <div style={{ maxHeight: `${LIST_HEIGHT_PX}px`, overflowY: 'auto' }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} data-testid="sandbox-body-list">
        {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}
        {visibleBodies.map((b) => (
          <div key={b.id} style={{ marginBottom: `${ROW_GAP_PX}px` }}>
            <SandboxBodyItem
              body={b}
              isSelected={activeSelectedId === b.id}
              isTracked={trackedBodyId === b.id}
              isInMiniview={miniviewBodyId === b.id}
              onSelect={handleSelect}
              onEdit={setEditingBody}
              onDelete={removeBody}
              onTrackToggle={toggleTracking}
              onMiniviewToggle={toggleMiniview}
              labels={{
                edit: t('sandbox.editBody'),
                delete: t('sandbox.deleteBody'),
                defaultName: t('sandbox.defaultBodyName'),
                locked: t('editDialog.locked'),
                track: t('contextMenu.track'),
                untrack: t('contextMenu.untrack'),
                showMiniview: t('contextMenu.showMiniview'),
                hideMiniview: t('contextMenu.hideMiniview'),
              }}
            />
          </div>
        ))}
        {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
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

      {sandboxBodies.length >= MAX_SANDBOX_BODIES * 0.5 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#f59e0b' }}>
          {t('sandbox.highCountWarning')}
        </div>
      )}

      {onOpenStressTest && (
        <button
          onClick={onOpenStressTest}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            border: '1px solid rgba(0, 210, 211, 0.35)',
            background: 'rgba(0, 210, 211, 0.12)',
            color: '#00d2d3',
            outline: 'none',
          }}
        >
          {t('controls.stressTest')}
        </button>
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
