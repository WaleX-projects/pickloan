/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17212B',
    tint: '#0D5C63',

    // Core surfaces
    background: '#F7F8F6',
    foreground: '#17212B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#17212B',

    // Primary action color (buttons, links, active states)
    primary: '#0D5C63',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7EFED',
    secondaryForeground: '#145056',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF1EF',
    mutedForeground: '#69767A',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F7E9C7',
    accentForeground: '#765317',

    // Destructive actions (delete, error states)
    destructive: '#B94A48',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DCE4E1',
    input: '#DCE4E1',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 14,
};

export default colors;
