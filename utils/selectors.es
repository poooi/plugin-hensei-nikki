import { createSelector } from 'reselect'
import memoize from 'fast-memoize'
import {
  constSelector,
  equipDataSelectorFactory,
  shipDataSelectorFactory,
  extensionSelectorFactory,
} from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'
const getI18n = window.i18n.resources.__

export const initStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ init: (state.initStatus || {init: false}).init })
)

export const henseiDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => state.henseiData || {}
)

export const fleetsByTitleSelector = memoize(title => {
  createSelector(henseiDataSelector, ({ data }) => ({ fleets: data[title].fleets }))
})

export const constShipInfoSelector = memoize(id =>
  createSelector(constSelector, ({ $ships, $shipTypes }) => ({
    name: getI18n(($ships[id] || { api_name: '' }).api_name),
    type: getI18n($shipTypes[$ships[id].api_stype]),
  }))
)
export const constEquipInfoSelector = memoize(id =>
  createSelector(constSelector, ({ $equips }) => ({
    name: getI18n(($equips[id] || { api_name: '' }).api_name),
    iconId: $equips[id] ? $equips[id].api_type[3] : 0,
  }))
)
// { name, lv, type, slots }
export const getShipInfoByData = memoize((id, { lv, slots }) =>
  createSelector(constShipInfoSelector(id), ({ name, type }) => ({ name, type, lv, slots }))
)
export const getShipInfoByApi = memoize(id =>
  createSelector([
    shipDataSelectorFactory(id),
    constSelector,
  ], ([ship, $ship], { $shipTypes }) => ({
    name: getI18n(($ship || { api_name: '' }).api_name),
    lv: ship ? ship.api_lv : 0,
    type: getI18n($shipTypes[$ship ? $ship.api_stype : 0].api_name),
    slots: ship ? ship.api_slot : [],
  }))
)
export const shipInfoSelector = (id, ship) =>
  ship.lv ? getShipInfoByData(id, ship) : getShipInfoByApi(id)


export const getEquipInfoByData = memoize((id, { lv, alv }) =>
  createSelector(constEquipInfoSelector(id), ({ name, iconId }) => ({ name, iconId, lv, alv }))
)
export const getEquipInfoByApi = memoize(id =>
  createSelector(equipDataSelectorFactory(id), ([equip, $equip]) => ({
    name: ($equip || { api_name: '' }).api_name,
    iconId: $equip ? $equip.api_type[3] : 0,
    lv: equip.api_level,
    alv: equip.api_alv,
  }))
)
export const equipInfoSelector = (id, slot) =>
  id ? getEquipInfoByData(id, slot) : getEquipInfoByApi(Number(slot))
