import { strict as assert } from 'node:assert'
import { normalizeProgress, parsePointInput } from '../src/progress.ts'

assert.deepEqual(normalizeProgress(100, 1000), { points: 100, claimedPoints: 100 })
assert.deepEqual(normalizeProgress(-10, 20), { points: 0, claimedPoints: 0 })
assert.deepEqual(normalizeProgress(Infinity, '200'), { points: 0, claimedPoints: 0 })
assert.deepEqual(normalizeProgress(1000, 150), { points: 1000, claimedPoints: 150 })
assert.equal(parsePointInput('1.5k'), 1500)
assert.equal(parsePointInput('20m'), 20000000)
assert.equal(parsePointInput('1,000'), 1000)
assert.equal(parsePointInput(''), 0)
assert.equal(parsePointInput('abc100'), null)
assert.equal(parsePointInput('-50'), null)
assert.equal(parsePointInput('999999999999999999999m'), null)
