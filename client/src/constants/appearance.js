/**
 * Appearance options. Pure data + helpers (no React / Vite imports) so tests can load it directly.
 * The ids must match: the CSS blocks in index.css (palettes, radius, text size) and the server's
 * validators/preferences.validator.js — tests/appearance.test.mjs checks both.
 */
export const PALETTES = [
  { id: 'sora', label: 'Sora', blurb: 'Calm teal' },
  { id: 'sakura', label: 'Sakura', blurb: 'Blush pink' },
  { id: 'matcha', label: 'Matcha', blurb: 'Soft sage' },
  { id: 'lavender', label: 'Lavender', blurb: 'Dreamy lilac' },
  { id: 'peach', label: 'Peach', blurb: 'Warm cream' },
  { id: 'ocean', label: 'Ocean', blurb: 'Pale sky' },
  { id: 'sky', label: 'Sky', blurb: 'Follows the day' },
]

export const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

export const RADII = [
  { id: 'crisp', label: 'Crisp', blurb: 'Sharper corners', px: [3, 6] },
  { id: 'soft', label: 'Soft', blurb: 'The default', px: [6, 10] },
  { id: 'round', label: 'Round', blurb: 'Pillowy corners', px: [10, 16] },
]

export const TEXT_SIZES = [
  { id: 'small', label: 'Small', blurb: 'More on screen', px: 14 },
  { id: 'default', label: 'Default', blurb: 'Comfortable', px: 16 },
  { id: 'large', label: 'Large', blurb: 'Easier to read', px: 19 },
]

export const DEFAULT_APPEARANCE = { mode: 'system', palette: 'sora', radius: 'soft', textSize: 'default' }

export const APPEARANCE_STORAGE_KEY = 'sora-appearance'
/** Before palettes existed, only the light/dark choice was stored, under this key. */
export const LEGACY_THEME_KEY = 'sora-theme'

const OPTIONS = { mode: MODES, palette: PALETTES, radius: RADII, textSize: TEXT_SIZES }
const isValid = (key, value) => OPTIONS[key].some((option) => option.id === value)

/** Keeps only the known keys that hold a valid value. Used for data from storage or the server. */
export function pickValidAppearance(raw) {
  const picked = {}
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(OPTIONS)) {
      if (isValid(key, raw[key])) picked[key] = raw[key]
    }
  }
  return picked
}

/** A complete appearance object: valid values from `raw`, defaults for everything else. */
export function resolveAppearance(raw) {
  return { ...DEFAULT_APPEARANCE, ...pickValidAppearance(raw) }
}
