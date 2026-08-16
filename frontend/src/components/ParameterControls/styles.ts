import { colors } from '../../styles/tokens';

export const CONTAINER_STYLE = {
  padding: '20px',
  fontFamily: 'inherit',
  maxHeight: '100%',
  overflowY: 'auto',
} as const;

export const HEADER_STYLE = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: colors.white,
  margin: '0 0 16px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  paddingBottom: '8px',
} as const;

export const CONTROLS_LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as const;

export const BUTTONS_ROW_STYLE = {
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
};

export const PLAY_BUTTON_STYLE = (isPaused: boolean) => ({
  flex: 1.5,
  padding: '10px 16px',
  borderRadius: '6px',
  border: isPaused ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
  background: isPaused ? colors.accentGradient : 'rgba(255, 255, 255, 0.1)',
  color: colors.white,
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  boxShadow: isPaused ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  outline: 'none',
});

export const RESET_BUTTON_STYLE = {
  flex: 1,
  padding: '10px 16px',
  borderRadius: '6px',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#f87171',
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  outline: 'none',
};

export const TABS_STYLE = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  padding: '2px',
  marginBottom: '16px',
} as const;

export const TAB_BUTTON_STYLE = (active: boolean) => ({
  flex: 1,
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  background: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  color: active ? colors.white : colors.textMuted,
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer',
  outline: 'none',
});
