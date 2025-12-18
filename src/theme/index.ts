import { StyleSheet, Platform } from 'react-native';

// OpenPad Design System
// A modern, clean design with subtle depth and warmth

export const colors = {
  dark: {
    // Core backgrounds - deep with subtle warmth
    bg: '#0f0f12',
    bgElevated: '#18181d',
    bgCard: '#1e1e24',
    bgHover: '#252530',
    
    // Text hierarchy
    text: '#f5f5f7',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    textInverse: '#0f0f12',
    
    // Accent - warm teal/cyan
    accent: '#22d3ee',
    accentMuted: '#0891b2',
    accentSubtle: 'rgba(34, 211, 238, 0.12)',
    
    // Semantic
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    
    // Borders and dividers
    border: '#27272a',
    borderLight: '#3f3f46',
    divider: 'rgba(255, 255, 255, 0.06)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(30, 30, 36, 0.8)',
    
    // Message blocks
    userMessage: '#0891b2',
    assistantMessage: '#1e1e24',
  },
  light: {
    // Core backgrounds - clean white with subtle gray
    bg: '#fafafa',
    bgElevated: '#ffffff',
    bgCard: '#ffffff',
    bgHover: '#f4f4f5',
    
    // Text hierarchy
    text: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    textInverse: '#ffffff',
    
    // Accent - warm teal/cyan
    accent: '#0891b2',
    accentMuted: '#06b6d4',
    accentSubtle: 'rgba(8, 145, 178, 0.08)',
    
    // Semantic
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Borders and dividers
    border: '#e4e4e7',
    borderLight: '#f4f4f5',
    divider: 'rgba(0, 0, 0, 0.04)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.3)',
    glass: 'rgba(255, 255, 255, 0.8)',
    
    // Message blocks
    userMessage: '#0891b2',
    assistantMessage: '#f4f4f5',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Typography using system fonts
export const typography = {
  // Display
  hero: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Small
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  smallMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  // Tiny
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  // Mono (for code)
  mono: {
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    lineHeight: 20,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const createTheme = (isDark: boolean) => {
  const c = isDark ? colors.dark : colors.light;
  
  return StyleSheet.create({
    // Containers
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    containerElevated: {
      flex: 1,
      backgroundColor: c.bgElevated,
    },
    
    // Cards
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    
    // Typography
    hero: { ...typography.hero, color: c.text },
    title: { ...typography.title, color: c.text },
    subtitle: { ...typography.subtitle, color: c.text },
    body: { ...typography.body, color: c.text },
    bodyMedium: { ...typography.bodyMedium, color: c.text },
    bodySemibold: { ...typography.bodySemibold, color: c.text },
    small: { ...typography.small, color: c.text },
    smallMedium: { ...typography.smallMedium, color: c.text },
    caption: { ...typography.caption, color: c.textMuted },
    captionMedium: { ...typography.captionMedium, color: c.textMuted },
    
    // Secondary text variants
    textSecondary: { color: c.textSecondary },
    textMuted: { color: c.textMuted },
    textAccent: { color: c.accent },
    
    // List items
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.bgCard,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
    },
    listItemContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    
    // Buttons
    buttonPrimary: {
      backgroundColor: c.accent,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimaryText: {
      ...typography.bodyMedium,
      color: c.textInverse,
    },
    buttonSecondary: {
      backgroundColor: c.accentSubtle,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondaryText: {
      ...typography.bodyMedium,
      color: c.accent,
    },
    buttonGhost: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    buttonGhostText: {
      ...typography.bodyMedium,
      color: c.accent,
    },
    
    // Input
    input: {
      ...typography.body,
      color: c.text,
      backgroundColor: c.bgHover,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    
    // Header/Nav
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: c.bgElevated,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      minHeight: 64,
    },
    
    // Divider
    divider: {
      height: 1,
      backgroundColor: c.divider,
    },
    
    // Message blocks
    messageBlockUser: {
      backgroundColor: c.userMessage,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
    },
    messageBlockAssistant: {
      backgroundColor: c.assistantMessage,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      borderWidth: isDark ? 0 : 1,
      borderColor: c.border,
    },
    
    // Tab bar
    tabBar: {
      flexDirection: 'row',
      backgroundColor: c.bgElevated,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingBottom: spacing.lg,
      paddingTop: spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    tabLabel: {
      ...typography.caption,
      marginTop: spacing.xs,
    },
    
    // Status indicators
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusConnected: {
      backgroundColor: c.success,
    },
    statusPending: {
      backgroundColor: c.warning,
    },
    statusError: {
      backgroundColor: c.error,
    },
  });
};

export type Theme = ReturnType<typeof createTheme>;
export type Colors = typeof colors.dark;
