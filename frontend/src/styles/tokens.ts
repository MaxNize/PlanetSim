/** Central design tokens (colors) for the app's dark theme. Single source of truth to
 * replace the hex literals previously duplicated across components (FP-44). */
export const colors = {
  accent: '#3b82f6',
  accentDark: '#1d4ed8',
  accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  selection: '#38bdf8',
  tracked: '#10b981',
  warning: '#f59e0b',
  background: '#05070a',
  textOnDark: '#f1f2f6',
  textPrimary: '#f8fafc',
  textMuted: '#94a3b8',
  white: '#fff',
} as const;
