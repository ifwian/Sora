import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import {
  DEFAULT_APPEARANCE,
  MODES,
  PALETTES,
  RADII,
  TEXT_SIZES,
  pickValidAppearance,
  resolveAppearance,
} from '../src/constants/appearance.js'

const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8')
const ids = (list) => list.map((item) => item.id)

test('every palette in the picker has CSS (the default needs none), and every CSS palette is in the picker', () => {
  const css = read('../src/index.css')
  const inCss = [...css.matchAll(/^\[data-palette='([\w-]+)'\]/gm)].map((m) => m[1])
  assert.deepEqual(inCss.sort(), ids(PALETTES).filter((id) => id !== 'sora').sort())
})

test('every shape option has CSS (soft is the default) and every text size too (default needs none)', () => {
  const css = read('../src/index.css')
  const radii = [...css.matchAll(/^\[data-radius='([\w-]+)'\]/gm)].map((m) => m[1])
  const sizes = [...css.matchAll(/^html\[data-text='([\w-]+)'\]/gm)].map((m) => m[1])
  assert.deepEqual(radii.sort(), ids(RADII).filter((id) => id !== 'soft').sort())
  assert.deepEqual(sizes.sort(), ids(TEXT_SIZES).filter((id) => id !== 'default').sort())
})

test("the client's option lists match the server's validator exactly", () => {
  const server = read('../../server/src/validators/preferences.validator.js')
  const listFrom = (name) => [...server.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`))[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1])
  assert.deepEqual(listFrom('PALETTES'), ids(PALETTES))
  assert.deepEqual(listFrom('MODES'), ids(MODES))
  assert.deepEqual(listFrom('RADII'), ids(RADII))
  assert.deepEqual(listFrom('TEXT_SIZES'), ids(TEXT_SIZES))
})

test('the defaults are themselves valid choices', () => {
  assert.deepEqual(pickValidAppearance(DEFAULT_APPEARANCE), DEFAULT_APPEARANCE)
})

test('pickValidAppearance keeps only known keys holding valid values', () => {
  assert.deepEqual(pickValidAppearance({ palette: 'sakura', radius: 'huge', textSize: 'large', evil: 1, mode: 7 }), { palette: 'sakura', textSize: 'large' })
  for (const junk of [null, undefined, 'dark', 42, [], {}]) assert.deepEqual(pickValidAppearance(junk), {})
})

test('resolveAppearance fills the gaps with defaults', () => {
  assert.deepEqual(resolveAppearance({ palette: 'ocean' }), { ...DEFAULT_APPEARANCE, palette: 'ocean' })
  assert.deepEqual(resolveAppearance(null), DEFAULT_APPEARANCE)
})

test('theme-init.js (runs before first paint) reads the same storage keys as the app', () => {
  const init = read('../public/theme-init.js')
  const constants = read('../src/constants/appearance.js')
  for (const key of ["'sora-appearance'", "'sora-theme'"]) {
    assert.ok(init.includes(key), `theme-init.js should use ${key}`)
    assert.ok(constants.includes(key), `appearance.js should use ${key}`)
  }
})
