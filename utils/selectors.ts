import { createSelector, Selector } from 'reselect'
import memoize from 'fast-memoize'
import {
  constSelector,
  equipDataSelectorFactory,
  shipDataSelectorFactory,
  extensionSelectorFactory,
} from 'views/utils/selectors'
import { FleetShip, Identifier, SavedDataRecord, Slot, SlotList } from './calc'
import { HenseiState } from '../redux'

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'

const { resources } = window.i18n

const getI18n = (value: string): string => resources.fixedT
  ? resources.fixedT(value, { keySeparator: false })
  : resources.__(value)

export interface InitStatusSelection {
  init: boolean | undefined
}

export interface HenseiDataSelection {
  data?: HenseiState['henseiData']['data']
}

interface ApiSlotList extends Array<Identifier> {
  ex?: Identifier
}

export interface ShipInfo {
  name: string
  type: string
  saku?: number | null
  lv?: number | null
  slots: SlotList | ApiSlotList
}

export interface EquipInfo {
  name: string
  iconId: number
  lv?: number | null
  alv?: number | null
}

export const initStatusSelector: Selector<HenseiHostRootState, InitStatusSelection> = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  (state) => ({ init: (state.initStatus || { init: false }).init }),
)

export const henseiDataSelector: Selector<HenseiHostRootState, HenseiDataSelection> = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  (state) => state.henseiData || {},
)

export const fleetsByTitleSelector = (title: string): Selector<HenseiHostRootState, { fleets: unknown }> =>
  createSelector(henseiDataSelector, ({ data }) => ({ fleets: (data?.[title] || { fleets: {} }).fleets }))

export const dataByTitleSelector = (
  title: string,
): Selector<HenseiHostRootState, { data: SavedDataRecord | Record<string, never> }> =>
  createSelector(henseiDataSelector, ({ data }) => ({ data: data?.[title] || {} }))

export const constShipInfoSelector = memoize((id: Identifier): Selector<HenseiHostRootState, { name: string; type: string }> =>
  createSelector(constSelector, ({ $ships, $shipTypes }) => {
    const ship = $ships[id]
    const shipType = ship ? $shipTypes[ship.api_stype] : undefined
    return {
      name: getI18n(ship ? ship.api_name : ''),
      type: getI18n(shipType ? shipType.api_name : ''),
    }
  }))

export const constEquipInfoSelector = memoize((id: Identifier): Selector<HenseiHostRootState, { name: string; iconId: number }> =>
  createSelector(constSelector, ({ $equips }) => ({
    name: getI18n(($equips[id] || { api_name: '' }).api_name),
    iconId: $equips[id] ? $equips[id].api_type[3] : 0,
  })))

export const getShipInfoByData = memoize((id: Identifier, ship: FleetShip): Selector<HenseiHostRootState, ShipInfo> =>
  createSelector(
    constShipInfoSelector(id),
    ({ name, type }) => ({
      name,
      type,
      saku: ship.saku,
      lv: ship.lv,
      slots: ship.slots,
    })))

export const getShipInfoByApi = memoize((id: Identifier): Selector<HenseiHostRootState, ShipInfo> =>
  createSelector([
    shipDataSelectorFactory(id),
    constSelector,
  ], ([ship, constantShip], { $shipTypes }) => {
    const slots: ApiSlotList = []
    if (ship) {
      slots.push(...ship.api_slot)
      if (ship.api_slot_ex) {
        const extra = slots.pop()
        slots.ex = extra
      }
    }
    return {
      name: getI18n((constantShip || { api_name: '' }).api_name),
      lv: ship ? ship.api_lv : 0,
      saku: ship ? ship.api_sakuteki[0] : undefined,
      type: getI18n(ship && constantShip && $shipTypes[constantShip.api_stype]
        ? $shipTypes[constantShip.api_stype].api_name
        : ''),
      slots,
    }
  }))

export const shipInfoSelector = (id: Identifier, ship: FleetShip): Selector<HenseiHostRootState, ShipInfo> => getShipInfoByData(id, ship)

export const getEquipInfoByData = memoize((id: Identifier, slot: Slot): Selector<HenseiHostRootState, EquipInfo> =>
  createSelector(constEquipInfoSelector(id), ({ name, iconId }) => ({ name, iconId, lv: slot.lv, alv: slot.alv })))

export const getEquipInfoByApi = memoize((id: number): Selector<HenseiHostRootState, EquipInfo> =>
  createSelector(equipDataSelectorFactory(id), ([equip, constantEquip]) => ({
    name: (constantEquip || { api_name: '' }).api_name,
    iconId: constantEquip ? constantEquip.api_type[3] : 0,
    lv: equip ? equip.api_level : undefined,
    alv: equip ? equip.api_alv : undefined,
  })))

export const equipInfoSelector = (
  id: Identifier,
  slot: Slot | Identifier,
): Selector<HenseiHostRootState, EquipInfo> =>
  id ? getEquipInfoByData(id, typeof slot === 'object' ? slot : { id: slot }) : getEquipInfoByApi(typeof slot === 'number' ? slot : Number(slot))
