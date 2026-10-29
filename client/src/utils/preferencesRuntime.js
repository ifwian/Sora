/**
 * The small set of preferences that pure utilities need while formatting dates,
 * times and money. PreferencesProvider keeps this in step with the signed-in
 * account; the defaults keep every utility correct before /me comes back and in
 * tests.
 */
const DEFAULTS = {
  timezone: 'system',
  dateFormat: 'mdy',
  timeFormat: '12h',
  currencySymbol: '',
}

let runtime = { ...DEFAULTS }

export function applyRuntimePreferences(preferences) {
  runtime = {
    timezone: preferences?.timezone ?? DEFAULTS.timezone,
    dateFormat: preferences?.dateFormat ?? DEFAULTS.dateFormat,
    timeFormat: preferences?.timeFormat ?? DEFAULTS.timeFormat,
    currencySymbol: preferences?.currencySymbol ?? DEFAULTS.currencySymbol,
  }
}

export function getRuntimePreferences() {
  return runtime
}

export function resetRuntimePreferences() {
  runtime = { ...DEFAULTS }
}
