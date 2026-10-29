import { z } from 'zod'

/**
 * The allowed settings choices. The client has the same lists in
 * client/src/constants/appearance.js and client/src/constants/preferences.js —
 * keep them in step (the client tests check this).
 */
export const PALETTES = ['sora', 'sakura', 'matcha', 'lavender', 'peach', 'ocean', 'sky']
export const MODES = ['light', 'dark', 'system']
export const RADII = ['crisp', 'soft', 'round']
export const TEXT_SIZES = ['small', 'default', 'large']

export const TIMEZONES = [
  'system',
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Manila',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export const WEEK_STARTS = ['sunday', 'monday']
export const CURRENCY_SYMBOLS = ['', '$', '€', '£', '¥', '₱', '₹', '₩', '₺', 'R$', 'A$', 'C$', 'CHF', 'kr']
export const DATE_FORMATS = ['mdy', 'dmy', 'iso']
export const TIME_FORMATS = ['12h', '24h']
export const FOCUS_MODES = ['none', 'focus', 'study', 'rest']

export const DASHBOARD_WIDGETS = ['tasks', 'forecast', 'upcoming', 'habits', 'goals', 'notes', 'study', 'finance']
export const NOTIFICATION_TYPES = ['tasks', 'events', 'study', 'goals', 'habits', 'finance']
export const LEAD_TIME_FIELDS = ['tasks', 'events', 'assignments', 'exams', 'goals']
export const ASSISTANT_CATEGORIES = ['tasks', 'events', 'habits', 'goals', 'study', 'finance']

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour)')

const boolMap = (keys) =>
  z
    .object(Object.fromEntries(keys.map((key) => [key, z.boolean()])))
    .strict()
    .partial()

const dashboardSchema = z
  .object({
    widgets: z
      .array(
        z
          .object({
            id: z.enum(DASHBOARD_WIDGETS),
            visible: z.boolean(),
          })
          .strict()
      )
      .max(DASHBOARD_WIDGETS.length)
      .refine((widgets) => new Set(widgets.map((widget) => widget.id)).size === widgets.length, 'Each dashboard widget can only appear once'),
  })
  .strict()

const notificationsSchema = z
  .object({
    types: boolMap(NOTIFICATION_TYPES).optional(),
    quietHours: z
      .object({
        enabled: z.boolean(),
        start: clock,
        end: clock,
      })
      .strict()
      .partial()
      .optional(),
    leadDays: z
      .object(Object.fromEntries(LEAD_TIME_FIELDS.map((key) => [key, z.number().int().min(0).max(30)])))
      .strict()
      .partial()
      .optional(),
  })
  .strict()

const assistantSchema = boolMap(ASSISTANT_CATEGORIES)

// .strict(): unknown keys are rejected rather than silently stored, so this column can't be used as a junk drawer.
export const preferencesSchema = z
  .object({
    mode: z.enum(MODES).optional(),
    palette: z.enum(PALETTES).optional(),
    radius: z.enum(RADII).optional(),
    textSize: z.enum(TEXT_SIZES).optional(),
    timezone: z.enum(TIMEZONES).optional(),
    weekStartsOn: z.enum(WEEK_STARTS).optional(),
    currencySymbol: z.enum(CURRENCY_SYMBOLS).optional(),
    dateFormat: z.enum(DATE_FORMATS).optional(),
    timeFormat: z.enum(TIME_FORMATS).optional(),
    focusMode: z.enum(FOCUS_MODES).optional(),
    dashboard: dashboardSchema.optional(),
    notifications: notificationsSchema.optional(),
    assistant: assistantSchema.optional(),
  })
  .strict()
