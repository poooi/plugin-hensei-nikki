const assert = require('node:assert/strict')
const test = require('node:test')
const {
  dataToThirdparty,
  getHenseiDataByApi,
  getHenseiDataByCode,
  transSavedData,
} = require('../.quality/utils/fleet-data.js')

const oldShip = ['100', [40, -1], [1, 2], [4, 0], [7, 5]]

test('loads current saved data, including truthy malformed fleets', () => {
  const current = {
    current: { version: 'poi-h-v1', fleets: { malformed: true }, note: 'kept' },
    empty: { version: 'poi-h-v1', fleets: [] },
  }
  assert.deepEqual(transSavedData(current), {
    current: current.current,
    empty: current.empty,
  })
})

test('converts the supported legacy array shape and joins tags natively', () => {
  const input = {
    legacy: {
      version: 1,
      ships: [[oldShip]],
      tags: ['one', null, { label: 'two' }, undefined],
    },
  }
  assert.deepEqual(transSavedData(input), {
    legacy: {
      version: 'poi-h-v1',
      note: 'one  [object Object] ',
      fleets: [[{
        id: '100',
        lv: 40,
        slots: [{ id: 1, lv: 4, alv: 7 }, { id: 2, alv: 5 }],
      }]],
    },
  })
})

test('accepts the single-fleet legacy shape as well as the nested shape', () => {
  assert.deepEqual(getHenseiDataByCode([oldShip]), [[{
    id: '100',
    lv: 40,
    slots: [{ id: 1, lv: 4, alv: 7 }, { id: 2, alv: 5 }],
  }]])
})

test('retains the historical bare-string error for empty legacy input', () => {
  assert.throws(() => getHenseiDataByCode([]), error => error === 'TypeError')
})

test('converts third-party v4 and preserves the historical ix-property loss', () => {
  const converted = getHenseiDataByCode({
    version: 4,
    f1: { s1: { id: '100', lv: 40, items: { i1: { id: 1, rf: 4 }, ix: { id: 200 } } } },
  })
  assert.deepEqual(converted, [[{
    id: '100',
    lv: 40,
    slots: [{ id: 1, lv: 4 }],
  }, undefined, undefined, undefined, undefined, undefined]])
  const slots = converted[0][0].slots
  assert.equal(slots.ex, undefined)
  assert.deepEqual(dataToThirdparty([[converted[0][0]]]), {
    version: 4,
    f1: { s1: { id: '100', lv: 40, luck: -1, items: { i1: { id: 1, rf: 4 } } } },
  })
  assert.equal(getHenseiDataByCode({ version: 3, f1: {} }).length, 0)
})

test('preserves zero-valued v4 levels and third-party rf output compatibility', () => {
  assert.deepEqual(getHenseiDataByCode({
    version: 4,
    f1: {
      s1: {
        id: '100',
        lv: 40,
        items: { i1: { id: 1, rf: 0, rp: 0 } },
      },
    },
  }), [[{
    id: '100',
    lv: 40,
    slots: [{ id: 1 }],
  }, undefined, undefined, undefined, undefined, undefined]])

  assert.deepEqual(dataToThirdparty([[
    { id: '100', lv: 40, slots: [{ id: 1, lv: 0, alv: 0 }] },
  ]]), {
    version: 4,
    f1: {
      s1: {
        id: '100',
        lv: 40,
        luck: -1,
        items: { i1: { id: 1, rf: 0 } },
      },
    },
  })
})

test('keeps API slot-ex optional for absent and null values', () => {
  const baseShip = {
    api_ship_id: 100,
    api_lv: 40,
    api_sakuteki: [10],
    api_soku: 10,
    api_slot: [1],
  }
  const ships = {
    1: { ...baseShip },
    2: { ...baseShip, api_slot_ex: null },
  }
  const equips = { 1: { api_slotitem_id: 500, api_level: 4 } }
  assert.deepEqual(getHenseiDataByApi([[{ id: 1 }, { id: 2 }, { id: -1 }]], ships, equips), [[
    { id: 100, lv: 40, saku: 10, slots: [{ id: 500, lv: 4 }], soku: 10 },
    { id: 100, lv: 40, saku: 10, slots: [{ id: 500, lv: 4 }], soku: 10 },
  ]])
})

test('skips malformed saved entries while preserving supported entries', () => {
  assert.deepEqual(transSavedData({
    malformed: null,
    unsupported: { version: 99, ships: [] },
    supported: { version: 1, ships: [[oldShip]], tags: [] },
  }), {
    supported: {
      version: 'poi-h-v1',
      note: '',
      fleets: [[{
        id: '100',
        lv: 40,
        slots: [{ id: 1, lv: 4, alv: 7 }, { id: 2, alv: 5 }],
      }]],
    },
  })
})
