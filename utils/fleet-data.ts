export type UnknownRecord = Record<string, unknown>

export interface FleetSlot {
  id: unknown
  lv?: unknown
  alv?: unknown
}

export interface FleetSlots extends Array<FleetSlot> {
  ex?: unknown
}

export interface FleetShip {
  id: unknown
  lv: unknown
  slots: FleetSlots
  saku?: unknown
  soku?: unknown
}

export type Fleet = FleetShip[]
export type ConvertedFleet = Array<FleetShip | undefined>
export type ConvertedFleets = Array<ConvertedFleet | undefined>

export interface SavedData extends UnknownRecord {}

export interface ThirdPartyData extends UnknownRecord {
  version: 4
}

function isObject(value: unknown): value is UnknownRecord {
  return value instanceof Object && !Array.isArray(value)
}

function requireArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new TypeError('Expected an array')
  return value
}

function requireObject(value: unknown): UnknownRecord {
  if (!isObject(value)) throw new TypeError('Expected an object')
  return value
}

function getProperty(value: UnknownRecord, key: unknown): unknown {
  return value[String(key)]
}

function arrayDepth(depth: number, value: unknown): number {
  return Math.max(depth, value instanceof Array
    ? value.reduce((current, item) => arrayDepth(current, item), 0) + 1
    : 0)
}

function oldSlots(
  ids: unknown[],
  levels: unknown[],
  aircraftLevels: unknown[],
): FleetSlots {
  if (!ids.length) return []
  return ids.map((id, index) => {
    const slot: FleetSlot = { id }
    if (levels[index]) slot.lv = levels[index]
    if (aircraftLevels[index]) slot.alv = aircraftLevels[index]
    return slot
  })
}

function oldFleet(value: unknown[]): Fleet | undefined {
  if (!value.length) return undefined
  return value.map(item => {
    const ship = requireArray(item)
    const levelAndCondition = requireArray(ship[1])
    return {
      id: ship[0],
      lv: levelAndCondition[0],
      slots: oldSlots(
        requireArray(ship[2]),
        requireArray(ship[3]),
        requireArray(ship[4]),
      ),
    }
  })
}

function oldVersion(value: unknown[]): ConvertedFleets {
  const depth = arrayDepth(0, value)
  const fleets: ConvertedFleets = []
  if (depth === 3) {
    fleets.push(oldFleet(value))
  } else if (depth === 4) {
    value.forEach(fleet => fleets.push(oldFleet(requireArray(fleet))))
  } else {
    // This is intentionally a string, matching the historical implementation.
    throw 'TypeError'
  }
  return fleets.map(fleet => fleet)
}

function newSlots(value: UnknownRecord): FleetSlots {
  const candidates: Array<FleetSlot | undefined> & { ex?: unknown } = []
  for (let index = 1; index <= 4; index += 1) {
    const item = getProperty(value, `i${index}`)
    if (item && isObject(item) && item.id) {
      const slot: FleetSlot = { id: item.id }
      if (item.rf) slot.lv = item.rf
      if (item.rp) slot.alv = item.rp
      if (item.mas) slot.alv = item.mas
      candidates.push(slot)
    } else {
      candidates.push(undefined)
    }
  }
  // The old implementation attached ix before Array.filter(), so the
  // returned array lost that non-index property. Keep that compatibility quirk.
  if (value.ix) candidates.ex = value.ix
  return candidates.filter((slot): slot is FleetSlot => Boolean(slot))
}

function newFleet(value: UnknownRecord): ConvertedFleet {
  const fleet: ConvertedFleet = []
  for (let index = 1; index <= 6; index += 1) {
    const shipValue = getProperty(value, `s${index}`)
    if (shipValue && isObject(shipValue) && Object.keys(shipValue).length) {
      fleet.push({
        id: shipValue.id,
        lv: shipValue.lv,
        slots: newSlots(requireObject(shipValue.items)),
      })
    } else {
      fleet.push(undefined)
    }
  }
  return fleet
}

function newVersion(value: UnknownRecord): ConvertedFleets {
  const fleets: ConvertedFleets = []
  for (let index = 1; index <= 4; index += 1) {
    const fleetValue = getProperty(value, `f${index}`)
    if (fleetValue && isObject(fleetValue) && Object.keys(fleetValue).length) {
      fleets.push(newFleet(fleetValue))
    } else {
      fleets.push(undefined)
    }
  }
  return fleets
}

function codeConversion(value: unknown): unknown {
  if (value instanceof Array) return oldVersion(value)
  if (isObject(value)) {
    // The > 0 index check in the original code selected v4, but not v3.
    if (value.version === 4) return newVersion(value)
    if (value.version === 'poi-h-v1') return value.fleets
  }
  return undefined
}

export function transSavedData(input: unknown): Record<string, SavedData> {
  const newData: Record<string, SavedData> = {}
  if (!isObject(input)) return newData

  for (const title in input) {
    try {
      const oldData = requireObject(input[title])
      const version = oldData.version
      if (version === 'poi-h-v1') {
        if (oldData.fleets) newData[title] = oldData
        continue
      }

      const fleets = codeConversion(oldData.ships)
      const tags = oldData.tags
      const tempData: SavedData = {
        fleets,
        note: Array.isArray(tags) ? tags.join(' ') : '',
        version: 'poi-h-v1',
      }
      if (fleets) newData[title] = tempData
    } catch (error) {
      // A malformed saved entry has historically been skipped.
      continue
    }
  }
  return newData
}

export function getHenseiDataByCode(code: unknown): unknown[] {
  const converted = codeConversion(code)
  return Array.isArray(converted) ? converted.filter(Boolean) : []
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function getHenseiDataByApi(
  fleetsInput: unknown,
  shipsInput: unknown,
  equipsInput: unknown,
): Fleet[] {
  const fleets = requireArray(fleetsInput)
  const ships = requireObject(shipsInput)
  const equips = requireObject(equipsInput)
  return fleets.filter(Boolean).map(fleetInput => {
    const fleet = requireArray(fleetInput)
    return fleet.filter(Boolean).map((shipInput): FleetShip | undefined => {
      const ship = requireObject(shipInput)
      if (ship.id === -1) return undefined

      const apiShip = requireObject(getProperty(ships, ship.id))
      const apiSlots = requireArray(apiShip.api_slot)
      const slots: FleetSlots = apiSlots.filter(isPositiveNumber).map(slotId => {
        const apiSlot = requireObject(getProperty(equips, slotId))
        const slot: FleetSlot = {
          id: apiSlot.api_slotitem_id,
          lv: apiSlot.api_level,
        }
        if (apiSlot.api_alv) slot.alv = apiSlot.api_alv
        return slot
      })
      const ex = apiShip.api_slot_ex
      if (isPositiveNumber(ex)) slots.ex = { id: ex }

      const saku = isUnknownArray(apiShip.api_sakuteki)
        ? apiShip.api_sakuteki[0]
        : undefined
      return {
        id: apiShip.api_ship_id,
        lv: apiShip.api_lv,
        saku,
        slots,
        soku: apiShip.api_soku,
      }
    }).filter((ship): ship is FleetShip => Boolean(ship))
  })
}

export function dataToThirdparty(input: unknown): ThirdPartyData {
  const oldData = requireArray(input)
  const result: ThirdPartyData = { version: 4 }
  oldData.forEach((fleetInput, fleetIndex) => {
    const fleet: UnknownRecord = {}
    if (fleetInput) {
      requireArray(fleetInput).forEach((shipInput, shipIndex) => {
        const ship = requireObject(shipInput)
        const items: UnknownRecord = {}
        requireArray(ship.slots).forEach((slotInput, slotIndex) => {
          const slot = requireObject(slotInput)
          const item: UnknownRecord = { id: slot.id, rf: slot.lv }
          if (slot.alv) item.mas = slot.alv
          items[`i${slotIndex + 1}`] = item
        })
        fleet[`s${shipIndex + 1}`] = {
          id: ship.id,
          lv: ship.lv,
          luck: -1,
          items,
        }
      })
    }
    result[`f${fleetIndex + 1}`] = fleet
  })
  return result
}
