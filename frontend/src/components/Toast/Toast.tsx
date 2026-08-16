import { useEffect, useRef } from 'react';
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
  // onDismiss is often a fresh inline callback on every parent render (e.g. every simulation step);
  // depending on it directly would reset this timer before it ever fires. A ref keeps the effect
  // keyed only on what should actually restart the countdown, while still calling the latest callback.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

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
