import {
  constSelector,
  equipDataSelectorFactory,
  extensionSelectorFactory,
  shipDataSelectorFactory,
} from 'views/utils/selectors'
import { isConvertedFleets } from './fleet-data'
import type {
  HostApiShip,
  HostConstState,
  HostEquip,
  HostShip,
  HostStoreState,
} from '../types/host'
import type {
  ConvertedFleets,
  FleetIdentifier,
  FleetShip,
  FleetSlot,
  StoredData,
  StoredRecord,
} from './fleet-data'

export type Selector<State, Result> = (state: State) => Result

interface ReselectCreateSelector {
  <State, Input, Result>(
    input: Selector<State, Input>,
    projector: (input: Input) => Result,
  ): Selector<State, Result>
  <State, First, Second, Result>(
    inputs: [Selector<State, First>, Selector<State, Second>],
    projector: (first: First, second: Second) => Result,
  ): Selector<State, Result>
}

interface ReselectModule {
  createSelector: ReselectCreateSelector
}

declare function require(moduleName: string): unknown

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isReselectModule(value: unknown): value is ReselectModule {
  return isRecord(value) && typeof value.createSelector === 'function'
}

function getCreateSelector(): ReselectCreateSelector {
  const loaded = require('reselect')
  if (!isReselectModule(loaded)) {
    throw new TypeError('Expected a createSelector function')
  }
  return loaded.createSelector
}

const createSelector = getCreateSelector()

const REDUCER_EXTENSION_KEY = 'poi-plugin-hensei-nikki'

interface PluginState {
  initStatus?: { init: boolean }
  henseiData?: HenseiDataState
}

export interface HenseiDataState {
  data: StoredData
}

export interface InitStatus {
  init: boolean
}

export interface DataByTitleResult {
  data: StoredRecord | Record<string, never>
}

export interface FleetsByTitleResult {
  fleets: ConvertedFleets | undefined
}

export interface ShipInfo {
  name: string
  type: string
  lv: number | null
  saku?: number
  slots: FleetSlot[] | number[]
}

interface ApiSlots extends Array<number> {
  ex?: number
}

export interface EquipInfo {
  name: string
  iconId: number
  lv?: number
  alv?: number
}

function memoize<Arguments extends readonly unknown[], Result>(
  callback: (...args: Arguments) => Result,
): (...args: Arguments) => Result {
  let previousArguments: Arguments | undefined
  let previousResult: { value: Result } | undefined
  return (...args: Arguments): Result => {
    if (previousResult
      && previousArguments
      && previousArguments.length === args.length
      && previousArguments.every((value, index) => Object.is(value, args[index]))) {
      return previousResult.value
    }
    previousArguments = args
    previousResult = { value: callback(...args) }
    return previousResult.value
  }
}

const getI18n = (value: string): string => {
  const { resources } = window.i18n
  return resources.fixedT
    ? resources.fixedT(value, { keySeparator: false })
    : resources.__(value)
}

export const initStatusSelector: Selector<HostStoreState, InitStatus> = createSelector(
  extensionSelectorFactory<PluginState>(REDUCER_EXTENSION_KEY),
  state => ({ init: state.initStatus?.init || false }),
)

export const henseiDataSelector: Selector<HostStoreState, HenseiDataState> = createSelector(
  extensionSelectorFactory<PluginState>(REDUCER_EXTENSION_KEY),
  state => state.henseiData || { data: {} },
)

export const fleetsByTitleSelector = (title: string): Selector<HostStoreState, FleetsByTitleResult> =>
  createSelector(henseiDataSelector, ({ data }) => ({
    fleets: data[title] && isConvertedFleets(data[title].fleets)
      ? data[title].fleets
      : undefined,
  }))

export const dataByTitleSelector = (title: string): Selector<HostStoreState, DataByTitleResult> =>
  createSelector(henseiDataSelector, ({ data }) => ({ data: data[title] || {} }))

export const constShipInfoSelector = memoize((id: FleetIdentifier): Selector<HostStoreState, {
  name: string
  type: string
}> =>
  createSelector(constSelector, ({ $ships, $shipTypes }: HostConstState) => {
    const ship = $ships[Number(id)]
    const shipType = ship ? $shipTypes[ship.api_stype] : undefined
    return {
      name: getI18n(ship?.api_name || ''),
      type: getI18n(shipType?.api_name || ''),
    }
  }))

export const constEquipInfoSelector = memoize((id: FleetIdentifier): Selector<HostStoreState, {
  name: string
  iconId: number
}> =>
  createSelector(constSelector, ({ $equips }: HostConstState) => {
    const equip = $equips[Number(id)]
    return {
      name: getI18n(equip?.api_name || ''),
      iconId: equip?.api_type[3] || 0,
    }
  }))

export const getShipInfoByData = memoize((
  id: FleetIdentifier,
  { lv, saku, slots }: FleetShip,
): Selector<HostStoreState, ShipInfo> =>
  createSelector(
    constShipInfoSelector(id),
    ({ name, type }) => ({ name, type, saku, lv, slots }),
  ))

export const getShipInfoByApi = memoize((id: number): Selector<HostStoreState, ShipInfo> =>
  createSelector(
    [shipDataSelectorFactory(id), constSelector],
    ([ship, shipConstant]: [HostApiShip | undefined, HostShip | undefined], { $shipTypes }) => {
      const slots: ApiSlots = []
      if (ship) {
        slots.push(...ship.api_slot)
        if (ship.api_slot_ex) {
          const ex = slots.pop()
          slots.ex = ex
        }
      }
      const shipType = shipConstant ? $shipTypes[shipConstant.api_stype] : undefined
      return {
        name: getI18n(shipConstant?.api_name || ''),
        lv: ship?.api_lv || 0,
        saku: ship?.api_sakuteki[0],
        type: getI18n(shipType?.api_name || ''),
        slots,
      }
    },
  ))

export const shipInfoSelector = (
  id: FleetIdentifier,
  ship: FleetShip,
): Selector<HostStoreState, ShipInfo> => getShipInfoByData(id, ship)

export const getEquipInfoByData = memoize((
  id: FleetIdentifier,
  { lv, alv }: FleetSlot,
): Selector<HostStoreState, EquipInfo> =>
  createSelector(constEquipInfoSelector(id), ({ name, iconId }) => ({ name, iconId, lv, alv })))

export const getEquipInfoByApi = memoize((id: number): Selector<HostStoreState, EquipInfo> =>
  createSelector(
    equipDataSelectorFactory(id),
    ([equip, equipConstant]: [HostEquip | undefined, HostEquip | undefined]) => ({
      name: equipConstant?.api_name || '',
      iconId: equipConstant?.api_type[3] || 0,
      lv: equip?.api_level,
      alv: equip?.api_alv,
    }),
  ))

export const equipInfoSelector = (
  id: FleetIdentifier | 0,
  slot: FleetSlot | number,
): Selector<HostStoreState, EquipInfo> =>
  id && typeof slot === 'object'
    ? getEquipInfoByData(id, slot)
    : getEquipInfoByApi(Number(slot))
