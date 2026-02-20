/**
 * Daleel Al Suez - Unified Color System
 * 
 * This file defines the complete color palette for the application.
 * Colors are organized by purpose and include both light and dark mode variants.
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Main primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  // Secondary (Suez specific - inspired by canal and city)
  secondary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50', // Main secondary
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  // Status Colors
  status: {
    open: '#10b981',      // Green - مفتوح
    closed: '#ef4444',    // Red - مغلق
    live: '#f59e0b',      // Amber - مباشر الآن
    upcoming: '#3b82f6',  // Blue - قريباً
    verified: '#8b5cf6',  // Purple - موثق
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Rating Colors
  rating: {
    excellent: '#10b981', // 4.5-5
    good: '#84cc16',      // 3.5-4.4
    average: '#f59e0b',   // 2.5-3.4
    poor: '#f97316',      // 1.5-2.4
    bad: '#ef4444',       // 0-1.4
  },

  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Background & Surface
  background: {
    light: '#ffffff',
    lightSecondary: '#f9fafb',
    dark: '#0f172a',
    darkSecondary: '#1e293b',
  },

  // Text Colors
  text: {
    light: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af',
      disabled: '#d1d5db',
    },
    dark: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      disabled: '#4b5563',
    },
  },

  // Border Colors
  border: {
    light: '#e5e7eb',
    dark: '#374151',
  },

  // Category Specific Colors (للتصنيفات)
  category: {
    restaurants: '#ef4444',
    cafes: '#f59e0b',
    healthcare: '#10b981',
    shopping: '#8b5cf6',
    services: '#3b82f6',
    education: '#06b6d4',
    entertainment: '#ec4899',
    sports: '#14b8a6',
  },
} as const;

// CSS Variables Generator (for Tailwind or CSS-in-JS)
export const generateCSSVariables = () => {
  return {
    '--color-primary': colors.primary[500],
    '--color-secondary': colors.secondary[500],
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    '--color-open': colors.status.open,
    '--color-closed': colors.status.closed,
    '--color-live': colors.status.live,
  };
};

// Type exports
export type ColorKey = keyof typeof colors;
export type PrimaryShade = keyof typeof colors.primary;
