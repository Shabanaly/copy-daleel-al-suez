/**
 * Daleel Al Suez - Design System Entry Point
 * 
 * Central export for the entire design system
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Re-export commonly used items for convenience
import { colors } from './colors';
import { typography, typographyPresets } from './typography';
import { spacing, breakpoints, shadows, zIndex } from './spacing';

export const theme = {
    colors,
    typography,
    typographyPresets,
    spacing,
    breakpoints,
    shadows,
    zIndex,
} as const;

export default theme;
