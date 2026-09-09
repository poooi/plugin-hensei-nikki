export type Identifier = number | string

export interface Slot {
  id: Identifier
  lv?: number | null
  alv?: number | null
}

export interface ExtraSlot { id: Identifier }
export interface SlotList extends Array<Slot> { ex?: ExtraSlot }
export interface FleetShip {
  id: Identifier
  lv?: number | null
  saku?: number | null
  soku?: number | null
  slots: SlotList
}
export type Fleet = Array<FleetShip | undefined>
export interface SavedFleetData {
  version: 'poi-h-v1'
  fleets: Array<Fleet | undefined>
  note?: string
  tags?: string[]
}

interface EquipData {
  api_baku: number
  api_houk: number
  api_houm: number
  api_level?: number
  api_saku: number
  api_slotitem_id?: Identifier
  api_type: number[]
  api_tyku: number
}
interface ShipData {
  api_lv: number
  api_maxeq: number[]
  api_sakuteki: number[]
  api_ship_id: Identifier
  api_soku: number
  api_slot: number[]
  api_slot_ex: number
}
type EquipIndex = Record<string, EquipData>
type ShipIndex = Record<string, ShipData>
type UnknownRecord = Record<string, unknown>
interface PassthroughSavedFleetData extends UnknownRecord {
  version: 'poi-h-v1'
  fleets: unknown
}
type TransformedSavedFleetData = SavedFleetData | PassthroughSavedFleetData

const aircraftExpTable = [0, 10, 25, 40, 55, 70, 85, 100, 121]
const aircraftLevelBonus: Record<string, number[]> = {
  '6': [0, 0, 2, 5, 9, 14, 14, 22, 22], '7': [0, 0, 0, 0, 0, 0, 0, 0, 0],
  '8': [0, 0, 0, 0, 0, 0, 0, 0, 0], '11': [0, 1, 1, 1, 1, 3, 3, 6, 6],
  '45': [0, 0, 2, 5, 9, 14, 14, 22, 22], '47': [0, 0, 0, 0, 0, 0, 0, 0, 0],
  '48': [0, 0, 2, 5, 9, 14, 14, 22, 22], '56': [0, 0, 0, 0, 0, 0, 0, 0, 0],
  '57': [0, 0, 0, 0, 0, 0, 0, 0, 0], '58': [0, 0, 0, 0, 0, 0, 0, 0, 0],
}
const speedInterpretation: Record<number, string> = { 5: 'Slow', 10: 'Fast', 15: 'Fast+', 20: 'Fastest' }

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function requireRecord(value: unknown, label: string): UnknownRecord {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object`)
  return value
}
function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`)
  return value
}
function requireIdentifier(value: unknown, label: string): Identifier {
  if (typeof value !== 'number' && typeof value !== 'string') throw new TypeError(`${label} must be an identifier`)
  return value
}
function requireNumber(value: unknown, label: string): number {
  if (typeof value !== 'number') throw new TypeError(`${label} must be a number`)
  return value
}
function isIdentifier(value: unknown): value is Identifier {
  return typeof value === 'number' || typeof value === 'string'
}
function isSlot(value: unknown): value is Slot {
  return isRecord(value) && isIdentifier(value.id)
}
function isFleet(value: unknown): value is Fleet {
  return Array.isArray(value)
    && value.every((ship) => ship === undefined || (isRecord(ship) && isIdentifier(ship.id) && isSlotList(ship.slots)))
}
function isSlotList(value: unknown): value is SlotList {
  return Array.isArray(value) && value.every(isSlot)
}
function isFleetCollection(value: unknown): value is Array<Fleet | undefined> {
  return Array.isArray(value) && value.every((fleet) => fleet === undefined || isFleet(fleet))
}
function range(length: number): number[] { return Array.from({ length }, (_, i) => i + 1) }
function compact<T>(values: Array<T | undefined> | undefined): T[] {
  return values ? values.filter((value): value is T => Boolean(value)) : []
}
function arrDepth(depth: number, value: unknown): number {
  return Math.max(depth, Array.isArray(value) ? value.reduce(arrDepth, 0) + 1 : 0)
}

function oldSlots(ids: unknown[], levels: unknown[], aircraftLevels: unknown[]): SlotList {
  if (!ids.length) return []
  return ids.map((id, index) => {
    const slot: Slot = { id: requireIdentifier(id, 'legacy slot id') }
    if (levels[index]) slot.lv = requireNumber(levels[index], 'legacy slot level')
    if (aircraftLevels[index]) slot.alv = requireNumber(aircraftLevels[index], 'legacy aircraft level')
    return slot
  })
}
function oldFleet(value: unknown[]): Fleet | undefined {
  if (!value.length) return undefined
  return value.map((rawShip) => {
    const ship = requireArray(rawShip, 'legacy ship')
    const level = requireArray(ship[1], 'legacy ship level')
    return {
      id: requireIdentifier(ship[0], 'legacy ship id'),
      lv: typeof level[0] === 'number' ? level[0] : null,
      slots: oldSlots(requireArray(ship[2], 'legacy slot ids'), requireArray(ship[3], 'legacy slot levels'), requireArray(ship[4], 'legacy aircraft levels')),
    }
  })
}
function oldVer(data: unknown[]): Array<Fleet | undefined> {
  const depth = arrDepth(0, data)
  const fleets: Array<Fleet | undefined> = []
  if (depth === 3) {
    fleets.push(oldFleet(data))
  } else if (depth === 4) {
    data.forEach((fleet) => { fleets.push(oldFleet(requireArray(fleet, 'legacy fleet'))) })
  } else throw new TypeError('unsupported legacy data depth')
  return fleets
}
function newSlots(value: unknown): SlotList {
  const data = requireRecord(value, 'third-party items')
  const slots = range(4).map((index) => {
    const raw = data[`i${index}`]
    if (isRecord(raw) && raw.id) {
      const slot: Slot = { id: requireIdentifier(raw.id, 'third-party slot id') }
      if (raw.rf) slot.lv = requireNumber(raw.rf, 'third-party improvement')
      if (raw.rp) slot.alv = requireNumber(raw.rp, 'third-party proficiency')
      if (raw.mas) slot.alv = requireNumber(raw.mas, 'third-party proficiency')
      return slot
    }
    return undefined
  })
  const slotList: SlotList = slots.filter((slot): slot is Slot => Boolean(slot))
  if (isRecord(data.ix)) slotList.ex = { id: requireIdentifier(data.ix.id, 'third-party extra slot id') }
  return slotList
}
function newFleet(value: unknown): Fleet {
  const data = requireRecord(value, 'third-party fleet')
  return range(6).map((index) => {
    const raw = data[`s${index}`]
    if (isRecord(raw) && Object.keys(raw).length) {
      return { id: requireIdentifier(raw.id, 'third-party ship id'), lv: typeof raw.lv === 'number' ? raw.lv : null, slots: newSlots(raw.items) }
    }
    return undefined
  })
}
function newVer(value: UnknownRecord): Array<Fleet | undefined> {
  return range(4).map((index) => {
    const fleet = value[`f${index}`]
    return isRecord(fleet) && Object.keys(fleet).length ? newFleet(fleet) : undefined
  })
}
function codeConversion(value: unknown): Array<Fleet | undefined> | undefined {
  if (Array.isArray(value)) return oldVer(value)
  if (isRecord(value)) {
    // Preserve the historical index check: version 3 is unsupported, version 4 is supported.
    if (value.version === 4) return newVer(value)
    if (value.version === 'poi-h-v1' && isFleetCollection(value.fleets)) return value.fleets
  }
  return undefined
}

function getTyku(data: FleetShip[], equips: EquipIndex, ships: ShipIndex, landbaseStatus = 0) {
  let minTyku = 0; let maxTyku = 0; let basicTyku = 0; let reconBonus = 1
  for (const ship of data) {
    if (!ship.id) continue
    const maxeq = ships[ship.id].api_maxeq
    ship.slots.forEach((slot, index) => {
      const equip = equips[slot.id]; const level = slot.alv || 0; let temp = 0
      const factor = equip.api_baku > 0 ? 0.25 : 0.2; const type = equip.api_type[2]
      if ([6, 7, 8, 45, 47, 56, 57, 58].includes(type)) {
        temp += Math.sqrt(maxeq[index]) * (equip.api_tyku + (slot.lv || 0) * factor) + aircraftLevelBonus[type][level]
        basicTyku += Math.floor(Math.sqrt(maxeq[index]) * equip.api_tyku)
        minTyku += Math.floor(temp + Math.sqrt(aircraftExpTable[level] / 10)); maxTyku += Math.floor(temp + Math.sqrt((aircraftExpTable[level + 1] - 1) / 10))
      } else if (type === 11) {
        temp += Math.sqrt(maxeq[index]) * equip.api_tyku + aircraftLevelBonus[type][level]
        basicTyku += Math.floor(Math.sqrt(maxeq[index]) * equip.api_tyku)
        minTyku += Math.floor(temp + Math.sqrt(aircraftExpTable[level] / 10)); maxTyku += Math.floor(temp + Math.sqrt((aircraftExpTable[level + 1] - 1) / 10))
      } else if (type === 48) {
        let bonus = 0; if (landbaseStatus === 1) bonus = 1.5 * equip.api_houk; if (landbaseStatus === 2) bonus = equip.api_houk + 2 * equip.api_houm
        temp += Math.sqrt(maxeq[index]) * (equip.api_tyku + bonus + (slot.lv || 0) * factor) + aircraftLevelBonus[type][level]
        basicTyku += Math.floor(Math.sqrt(maxeq[index]) * equip.api_tyku)
        minTyku += Math.floor(temp + Math.sqrt(aircraftExpTable[level] / 10)); maxTyku += Math.floor(temp + Math.sqrt((aircraftExpTable[level + 1] - 1) / 10))
      } else if ([10, 41].includes(type)) {
        if (landbaseStatus === 2) { if (equip.api_saku >= 9) reconBonus = Math.max(reconBonus, 1.16); else if (equip.api_saku === 8) reconBonus = Math.max(reconBonus, 1.13); else reconBonus = Math.max(reconBonus, 1.1) }
        else if (landbaseStatus === 1) { temp += Math.sqrt(maxeq[index]) * equip.api_tyku; minTyku += Math.floor(temp + Math.sqrt(aircraftExpTable[level] / 10)); maxTyku += Math.floor(temp + Math.sqrt((aircraftExpTable[level + 1] - 1) / 10)) }
      } else if (type === 9 && landbaseStatus === 2) {
        if (equip.api_saku >= 9) reconBonus = Math.max(reconBonus, 1.3); else reconBonus = Math.max(reconBonus, 1.2)
      }
    })
  }
  void reconBonus
  return { basic: basicTyku, min: minTyku, max: maxTyku }
}
function getSaku25(data: FleetShip[], equips: EquipIndex) {
  let recon = 0; let shipSaku = 0; let radar = 0
  for (const ship of data) {
    if (!ship.id) continue; shipSaku += ship.saku || 0
    ship.slots.forEach((slot) => { const equip = equips[slot.id]; switch (equip.api_type[3]) {
      case 9: recon += equip.api_saku; shipSaku -= equip.api_saku; break
      case 10: if (equip.api_type[2] === 10) { recon += equip.api_saku; shipSaku -= equip.api_saku }; break
      case 11: radar += equip.api_saku; shipSaku -= equip.api_saku; break
      default: break
    } })
  }
  recon *= 2; shipSaku = Math.sqrt(shipSaku) || 0
  return { recon: Number(recon.toFixed(2)), radar: Number(radar.toFixed(2)), ship: Number(shipSaku.toFixed(2)), total: Number((recon + radar + shipSaku).toFixed(2)) }
}
function getSaku25a(data: FleetShip[], equips: EquipIndex, teitokuLv: number) {
  let shipSaku = 0; let item = 0
  for (const ship of data) {
    if (!ship.id) continue; let pure = ship.saku || 0
    ship.slots.forEach((slot) => { const equip = equips[slot.id]; pure -= equip.api_saku; switch (equip.api_type[3]) {
      case 7: item += equip.api_saku * 1.04; break; case 8: item += equip.api_saku * 1.37; break; case 9: item += equip.api_saku * 1.66; break
      case 10: if (equip.api_type[2] === 10) item += equip.api_saku * 2; else if (equip.api_type[2] === 11) item += equip.api_saku * 1.78; break
      case 11: if (equip.api_type[2] === 12) item += equip.api_saku; else if (equip.api_type[2] === 13) item += equip.api_saku * 0.99; break
      case 24: item += equip.api_saku * 0.91; break; default: break
    } }); shipSaku += Math.sqrt(pure) * 1.69
  }
  const teitoku = 0.61 * Math.floor((teitokuLv + 4) / 5) * 5
  return { ship: Number(shipSaku.toFixed(2)), item: Number(item.toFixed(2)), teitoku: Number(teitoku.toFixed(2)), total: Number((shipSaku + item - teitoku).toFixed(2)) }
}
function getSaku33(data: FleetShip[], equips: EquipIndex, teitokuLv: number, modifier = 1) {
  let shipSaku = 0; let item = 0; let shipCount = 6
  for (const ship of data) {
    shipCount -= 1; let pure = ship.saku || 0
    ship.slots.forEach((slot) => { const equip = equips[slot.id]; pure -= equip.api_saku; switch (equip.api_type[2]) {
      case 8: item += equip.api_saku * 0.8; break; case 9: item += equip.api_saku; break
      case 10: item += (equip.api_saku + 1.2 * Math.sqrt(slot.lv || 0)) * 1.2; break; case 11: item += equip.api_saku * 1.1; break
      case 12: case 13: item += (equip.api_saku + 1.25 * Math.sqrt(slot.lv || 0)) * 0.6; break
      default: item += equip.api_saku * 0.6; break
    } }); shipSaku += Math.sqrt(pure)
  }
  item *= modifier; const teitoku = Math.ceil(teitokuLv * 0.4)
  return { ship: Number(shipSaku.toFixed(2)), item: Number(item.toFixed(2)), teitoku: Number(teitoku.toFixed(2)), total: Number((shipSaku + item - teitoku + 2 * shipCount).toFixed(2)) }
}
function getSoku(fleet: FleetShip[]): string | undefined {
  return speedInterpretation[Math.min(...fleet.map((ship) => ship.soku).filter((value): value is number => Boolean(value)))]
}

export function getDetails(fleet: FleetShip[], equips: EquipIndex, ships: ShipIndex, teitokuLv: number) {
  return { tyku: getTyku(fleet, equips, ships), saku25: getSaku25(fleet, equips), saku25a: getSaku25a(fleet, equips, teitokuLv), saku33: getSaku33(fleet, equips, teitokuLv), saku33x3: getSaku33(fleet, equips, teitokuLv, 3), saku33x4: getSaku33(fleet, equips, teitokuLv, 4), soku: getSoku(fleet) }
}

function isPassthroughSavedData(value: UnknownRecord): value is PassthroughSavedFleetData {
  return value.version === 'poi-h-v1' && Boolean(value.fleets)
}
export function transSavedData(oldData: unknown): Record<string, TransformedSavedFleetData> {
  const result: Record<string, TransformedSavedFleetData> = {}
  if (!isRecord(oldData)) return result
  for (const title in oldData) {
    try {
      const record = requireRecord(oldData[title], `saved record ${title}`); const { version, ships, tags } = record
      let converted: TransformedSavedFleetData
      if (version !== 'poi-h-v1') {
        const fleets = codeConversion(ships); if (!fleets) continue
        converted = { fleets, note: Array.isArray(tags) ? tags.join(' ') : '', version: 'poi-h-v1' }
      } else {
        // Saved data is passed through historically when it has a truthy fleets field.
        // Do not validate its contents here: old and partial saves must remain loadable.
        if (!isPassthroughSavedData(record)) continue
        converted = record
      }
      if (converted.fleets) result[title] = converted
    } catch (error) { continue }
  }
  return result
}
export function getHenseiDataByCode(code: unknown): Fleet[] { return compact(codeConversion(code)) }

export function getHenseiDataByApi(fleets: unknown, ships: unknown, equips: unknown): Fleet[] {
  const fleetList = requireArray(fleets, 'API fleets'); const shipIndex = requireRecord(ships, 'API ships'); const equipIndex = requireRecord(equips, 'API equips')
  return compact(fleetList.map((rawFleet) => compact(requireArray(rawFleet, 'API fleet').map((rawRef) => {
    const ref = requireRecord(rawRef, 'API ship reference'); if (ref.id === -1) return undefined
    const ship = requireRecord(shipIndex[String(ref.id)], 'API ship'); const apiSlots = requireArray(ship.api_slot, 'API slots').map((id) => requireNumber(id, 'API slot id'))
    const apiSaku = requireArray(ship.api_sakuteki, 'API reconnaissance').map((value) => requireNumber(value, 'API reconnaissance'))
    const slots: SlotList = compact(apiSlots.map((slotId) => { if (slotId <= 0) return undefined; const equip = requireRecord(equipIndex[String(slotId)], 'API equipment'); const slot: Slot = { id: requireIdentifier(equip.api_slotitem_id, 'API equipment id'), lv: requireNumber(equip.api_level, 'API equipment level') }; if (equip.api_alv) slot.alv = requireNumber(equip.api_alv, 'API proficiency'); return slot }))
    const extra = requireNumber(ship.api_slot_ex, 'API extra slot'); if (extra > 0) slots.ex = { id: extra }
    return { id: requireIdentifier(ship.api_ship_id, 'API ship id'), lv: requireNumber(ship.api_lv, 'API level'), saku: requireNumber(apiSaku[0], 'API reconnaissance'), slots, soku: requireNumber(ship.api_soku, 'API speed') }
  }))))
}

export function dataToThirdparty(oldData: Fleet[]): UnknownRecord {
  const result: UnknownRecord = { version: 4 }
  oldData.forEach((fleet, fleetIndex) => {
    const outputFleet: UnknownRecord = {}
    if (fleet) fleet.forEach((ship, shipIndex) => {
      if (!ship) throw new TypeError('fleet contains an empty ship')
      const items: UnknownRecord = {}; const outputShip: UnknownRecord = { id: ship.id, lv: ship.lv, luck: -1, items }
      ship.slots.forEach((slot, slotIndex) => { const outputSlot: UnknownRecord = { id: slot.id, rf: slot.lv }; if (slot.alv) outputSlot.mas = slot.alv; items[`i${slotIndex + 1}`] = outputSlot })
      outputFleet[`s${shipIndex + 1}`] = outputShip
    })
    result[`f${fleetIndex + 1}`] = outputFleet
  })
  return result
}
