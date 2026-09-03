import test from 'node:test'
import { strict as assert } from 'node:assert'
import { dataToThirdparty, getHenseiDataByCode, transSavedData } from '../utils/calc'

test('keeps current poi saved data in its current format', () => {
  const saved = {
    Alpha: {
      version: 'poi-h-v1',
      note: 'memo',
      fleets: [[{ id: 1, lv: 99, saku: 10, slots: [{ id: 2, lv: 4, alv: 5 }] }]],
    },
  }

  assert.deepEqual(transSavedData(saved), saved)
})

test('converts the supported legacy array import', () => {
  const legacy = {
    Alpha: {
      ships: [[[
        1,
        [80, -1],
        [2, 3],
        [4, 0],
        [5, 2],
      ]]],
      tags: ['first', 'fleet'],
    },
  }

  assert.deepEqual(transSavedData(legacy), {
    Alpha: {
      version: 'poi-h-v1',
      note: 'first fleet',
      fleets: [[{
        id: 1,
        lv: 80,
        slots: [{ id: 2, lv: 4, alv: 5 }, { id: 3, alv: 2 }],
      }]],
    },
  })
})

test('converts both third-party object versions', () => {
  const source = {
    version: 3,
    f1: {
      s1: { id: 10, lv: 40, items: { i1: { id: 20, rf: 4, rp: 6 } } },
    },
  }

  const expected = [[{ id: 10, lv: 40, slots: [{ id: 20, lv: 4, alv: 6 }] }]]
  assert.deepEqual(getHenseiDataByCode(source), expected)
  assert.deepEqual(transSavedData({ Alpha: { version: 3, ships: source, tags: [] } }).Alpha.fleets, expected)

  assert.deepEqual(getHenseiDataByCode({
    version: 4,
    f1: {
      s1: { id: 10, lv: 40, items: { i1: { id: 20, rf: 4, mas: 7 } } },
    },
  }), [[{ id: 10, lv: 40, slots: [{ id: 20, lv: 4, alv: 7 }] }]])
})

test('exports current fleets in the third-party format', () => {
  const fleets = [[{ id: 10, lv: 40, slots: [{ id: 20, lv: 4, alv: 7 }] }]]

  assert.deepEqual(dataToThirdparty(fleets), {
    version: 4,
    f1: {
      s1: { id: 10, lv: 40, luck: -1, items: { i1: { id: 20, rf: 4, mas: 7 } } },
    },
  })
})
