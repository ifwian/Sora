import { z } from 'zod'

/**
 * The allowed appearance choices. The client has the same lists in
 * client/src/constants/appearance.js — keep them in step (the client tests check this).
 */
export const PALETTES = ['sora', 'sakura', 'matcha', 'lavender', 'peach', 'ocean']
export const MODES = ['light', 'dark', 'system']
export const RADII = ['crisp', 'soft', 'round']
export const TEXT_SIZES = ['small', 'default', 'large']

// .strict(): unknown keys are rejected rather than silently stored, so this column can't be used as a junk drawer.
export const preferencesSchema = z
  .object({
    mode: z.enum(MODES).optional(),
    palette: z.enum(PALETTES).optional(),
    radius: z.enum(RADII).optional(),
    textSize: z.enum(TEXT_SIZES).optional(),
  })
  .strict()
