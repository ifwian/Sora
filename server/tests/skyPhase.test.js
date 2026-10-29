import assert from 'node:assert/strict'
import { test } from 'node:test'
import { skyPhaseAt, skyPhaseForHour } from '../src/utils/skyPhase.js'

test('skyPhaseForHour uses the same calm boundaries as the client', () => {
  const expected = {
    0: 'night', 4: 'night', 5: 'dawn', 8: 'dawn', 9: 'day', 12: 'day',
    16: 'day', 17: 'dusk', 19: 'dusk', 20: 'night', 23: 'night',
  }
  for (const [hour, phase] of Object.entries(expected)) {
    assert.equal(skyPhaseForHour(Number(hour)), phase, `hour ${hour}`)
  }
})

test('skyPhaseAt resolves the hour in a chosen time zone', () => {
  const instant = new Date('2026-09-05T23:30:00Z')
  assert.equal(skyPhaseAt(instant, 'UTC'), 'night')
  assert.equal(skyPhaseAt(instant, 'Asia/Manila'), 'dawn')
  assert.equal(skyPhaseAt(instant, 'America/Los_Angeles'), 'day')
})

test('skyPhaseAt has no opinion when the zone is unknown or device-local', () => {
  const instant = new Date('2026-09-05T12:00:00Z')
  assert.equal(skyPhaseAt(instant, 'system'), null)
  assert.equal(skyPhaseAt(instant, 'Mars/Olympus'), null)
  assert.equal(skyPhaseAt(instant), null)
})
