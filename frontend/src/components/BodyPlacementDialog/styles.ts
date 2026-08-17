import { colors } from '../../styles/tokens';

export const OVERLAY_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
} as const;

export const DIALOG_STYLE = {
  background: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  padding: '24px',
  width: '340px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  fontFamily: "'Outfit', sans-serif",
  color: colors.white,
} as const;

export const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
} as const;

export const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: colors.textMuted,
} as const;

export const INPUT_STYLE = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '6px',
  color: colors.white,
  padding: '8px 12px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  outline: 'none',
} as const;

export const BUTTON_STYLE = {
  padding: '10px 16px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
} as const;
