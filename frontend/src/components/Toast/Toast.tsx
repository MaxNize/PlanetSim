import { useEffect } from 'react';
import { colors } from '../../styles/tokens';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Auto-dismissing notification banner for transient, non-blocking errors (e.g. sandbox body
 * creation failures) that would otherwise fail silently (FP-38).
 */
export function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  return (
    <div
      role="alert"
      data-testid="toast"
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        background: 'rgba(239, 68, 68, 0.95)',
        color: colors.white,
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        maxWidth: '80vw',
        textAlign: 'center',
      }}
    >
      ⚠️ {message}
    </div>
  );
}
