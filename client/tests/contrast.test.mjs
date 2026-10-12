// Guards the design tokens: every text/background pairing must meet WCAG AA
// in BOTH themes, and interactive-control borders must hit 3:1 (WCAG 1.4.11).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const grab = (block) => Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
const light = grab(css.slice(css.indexOf('@theme'), css.indexOf('.dark {')))
const dark = { ...light, ...grab(css.slice(css.indexOf('.dark {'), css.indexOf(':root {'))) }

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const mix = (fg, bg, alpha) =>
  '#' + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha)).toString(16).padStart(2, '0')).join('')

const TEXT = 4.5
const UI = 3
const pairs = [
  ['body text', 'foreground', 'background', TEXT],
  ['body text on card', 'foreground', 'surface', TEXT],
  ['muted text on page', 'muted', 'background', TEXT],
  ['muted text on card', 'muted', 'surface', TEXT],
  ['muted text on hover bg', 'muted', 'surface-hover', TEXT],
  ['accent text on page', 'accent', 'background', TEXT],
  ['accent text on card', 'accent', 'surface', TEXT],
  ['primary button label', 'accent-foreground', 'accent', TEXT],
  ['primary button label (hover)', 'accent-foreground', 'accent-hover', TEXT],
  ['success badge', 'success', 'success-bg', TEXT],
  ['warning badge', 'warning', 'warning-bg', TEXT],
  ['danger badge', 'danger', 'danger-bg', TEXT],
  ['danger text on page', 'danger', 'background', TEXT],
  ['danger text on card', 'danger', 'surface', TEXT],
  ['danger button label', 'danger-foreground', 'danger', TEXT],
  ['danger button label (hover)', 'danger-foreground', 'danger-hover', TEXT],
  ['control border vs card', 'control', 'surface', UI],
  ['control border vs page', 'control', 'background', UI],
  ['control border vs hover bg', 'control', 'surface-hover', UI],
]

for (const [themeName, theme] of [['light', light], ['dark', dark]]) {
  for (const [label, fg, bg, min] of pairs) {
    test(`${themeName}: ${label} ≥ ${min}:1`, () => {
      assert.ok(theme[fg] && theme[bg], `missing token for ${fg} or ${bg}`)
      const r = ratio(theme[fg], theme[bg])
      assert.ok(r >= min, `${fg} ${theme[fg]} on ${bg} ${theme[bg]} is ${r.toFixed(2)}:1, needs ${min}:1`)
    })
  }
  test(`${themeName}: accent badge text on its 10% tint ≥ ${TEXT}:1`, () => {
    const r = ratio(theme.accent, mix(theme.accent, theme.surface, 0.1))
    assert.ok(r >= TEXT, `${r.toFixed(2)}:1`)
  })
}
