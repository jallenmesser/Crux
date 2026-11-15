// Dark grayscale base with one swappable neon accent.
// Exact brand colors are not decided; these are placeholders.

export const colors = {
  bg: '#0B0B0C',
  surface: '#16171A',
  surfaceRaised: '#1F2024',
  border: '#2B2D33',
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  accent: '#B6FF3B',
  onAccent: '#0B0B0C',
  danger: '#FF4D4D',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 22 } as const;
export const type = { title: 32, heading: 22, body: 16, caption: 13 } as const;
