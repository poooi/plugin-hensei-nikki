const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load

global.window = {
  i18n: {
    resources: {
      fixedT: (value) => `translated:${value}`,
      __: (value) => value,
    },
  },
}

function createSelector(...argumentsList) {
  const result = argumentsList.at(-1)
  const inputs = Array.isArray(argumentsList[0]) ? argumentsList[0] : argumentsList.slice(0, -1)
  return (state) => result(...inputs.map((input) => input(state)))
}

Module._load = function load(request, parent, isMain) {
  if (request === 'reselect') return { createSelector }
  if (request === 'fast-memoize') return (callback) => callback
  if (request === 'views/utils/selectors') {
    return {
      constSelector: (state) => state.constants,
      extensionSelectorFactory: (key) => (state) => state[key],
      shipDataSelectorFactory: (id) => (state) => [state.apiShips[id], state.constants.$ships[id]],
      equipDataSelectorFactory: (id) => (state) => [state.apiEquips[id], state.constants.$equips[id]],
    }
  }
  return originalLoad.call(this, request, parent, isMain)
}

const {
  constEquipInfoSelector,
  constShipInfoSelector,
  dataByTitleSelector,
  fleetsByTitleSelector,
  getEquipInfoByApi,
  getShipInfoByApi,
  henseiDataSelector,
  initStatusSelector,
} = require('../utils/selectors.js')

const fleet = [{ id: 101, lv: 40, slots: [{ id: 201 }] }]
const fleets = [fleet]
const state = {
  'poi-plugin-hensei-nikki': {
    initStatus: { init: true },
    henseiData: { data: { main: { version: 'poi-h-v1', fleets } } },
  },
  constants: {
    $ships: { 101: { api_name: 'ship', api_stype: 2 } },
    $shipTypes: { 2: { api_name: 'destroyer' } },
    $equips: { 201: { api_name: 'gun', api_type: [0, 0, 0, 3] } },
  },
  apiShips: { 101: { api_lv: 40, api_sakuteki: [8], api_slot: [201, 0], api_slot_ex: 3 } },
  apiEquips: { 201: { api_level: 4, api_alv: 2 } },
}

test('state selectors return saved records and preserve host-derived info', () => {
  assert.deepEqual(initStatusSelector(state), { init: true })
  assert.deepEqual(henseiDataSelector(state).data.main.fleets, fleets)
  assert.deepEqual(fleetsByTitleSelector('main')(state), { fleets })
  assert.deepEqual(fleetsByTitleSelector('missing')(state), { fleets: {} })
  assert.deepEqual(dataByTitleSelector('missing')(state), { data: {} })
  assert.deepEqual(constShipInfoSelector(101)(state), { name: 'translated:ship', type: 'translated:destroyer' })
  assert.deepEqual(constEquipInfoSelector(201)(state), { name: 'translated:gun', iconId: 3 })
})

test('API selectors retain live host slot and equipment relationships', () => {
  assert.deepEqual(getShipInfoByApi(101)(state), {
    name: 'translated:ship',
    lv: 40,
    saku: 8,
    type: 'translated:destroyer',
    slots: Object.assign([201], { ex: 0 }),
  })
  assert.deepEqual(getEquipInfoByApi(201)(state), { name: 'gun', iconId: 3, lv: 4, alv: 2 })
})
