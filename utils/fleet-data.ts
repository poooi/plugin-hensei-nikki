export type UnknownRecord = Record<string, unknown>
export type FleetIdentifier = string | number

export interface FleetSlot {
  id: FleetIdentifier
  lv?: number
  alv?: number
}

export interface FleetSlots extends Array<FleetSlot> {
  ex?: FleetSlot
}

export interface FleetShip {
  id: FleetIdentifier
  lv: number | null
  slots: FleetSlots
  saku?: number
  soku?: number
}

export type Fleet = FleetShip[]
export type ConvertedFleet = Array<FleetShip | undefined>
export type ConvertedFleets = Array<ConvertedFleet | undefined>

export interface SavedRecord {
  version: 'poi-h-v1'
  fleets: ConvertedFleets
  note?: string
}

// Existing current-version files were historically accepted when `fleets` was
// an object. Preserve those records and their identity while new records use
// SavedRecord above.
export interface PreservedSavedRecord {
  version: 'poi-h-v1'
  fleets: object
  note?: unknown
}

export type StoredRecord = SavedRecord | PreservedSavedRecord
export type StoredData = Record<string, StoredRecord>
export type SavedData = StoredRecord

interface ThirdPartyItem {
  id: FleetIdentifier
  rf?: number
  mas?: number
}

interface ThirdPartyShip {
  id: FleetIdentifier
  lv: number | null
  luck: -1
  items: Record<string, ThirdPartyItem>
}

type ThirdPartyFleet = Record<string, ThirdPartyShip>

export interface ThirdPartyData {
  version: 4
  [key: string]: 4 | ThirdPartyFleet
}

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new TypeError('Expected an array')
  return value
}

function requireObject(value: unknown): UnknownRecord {
  if (!isObject(value)) throw new TypeError('Expected an object')
  return value
}

function requireIdentifier(value: unknown): FleetIdentifier {
  if ((typeof value === 'string' && value.length > 0) || typeof value === 'number') {
    return value
  }
  throw new TypeError('Expected a fleet identifier')
}

function requireNumberOrNull(value: unknown): number | null {
  if (value === null || typeof value === 'number') return value
  throw new TypeError('Expected a number or null')
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
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
    const slot: FleetSlot = { id: requireIdentifier(id) }
    if (levels[index]) {
      const level = optionalNumber(levels[index])
      if (level !== undefined) slot.lv = level
    }
    if (aircraftLevels[index]) {
      const aircraftLevel = optionalNumber(aircraftLevels[index])
      if (aircraftLevel !== undefined) slot.alv = aircraftLevel
    }
    return slot
  })
}

function oldFleet(value: unknown[]): Fleet | undefined {
  if (!value.length) return undefined
  return value.map(item => {
    const ship = requireArray(item)
    const levelAndCondition = requireArray(ship[1])
    return {
      id: requireIdentifier(ship[0]),
      lv: requireNumberOrNull(levelAndCondition[0]),
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
  return fleets
}

function newSlots(value: UnknownRecord): FleetSlots {
  const candidates: Array<FleetSlot | undefined> & { ex?: FleetSlot } = []
  for (let index = 1; index <= 4; index += 1) {
    const item = getProperty(value, `i${index}`)
    if (item && isObject(item) && item.id) {
      const slot: FleetSlot = { id: requireIdentifier(item.id) }
      let proficiency = optionalNumber(item.rp)
      if (item.mas) proficiency = optionalNumber(item.mas)
      if (item.rf) {
        const level = optionalNumber(item.rf)
        if (level !== undefined) slot.lv = level
      }
      if (item.rp || item.mas) {
        if (proficiency !== undefined) slot.alv = proficiency
      }
      candidates.push(slot)
    } else {
      candidates.push(undefined)
    }
  }
  // The old implementation attached ix before Array.filter(), so the
  // returned array lost that non-index property. Keep that compatibility quirk.
  if (value.ix && isObject(value.ix) && value.ix.id) {
    candidates.ex = { id: requireIdentifier(value.ix.id) }
  }
  return candidates.filter((slot): slot is FleetSlot => Boolean(slot))
}

function newFleet(value: UnknownRecord): ConvertedFleet {
  const fleet: ConvertedFleet = []
  for (let index = 1; index <= 6; index += 1) {
    const shipValue = getProperty(value, `s${index}`)
    if (shipValue && isObject(shipValue) && Object.keys(shipValue).length) {
      fleet.push({
        id: requireIdentifier(shipValue.id),
        lv: requireNumberOrNull(shipValue.lv),
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

function isFleetIdentifier(value: unknown): value is FleetIdentifier {
  return (typeof value === 'string' && value.length > 0) || typeof value === 'number'
}

function isFleetSlot(value: unknown): value is FleetSlot {
  if (!isObject(value) || !isFleetIdentifier(value.id)) return false
  return (value.lv === undefined || typeof value.lv === 'number')
    && (value.alv === undefined || typeof value.alv === 'number')
}

function isFleetShip(value: unknown): value is FleetShip {
  return isObject(value)
    && isFleetIdentifier(value.id)
    && (value.lv === null || typeof value.lv === 'number')
    && Array.isArray(value.slots)
    && value.slots.every(isFleetSlot)
}

export function isConvertedFleets(value: unknown): value is ConvertedFleets {
  return Array.isArray(value)
    && value.every(fleet => fleet === undefined
      || (Array.isArray(fleet) && fleet.every(ship => ship === undefined || isFleetShip(ship))))
}

function codeConversion(value: unknown): ConvertedFleets | undefined {
  if (value instanceof Array) return oldVersion(value)
  if (isObject(value)) {
    // The > 0 index check in the original code selected v4, but not v3.
    if (value.version === 4) return newVersion(value)
    if (value.version === 'poi-h-v1' && isConvertedFleets(value.fleets)) {
      return value.fleets
    }
  }
  return undefined
}

function isPreservedSavedRecord(value: UnknownRecord): value is UnknownRecord & PreservedSavedRecord {
  return value.version === 'poi-h-v1'
    && typeof value.fleets === 'object'
    && value.fleets !== null
}

export function transSavedData(input: unknown): StoredData {
  const newData: StoredData = {}
  if (!isObject(input)) return newData

  for (const title in input) {
    try {
      const oldData = requireObject(input[title])
      if (isPreservedSavedRecord(oldData)) {
        newData[title] = oldData
        continue
      }

      const fleets = codeConversion(oldData.ships)
      if (!fleets) continue
      const tags = oldData.tags
      const tempData: SavedRecord = {
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

export function getHenseiDataByCode(code: unknown): ConvertedFleet[] {
  const converted = codeConversion(code)
  return converted ? converted.filter((fleet): fleet is ConvertedFleet => Boolean(fleet)) : []
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
          id: requireIdentifier(apiSlot.api_slotitem_id),
          lv: optionalNumber(apiSlot.api_level),
        }
        if (apiSlot.api_alv) slot.alv = optionalNumber(apiSlot.api_alv)
        return slot
      })
      const ex = apiShip.api_slot_ex
      if (isPositiveNumber(ex)) slots.ex = { id: ex }

      const saku = isUnknownArray(apiShip.api_sakuteki)
        ? optionalNumber(apiShip.api_sakuteki[0])
        : undefined
      return {
        id: requireIdentifier(apiShip.api_ship_id),
        lv: requireNumberOrNull(apiShip.api_lv),
        saku,
        slots,
        soku: optionalNumber(apiShip.api_soku),
      }
    }).filter((ship): ship is FleetShip => Boolean(ship))
  })
}

export function dataToThirdparty(input: unknown): ThirdPartyData {
  const oldData = requireArray(input)
  const result: ThirdPartyData = { version: 4 }
  oldData.forEach((fleetInput, fleetIndex) => {
    const fleet: ThirdPartyFleet = {}
    if (fleetInput) {
      requireArray(fleetInput).forEach((shipInput, shipIndex) => {
        const ship = requireObject(shipInput)
        const items: Record<string, ThirdPartyItem> = {}
        requireArray(ship.slots).forEach((slotInput, slotIndex) => {
          const slot = requireObject(slotInput)
          const item: ThirdPartyItem = {
            id: requireIdentifier(slot.id),
            rf: optionalNumber(slot.lv),
          }
          if (slot.alv) item.mas = optionalNumber(slot.alv)
          items[`i${slotIndex + 1}`] = item
        })
        fleet[`s${shipIndex + 1}`] = {
          id: requireIdentifier(ship.id),
          lv: requireNumberOrNull(ship.lv),
          luck: -1,
          items,
        }
      })
    }
    result[`f${fleetIndex + 1}`] = fleet
  })
  return result
}
