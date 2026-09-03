import { createSelector } from 'reselect'
import memoize from 'fast-memoize'
import {
  constSelector,
  equipDataSelectorFactory,
  shipDataSelectorFactory,
  extensionSelectorFactory,
} from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'

const { resources } = window.i18n

const getI18n = (s: string) => resources.fixedT ? resources.fixedT(s, { keySeparator: false }) : resources.__(s)

export const initStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  (state: any) => ({ init: (state.initStatus || {init: false}).init })
)

export const henseiDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  (state: any) => state.henseiData || {}
)

export const fleetsByTitleSelector = (title: string) =>
  createSelector(henseiDataSelector, ({ data }: any) => ({ fleets: (data[title] || { fleets: {} }).fleets }))

export const dataByTitleSelector = (title: string) =>
  createSelector(henseiDataSelector, ({ data }: any) => ({ data: (data || {})[title] || {} }))

export const constShipInfoSelector = memoize((id: number) =>
  createSelector(constSelector, ({ $ships, $shipTypes }: any) => ({
    name: getI18n(($ships[id] || { api_name: '' }).api_name),
    type: getI18n($shipTypes[$ships[id].api_stype].api_name),
  }))
)
export const constEquipInfoSelector = memoize((id: number) =>
  createSelector(constSelector, ({ $equips }: any) => ({
    name: getI18n(($equips[id] || { api_name: '' }).api_name),
    iconId: $equips[id] ? $equips[id].api_type[3] : 0,
  }))
)
// { name, lv, type, saku, slots }
export const getShipInfoByData = memoize((id: number, { lv, saku, slots }: any) => {
  return createSelector(
    constShipInfoSelector(id),
    ({ name, type }: any) => ({
      name,
      type,
      saku,
      lv,
      slots,
    }))
})
export const getShipInfoByApi = memoize((id: number) =>
  createSelector([
    shipDataSelectorFactory(id),
    constSelector,
  ], ([ship, $ship]: any[], { $shipTypes }: any) => {
    const slots: any[] & { ex?: any } = []
    if (ship) {
      slots.push(...ship.api_slot)
      if (ship.api_slot_ex) {
        const ex = slots.pop()
        slots.ex = ex
      }
    }
    return {
      name: getI18n(($ship || { api_name: '' }).api_name),
      lv: ship ? ship.api_lv : 0,
      saku: ship.api_sakuteki[0],
      type: getI18n($shipTypes[$ship ? $ship.api_stype : 0].api_name),
      slots,
    }
  })
)

export const shipInfoSelector = (id: number, ship: any) => getShipInfoByData(id, ship)
  // ship.saku ? getShipInfoByData(id, ship) : getShipInfoByApi(id)


export const getEquipInfoByData = memoize((id: number, { lv, alv }: any) =>
  createSelector(constEquipInfoSelector(id), ({ name, iconId }: any) => ({ name, iconId, lv, alv }))
)
export const getEquipInfoByApi = memoize((id: number) =>
  createSelector(equipDataSelectorFactory(id), ([equip, $equip]: any[]) => ({
    name: ($equip || { api_name: '' }).api_name,
    iconId: $equip ? $equip.api_type[3] : 0,
    lv: equip.api_level,
    alv: equip.api_alv,
  }))
)
export const equipInfoSelector = (id: number, slot: any) =>
  id ? getEquipInfoByData(id, slot) : getEquipInfoByApi(Number(slot))
