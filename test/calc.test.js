const assert = require('node:assert/strict')
const test = require('node:test')
const {
  dataToThirdparty,
  getDetails,
  getHenseiDataByApi,
  getHenseiDataByCode,
  transSavedData,
} = require('../utils/calc.js')

const emptyShip = { id: 0, lv: 0, saku: 0, soku: 0, slots: [] }

test('saved conversion preserves empty, zero, unsupported, legacy, and v4 records', () => {
  const legacy = [[101, [0, -1], [200], [0], [0]]]
  const input = {
    empty: { version: 'poi-h-v1', fleets: [] },
    zero: { version: 'poi-h-v1', fleets: [[emptyShip]] },
    legacy: { version: 1, ships: legacy, tags: ['old', 'fleet'] },
    v3: { version: 3, ships: { version: 3 }, tags: [] },
    v4: { version: 4, ships: { version: 4, f1: { s1: { id: 101, lv: 40, items: { i1: { id: 200, rf: 0, mas: 0 } } } } }, tags: [] },
  }
  const result = transSavedData(input)
  assert.deepEqual(result.empty, input.empty)
  assert.deepEqual(result.zero, input.zero)
  assert.equal(result.legacy.note, 'old fleet')
  assert.equal(result.v3, undefined)
  assert.equal(result.v4.version, 'poi-h-v1')
  assert.deepEqual(result.v4.fleets[0][0], { id: 101, lv: 40, slots: [{ id: 200 }] })
})

test('legacy saved conversion preserves empty fleet positions', () => {
  const ship = [101, [99, -1], [200], [4], [7]]
  const result = transSavedData({ partial: { version: 1, ships: [[ship], [], [ship]] } })
  assert.deepEqual(result.partial.fleets, [
    [{ id: 101, lv: 99, slots: [{ id: 200, lv: 4, alv: 7 }] }],
    undefined,
    [{ id: 101, lv: 99, slots: [{ id: 200, lv: 4, alv: 7 }] }],
  ])
})

test('saved v1 conversion preserves partial fleet records', () => {
  const record = {
    version: 'poi-h-v1',
    fleets: [null, { not: 'a fleet' }, [{ id: 101 }]],
  }
  const result = transSavedData({ partial: record })
  assert.strictEqual(result.partial, record)
})

test('legacy and third-party code conversion keeps fleet shape', () => {
  const legacy = [[[101, [99, -1], [200], [4], [7]]]]
  assert.deepEqual(getHenseiDataByCode(legacy), [[{ id: 101, lv: 99, slots: [{ id: 200, lv: 4, alv: 7 }] }]])
  assert.deepEqual(getHenseiDataByCode({ version: 4, f1: {} }), [undefined, undefined, undefined, undefined].filter(Boolean))
})

test('API conversion preserves zero slots and extra slots', () => {
  const fleets = [[{ id: 1 }, { id: -1 }]]
  const ships = { 1: { api_ship_id: 101, api_lv: 40, api_sakuteki: [12], api_soku: 10, api_slot: [2, 0], api_slot_ex: 3 } }
  const equips = { 2: { api_slotitem_id: 202, api_level: 0, api_alv: 0 } }
  assert.deepEqual(getHenseiDataByApi(fleets, ships, equips), [[{ id: 101, lv: 40, saku: 12, slots: Object.assign([{ id: 202, lv: 0 }], { ex: { id: 3 } }), soku: 10 }]])
})

test('calculations preserve zero and reconnaissance formula results', () => {
  const equips = {
    10: { api_baku: 0, api_houk: 0, api_houm: 0, api_saku: 4, api_type: [0, 0, 10, 9], api_tyku: 0 },
    11: { api_baku: 0, api_houk: 0, api_houm: 0, api_saku: 2, api_type: [0, 0, 12, 11], api_tyku: 0 },
  }
  const ships = { 101: { api_maxeq: [4], api_lv: 1, api_sakuteki: [0], api_ship_id: 101, api_soku: 10, api_slot: [], api_slot_ex: 0 } }
  const fleet = [{ id: 101, lv: 1, saku: 6, soku: 10, slots: [{ id: 10, lv: 0 }, { id: 11, lv: 0 }] }]
  const details = getDetails(fleet, equips, ships, 0)
  assert.deepEqual(details.tyku, { basic: 0, min: 0, max: 0 })
  assert.deepEqual(details.saku25, { recon: 8, radar: 2, ship: 0, total: 10 })
  assert.equal(details.saku33.total, 16)
  assert.equal(details.saku33x3.total, 28)
  assert.equal(details.saku33x4.total, 34)
  assert.equal(details.soku, 'Fast')
})

test('third-party export preserves empty fleets and zero improvements', () => {
  assert.deepEqual(dataToThirdparty([[{ id: 101, lv: 0, slots: [{ id: 200, lv: 0, alv: 0 }] }], []]), { version: 4, f1: { s1: { id: 101, lv: 0, luck: -1, items: { i1: { id: 200, rf: 0 } } } }, f2: {} })
})
