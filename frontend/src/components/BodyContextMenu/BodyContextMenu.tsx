import { useEffect, useRef } from 'react';
import { SandboxBody } from '../../types';
import { useI18n } from '../../context/I18nContext';

interface BodyContextMenuProps {
  body: SandboxBody;
  position: { x: number; y: number };
  onEdit: (body: SandboxBody) => void;
  onLockToggle: (body: SandboxBody) => void;
  onDelete: (body: SandboxBody) => void;
  onClose: () => void;
}

/**
 * Renders a context menu for editing, locking, or deleting a sandbox body.
 */
export function BodyContextMenu({
  body,
  position,
  onEdit,
  onLockToggle,
  onDelete,
  onClose,
}: BodyContextMenuProps) {
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

  // Adjust menu position so it doesn't overflow screen boundaries
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
        color: '#f8fafc',
        fontSize: '13px',
        userSelect: 'none',
      }}
      data-testid="body-context-menu"
    >
      <div
        style={{
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#94a3b8',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: body.color,
            display: 'inline-block',
          }}
        />
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {body.name || t('sandbox.defaultBodyName')}
        </span>
      </div>

      <button
        onClick={() => {
          onEdit(body);
          onClose();
        }}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '8px 14px',
          background: 'none',
          border: 'none',
          color: '#f8fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {t('contextMenu.edit')}
      </button>

      <button
        onClick={() => {
          onLockToggle(body);
          onClose();
        }}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '8px 14px',
          background: 'none',
          border: 'none',
          color: body.locked ? '#f59e0b' : '#f8fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {body.locked ? t('contextMenu.unlock') : t('contextMenu.lock')}
      </button>

      <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

      <button
        onClick={() => {
          if (!body.locked) {
            onDelete(body);
            onClose();
          }
        }}
        disabled={body.locked}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '8px 14px',
          background: 'none',
          border: 'none',
          color: body.locked ? '#64748b' : '#ef4444',
          cursor: body.locked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          opacity: body.locked ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!body.locked) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {t('contextMenu.delete')}
      </button>
    </div>
  );
}
