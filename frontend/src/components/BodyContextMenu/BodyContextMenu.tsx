import { useEffect, useRef } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { colors } from '../../styles/tokens';

interface BodyContextMenuProps {
  body: SandboxBody;
  position: { x: number; y: number };
  /** Full menu (Edit/Lock/Delete + Track/Miniview) in sandbox mode; only Track/Miniview elsewhere (FP-39/FP-36). */
  showFullMenu: boolean;
  isTracked: boolean;
  onTrackToggle: (body: SandboxBody) => void;
  isInMiniview: boolean;
  onMiniviewToggle: (body: SandboxBody) => void;
  onEdit: (body: SandboxBody) => void;
  onLockToggle: (body: SandboxBody) => void;
  onDelete: (body: SandboxBody) => void;
  onClose: () => void;
}

interface MenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  hoverColor: string;
  children: React.ReactNode;
}

function MenuItem({ onClick, disabled = false, color, hoverColor, children }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '8px 14px',
        background: 'none',
        border: 'none',
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );
}

/** Renders the body-name header row shared by both the full and reduced context menu. */
function MenuHeader({ body, t }: { body: SandboxBody; t: (key: string) => string }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: 600,
        color: colors.textMuted,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: body.color, display: 'inline-block' }} />
      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body.name || t('sandbox.defaultBodyName')}</span>
    </div>
  );
}

/** Context menu: Track/Miniview (any mode) plus Edit/Lock/Delete (sandbox mode only). */
// JSX volume (header + up to 5 already-extracted MenuItems), not branchy logic — cyclomatic is low.
// fallow-ignore-next-line complexity
export function BodyContextMenu({ body, position, showFullMenu, isTracked, onTrackToggle, isInMiniview, onMiniviewToggle, onEdit, onLockToggle, onDelete, onClose }: BodyContextMenuProps) {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.min(position.x, window.innerWidth - 180);
  const adjustedY = Math.min(position.y, window.innerHeight - 160);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        zIndex: 1000,
        minWidth: '160px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        padding: '6px 0',
        color: colors.textPrimary,
        fontSize: '13px',
        userSelect: 'none',
      }}
      data-testid="body-context-menu"
    >
      <MenuHeader body={body} t={t} />

      <MenuItem
        onClick={() => {
          onTrackToggle(body);
          onClose();
        }}
        color={isTracked ? colors.accent : colors.textPrimary}
        hoverColor="rgba(59, 130, 246, 0.2)"
      >
        {isTracked ? t('contextMenu.untrack') : t('contextMenu.track')}
      </MenuItem>

      <MenuItem
        onClick={() => {
          onMiniviewToggle(body);
          onClose();
        }}
        color={isInMiniview ? colors.accent : colors.textPrimary}
        hoverColor="rgba(59, 130, 246, 0.2)"
      >
        {isInMiniview ? t('contextMenu.hideMiniview') : t('contextMenu.showMiniview')}
      </MenuItem>

      {showFullMenu && (
        <>
          <MenuItem
            onClick={() => {
              onEdit(body);
              onClose();
            }}
            color={colors.textPrimary}
            hoverColor="rgba(59, 130, 246, 0.2)"
          >
            {t('contextMenu.edit')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onLockToggle(body);
              onClose();
            }}
            color={body.locked ? colors.warning : colors.textPrimary}
            hoverColor="rgba(59, 130, 246, 0.2)"
          >
            {body.locked ? t('contextMenu.unlock') : t('contextMenu.lock')}
          </MenuItem>

          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

          <MenuItem
            onClick={() => {
              if (!body.locked) {
                onDelete(body);
                onClose();
              }
            }}
            disabled={body.locked}
            color={body.locked ? '#64748b' : '#ef4444'}
            hoverColor="rgba(239, 68, 68, 0.2)"
          >
            {t('contextMenu.delete')}
          </MenuItem>
        </>
      )}
    </div>
  );
}
