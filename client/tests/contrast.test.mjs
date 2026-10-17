// Guards the design tokens. For the default theme AND every palette, in BOTH light and dark:
// every text/background pairing must meet WCAG AA, and interactive-control borders must hit 3:1 (WCAG 1.4.11).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

// selector -> { token: '#hex' } for every block that sets colour tokens
const blocks = new Map()
for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const tokens = Object.fromEntries([...body.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
  // a block's selector is only the text after the previous ';' (so @import / @custom-variant lines don't leak in)
  if (Object.keys(tokens).length > 0) blocks.set(selector.split(';').pop().trim().replace(/"/g, "'"), tokens)
}

const baseLight = blocks.get('@theme')
const baseDark = blocks.get('.dark')
assert.ok(baseLight && baseDark, 'index.css must define @theme and .dark colour blocks')

const paletteIds = [...blocks.keys()].map((s) => s.match(/^\[data-palette='([\w-]+)'\]$/)?.[1]).filter(Boolean)

// The browser cascades: base light -> .dark -> palette light -> .dark[palette]. (Higher specificity wins last.)
const themes = [
  { name: 'sora (default)', mode: 'light', tokens: baseLight },
  { name: 'sora (default)', mode: 'dark', tokens: { ...baseLight, ...baseDark } },
]
for (const id of paletteIds) {
  const pLight = blocks.get(`[data-palette='${id}']`)
  const pDark = blocks.get(`.dark[data-palette='${id}']`)
  test(`palette ${id}: has a dark variant that overrides every colour its light variant sets`, () => {
    assert.ok(pDark, `missing .dark[data-palette='${id}'] block`)
    const missing = Object.keys(pLight).filter((key) => !(key in pDark))
    assert.deepEqual(missing, [], `${id} dark mode would inherit light-mode values for: ${missing.join(', ')}`)
  })
  themes.push({ name: id, mode: 'light', tokens: { ...baseLight, ...pLight } })
  themes.push({ name: id, mode: 'dark', tokens: { ...baseLight, ...baseDark, ...pLight, ...(pDark ?? {}) } })
}

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

for (const { name, mode, tokens } of themes) {
  for (const [label, fg, bg, min] of pairs) {
    test(`${name} / ${mode}: ${label} ≥ ${min}:1`, () => {
      assert.ok(tokens[fg] && tokens[bg], `missing token for ${fg} or ${bg}`)
      const r = ratio(tokens[fg], tokens[bg])
      assert.ok(r >= min, `${fg} ${tokens[fg]} on ${bg} ${tokens[bg]} is ${r.toFixed(2)}:1, needs ${min}:1`)
    })
  }
  test(`${name} / ${mode}: accent badge text on its 10% tint ≥ ${TEXT}:1`, () => {
    const r = ratio(tokens.accent, mix(tokens.accent, tokens.surface, 0.1))
    assert.ok(r >= TEXT, `${r.toFixed(2)}:1`)
  })
}

test('the test itself found the palettes it is supposed to guard', () => {
  assert.ok(paletteIds.length >= 5, `expected several palettes, found: ${paletteIds.join(', ') || 'none'}`)
})
