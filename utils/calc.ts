const range = (start: number, end: number): number[] => Array.from(
  { length: Math.max(0, end - start) },
  (_, index) => start + index,
)

const compact = (values: any[] | undefined): any[] => (values || []).filter(Boolean)

export interface SlotData {
  id: number
  lv?: number
  alv?: number
}

export type SlotList = SlotData[] & { ex?: SlotData }

export interface ShipData {
  id: number
  lv?: number
  saku?: number
  soku?: number
  slots: SlotList
}

export type FleetData = Array<ShipData | undefined>
export type FleetsData = Array<FleetData | undefined>

export interface SavedRecord {
  version: 'poi-h-v1'
  fleets: FleetsData
  note?: string
}

const arrDepth = (p: number, a: unknown): number => Math.max(
  p,
  a instanceof Array ? a.reduce<number>(arrDepth, 0) + 1 : 0,
)
/*
  code types
  thirdparty (support: 艦載機厨デッキビルダー(old, v3, v4))
  data (support: latest 4 versions) title: { ships(fleets), details, tags }
*/

/*
  old
  shipItem [ shipId, [ lv, cond ], [ ...slotId ], [ ...slotLv ] ]
  code: [ (fleet)[ shipItem, ... ], ... ]
*/
function oldSlots(idArr: any[], lvArr: any[] = [], alvArr: any[] = []): SlotData[] {
  if (!idArr.length) return []
  return idArr.map((id: number, i: number): SlotData => {
    const slot: SlotData = { id }
    if (lvArr[i]) slot.lv = lvArr[i]
    if (alvArr[i]) slot.alv = alvArr[i]
    return slot
  })
}
function oldFleet(data: any[]): FleetData | undefined {
  if (!data.length) return
  return data.map((s: any): ShipData => ({
    id: s[0],
    lv: s[1][0],
    slots: oldSlots(s[2], s[3], s[4]),
  }))
}
function oldVer(data: any): FleetsData {
  const depth = arrDepth(0, data)
  const fleets = []
  if (depth === 3) {
    fleets.push(oldFleet(data))
  } else if (depth === 4) {
    data.forEach((fleet: any[]) => fleets.push(oldFleet(fleet)))
  } else {
    throw 'TypeError'
  }
  return fleets.map(f => f)
}
/*
  v3
  {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}
*/
/*
  v4
  {version: 4, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}
*/
function newSlots(data: Record<string, any>): SlotList {
  const slots: SlotList = compact(range(1, 5).map((i: number): SlotData | undefined => {
    const s = data['i' + i]
    if (s && s.id) {
      const { id, rf, rp, mas } = s
      const slot: SlotData = { id }
      if (rf) slot.lv = rf
      if (rp) slot.alv = rp
      if (mas) slot.alv = mas
      return slot
    }
  })) as SlotList
  if (data.ix) slots.ex = data.ix
  return slots
}
function newFleet(data: Record<string, any>): FleetData {
  return compact(range(1, 7).map((i: number): ShipData | undefined => {
    const ship = data['s' + i]
    if (ship && Object.keys(ship).length) {
      const { id, lv, items } = ship
      return { id, lv, slots: newSlots(items) }
    }
  }))
}
function newVer(data: Record<string, any>): FleetsData {
  return compact(range(1, 5).map((i: number): FleetData | undefined => {
    const fleet = data['f' + i]
    if (fleet && Object.keys(fleet).length) return newFleet(fleet)
  }))
}
/*
  v1
  ships: [ [ [ id, [ lv(null), cond(-1) ], [ ...slotId ], [ ...slotLv(null) ], [ ...slotALv(null) ] ], ... ], ... ]
  [] for empty
  detials: [ [ totalLv, fpBasic, fpAlv ], ... ]
  [ 0, 0, 0 ] for empty
  tags: [ tag, ... ]
  "" for empty
*/

/*
  v2
  ships: [ [ [ id, [ lv(null), cond(-1) ], [ ...slotId ], [ ...slotLv(null) ], [ ...slotALv(null) ] ] ] ]
  ignore empty
  details: [ [ totalLv, fpBasic, fpAlv, los, losA ] ]
  ignore empty
  tags: [ tag, ... ]
  [] for empty
*/

/*
  v3
  v: "min"
  ships: [ [ [ id, [ lv(null), cond(-1) ], [ ...slotId ], [ ...slotLv(null) ], [ ...slotALv(null) ] ] ] ]
  ignore empty
  details: [ [ totalLv, minFP, maxFP, los, losA, los33 ] ]
  ignore empty, null for undefined & NaN
  tags: [ tag, ... ]
  [] for empty
*/

/*
  latest
  version: poi-h-v1
  fleets: [ [ { id, lv, saku, slots: [ { id, lv, alv }, .. , ex: { id } ] }, ... ], ... ]
  [] for empty slot
  tags: [ tag, ... ]
  [] for empty
*/
function checkData(data: any): boolean {
  if (!(data instanceof Object)) return false
  const { version, tags, fleets } = data
  if (version !== 'poi-h-v1') return false
  if (!(tags instanceof Array)) return false
  if (!(fleets instanceof Array)) return false
  if (!fleets.length) return false
  if (fleets.length > 4) return false
  const fleetValid = fleets.every((fleet: any) => {
    if (!(fleet instanceof Array)) return false
    if (fleet.length > 6) return false
    const shipValid = fleet.every((ship: any) => {
      if (!(ship instanceof Object)) return false
      const { id, slots } = ship
      if (!id) return false
      if (!(slots instanceof Array)) return false
      if (slots.length > 4) return false
      const slotValid = slots.every((slot: any) => {
        if (!(slot instanceof Object)) return false
        if (!slot.id) return false
      })
      if (!slotValid) return false
    })
    if (!shipValid) return false
  })
  if (!fleetValid) return false
  return true
}

function codeConversion(data: any): FleetsData | undefined {
  if (data instanceof Array) {
    return oldVer(data) // thirdparty & HenseiNikki old version
  } else if (data instanceof Object) {
    if ([3, 4].includes(data.version)) {
      return newVer(data) // thirdparty new version
    } else if (data.version === 'poi-h-v1') {
      return data.fleets
    }
  }
}

const aircraftExpTable = [0, 10, 25, 40, 55, 70, 85, 100, 121]
const aircraftLevelBonus: Record<number, number[]> = {
  '6': [0, 0, 2, 5, 9, 14, 14, 22, 22],   // 艦上戦闘機
  '7': [0, 0, 0, 0, 0, 0, 0, 0, 0],       // 艦上爆撃機
  '8': [0, 0, 0, 0, 0, 0, 0, 0, 0],       // 艦上攻撃機
  '11': [0, 1, 1, 1, 1, 3, 3, 6, 6],      // 水上爆撃機
  '45': [0, 0, 2, 5, 9, 14, 14, 22, 22],  // 水上戦闘機
  '47': [0, 0, 0, 0, 0, 0, 0, 0, 0],       // 陸上攻撃機
  '48': [0, 0, 2, 5, 9, 14, 14, 22, 22],   // 局地戦闘機 陸軍戦闘機
  '56': [0, 0, 0, 0, 0, 0, 0, 0, 0],      // 噴式戦闘機
  '57': [0, 0, 0, 0, 0, 0, 0, 0, 0],      // 噴式戦闘爆撃機
  '58': [0, 0, 0, 0, 0, 0, 0, 0, 0],      // 噴式攻撃機
}

function getShipSaku(_id: number, _lv: number): number {
  return 0
}

//  data = { shipId: { slots: [ { id, lv, alv }, ... , ex: { id } ], lv }, ... }
function getTyku(
  data: FleetData,
  $equipsData: Record<number, any>,
  $shipsData: Record<number, any>,
  landbaseStatus = 0,
) {
  let minTyku = 0
  let maxTyku = 0
  let basicTyku = 0
  let reconBonus = 1
  for (const ship of data) {
    if (!ship) continue
    if (!ship.id) continue
    const { slots, id } = ship
    const maxeq = $shipsData[id].api_maxeq
    slots.forEach((slot: SlotData, i: number) => {
      const { id, lv, alv } = slot
      let tempTyku = 0.0
      const tempAlv = alv || 0
      const $equip = $equipsData[id]
      const levelFactor = $equip.api_baku > 0 ? 0.25 : 0.2

      if ([6, 7, 8, 45, 47, 56, 57, 58].includes($equip.api_type[2])) {
        // 艦载機 · 水上戦闘機 · 陸上攻撃機 · 噴式機
        tempTyku += Math.sqrt(maxeq[i]) * ($equip.api_tyku + (lv || 0) * levelFactor)
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(maxeq[i]) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([11].includes($equip.api_type[2])) {
        // 水上爆撃機
        tempTyku += Math.sqrt(maxeq[i]) * $equip.api_tyku
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(maxeq[i]) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([48].includes($equip.api_type[2])) {
        // 局戦 · 陸戦
        let landbaseBonus = 0
        if (landbaseStatus === 1) landbaseBonus = 1.5 * $equip.api_houk // (対空 ＋ 迎撃 × 1.5)
        if (landbaseStatus === 2) landbaseBonus = $equip.api_houk + 2 * $equip.api_houm // (対空 ＋ 迎撃 ＋ 対爆 × 2)
        tempTyku += Math.sqrt(maxeq[i]) * ($equip.api_tyku + landbaseBonus + (lv || 0) * levelFactor)
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(maxeq[i]) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([10, 41].includes($equip.api_type[2])) {
        // 水偵・飛行艇
        if (landbaseStatus == 2) {
          if ($equip.api_saku >= 9) {
            reconBonus = Math.max(reconBonus, 1.16)
          } else if ($equip.api_saku == 8) {
            reconBonus = Math.max(reconBonus, 1.13)
          } else {
            reconBonus = Math.max(reconBonus, 1.1)
          }
        } else if (landbaseStatus == 1) {
          tempTyku += Math.sqrt(maxeq[i]) * $equip.api_tyku
          minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
          maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
        }
      } else if ([9].includes($equip.api_type[2]) && landbaseStatus == 2) {
        // 艦偵
        if (landbaseStatus == 2) {
          if ($equip.api_saku >= 9) {
            reconBonus = Math.max(reconBonus, 1.3)
          } else {
            reconBonus = Math.max(reconBonus, 1.2)
          }
        } else if (landbaseStatus == 1) {
          tempTyku += Math.sqrt(maxeq[i]) * $equip.api_tyku
          minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
          maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
        }
      }
    })
  }
  return {
    basic: basicTyku,
    min: minTyku,
    max: maxTyku,
  }
}

// Saku (2-5 旧式)
// 偵察機索敵値×2 ＋ 電探索敵値 ＋ √(艦隊の装備込み索敵値合計 - 偵察機索敵値 - 電探索敵値)
function getSaku25(data: FleetData, $equipsData: Record<number, any>) {
  let reconSaku = 0
  let shipSaku = 0
  let radarSaku = 0
  let totalSaku = 0
  for (const ship of data) {
    if (!ship) continue
    if (!ship.id) continue
    const { slots, saku, lv } = ship
    shipSaku += saku || 0
    slots.forEach((slot: SlotData) => {
      const $equip = $equipsData[slot.id]
      switch ($equip.api_type[3]) {
      case 9:
        reconSaku += $equip.api_saku
        shipSaku -= $equip.api_saku
        break
      case 10:
        if ($equip.api_type[2] == 10) {
          reconSaku += $equip.api_saku
          shipSaku -= $equip.api_saku
        }
        break
      case 11:
        radarSaku += $equip.api_saku
        shipSaku -= $equip.api_saku
        break
      default:
        break
      }
    })
  }
  reconSaku = reconSaku * 2.00
  shipSaku = Math.sqrt(shipSaku) || 0
  totalSaku = reconSaku + radarSaku + shipSaku

  return {
    recon: parseFloat(reconSaku.toFixed(2)),
    radar: parseFloat(radarSaku.toFixed(2)),
    ship: parseFloat(shipSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

// Saku (2-5 秋式)
// 索敵スコア = 艦上爆撃機 × (1.04) + 艦上攻撃機 × (1.37) + 艦上偵察機 × (1.66) + 水上偵察機 × (2.00)
//            + 水上爆撃機 × (1.78) + 小型電探 × (1.00) + 大型電探 × (0.99) + 探照灯 × (0.91)
//            + √(各艦毎の素索敵) × (1.69) + (司令部レベルを5の倍数に切り上げ) × (-0.61)
function getSaku25a(data: FleetData, $equipsData: Record<number, any>, teitokuLv: number) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  for (const ship of data) {
    if (!ship) continue
    if (!ship.id) continue
    const { slots, lv, saku } = ship
    let shipPureSaku = saku || 0
    slots.forEach((slot: SlotData) => {
      const $equip = $equipsData[slot.id]
      shipPureSaku -= $equip.api_saku
      switch ($equip.api_type[3]) {
      case 7:
        equipSaku += $equip.api_saku * 1.04
        break
      case 8:
        equipSaku += $equip.api_saku * 1.37
        break
      case 9:
        equipSaku += $equip.api_saku * 1.66
        break
      case 10:
        if ($equip.api_type[2] == 10) {
          equipSaku += $equip.api_saku * 2.00
        } else if ($equip.api_type[2] == 11) {
          equipSaku += $equip.api_saku * 1.78
        }
        break
      case 11:
        if ($equip.api_type[2] == 12) {
          equipSaku += $equip.api_saku * 1.00
        }
        else if ($equip.api_type[2] == 13) {
          equipSaku += $equip.api_saku * 0.99
        }
        break
      case 24:
        equipSaku += $equip.api_saku * 0.91
        break
      default:
        break
      }
    })
    shipSaku += Math.sqrt(shipPureSaku) * 1.69
  }
  teitokuSaku = 0.61 * Math.floor((teitokuLv + 4) / 5) * 5
  totalSaku = shipSaku + equipSaku - teitokuSaku

  return {
    ship: parseFloat(shipSaku.toFixed(2)),
    item: parseFloat(equipSaku.toFixed(2)),
    teitoku: parseFloat(teitokuSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

// Saku (33)
// 索敵スコア = Sigma(CiSi) + Sigma(sqrt(s)) - Ceil(0.4H) + 2M
//     Si(改修): 電探(1.25 * Sqrt(Star)) 水上偵察機(1.2 * Sqrt(Star))
//     Ci(装備):
//              6 0.6 艦上戦闘機
//              7 0.6 艦上爆撃機
//              8 0.8 艦上攻撃機
//              9 1.0 艦上偵察機
//             10 1.2 水上偵察機
//             11 1.1 水上爆撃機
//             12 0.6 小型電探
//             13 0.6 大型電探
//             26 0.6 対潜哨戒機
//             29 0.6 探照灯
//             34 0.6 司令部施設
//             35 0.6 航空要員
//             39 0.6 水上艦要員
//             40 0.6 大型ソナー
//             41 0.6 大型飛行艇
//             42 0.6 大型探照灯
//             45 0.6 水上戦闘機
//             93 大型電探(II) null
//             94 艦上偵察機(II) null
//     S(各艦毎の素索敵)
//     H(レベル)
//     M(空き数)
function getSaku33(
  data: FleetData,
  $equipsData: Record<number, any>,
  teitokuLv: number,
  mapModifier = 1.0,
) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  let shipCount = 6
  for (const ship of data) {
    if (!ship) continue
    shipCount -= 1
    const { slots, saku, lv } = ship
    let shipPureSaku = saku || 0
    slots.forEach((slot: SlotData) => {
      const { id, lv } = slot
      const $equip = $equipsData[id]
      shipPureSaku -= $equip.api_saku
      switch ($equip.api_type[2]) {
      case 8:
        equipSaku += $equip.api_saku * 0.8
        break
      case 9:
        equipSaku += $equip.api_saku * 1.0
        break
      case 10:
        equipSaku += ($equip.api_saku + 1.2 * Math.sqrt(lv || 0)) * 1.2
        break
      case 11:
        equipSaku += $equip.api_saku * 1.1
        break
      case 12:
        equipSaku += ($equip.api_saku + 1.25 * Math.sqrt(lv || 0)) * 0.6
        break
      case 13:
        equipSaku += ($equip.api_saku + 1.25 * Math.sqrt(lv || 0)) * 0.6
        break
      default:
        equipSaku += $equip.api_saku * 0.6
        break
      }
    })
    shipSaku += Math.sqrt(shipPureSaku)
  }
  equipSaku *= mapModifier
  teitokuSaku = Math.ceil(teitokuLv * 0.4)
  totalSaku = shipSaku + equipSaku - teitokuSaku + 2 * shipCount

  return {
    ship: parseFloat(shipSaku.toFixed(2)),
    item: parseFloat(equipSaku.toFixed(2)),
    teitoku: parseFloat(teitokuSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

const speedInterpretation: Record<number, string> = {
  [5]: 'Slow',
  [10]: 'Fast',
  [15]: 'Fast+',
  [20]: 'Fastest',
}

function getSoku(fleet: FleetData): string | undefined {
  return speedInterpretation[Math.min(...fleet.filter(Boolean).map((ship) => ship!.soku || 0).filter((soku) => !!soku))]
}

export function getDetails(
  fleet: FleetData,
  $equips: Record<number, any>,
  $ships: Record<number, any>,
  teitokuLv: number,
) {
  return {
    tyku: getTyku(fleet, $equips, $ships),
    saku25: getSaku25(fleet, $equips),
    saku25a: getSaku25a(fleet, $equips, teitokuLv),
    saku33: getSaku33(fleet, $equips, teitokuLv),
    saku33x3: getSaku33(fleet, $equips, teitokuLv, 3.0),
    saku33x4: getSaku33(fleet, $equips, teitokuLv, 4.0),
    soku: getSoku(fleet),
  }
}
export function transSavedData(oldData: Record<string, any>): Record<string, SavedRecord> {
  const newData: Record<string, SavedRecord> = {}
  for (const title in oldData) {
    try {
      const { version, ships, tags } = oldData[title]
      let tempData: any = {}
      if (version !== 'poi-h-v1') {
        tempData.fleets = codeConversion(ships)
        tempData.note = typeof tags === 'object' && tags instanceof Array
                      ? tags.join(' ')
                      : ''
        tempData.version = 'poi-h-v1'
      } else {
      tempData = oldData[title]
      }
      if (!tempData.fleets) continue
      newData[title] = tempData
    } catch (e) {
      continue
    }
  }
  return newData
}
export function getHenseiDataByCode(code: any): FleetsData {
  return compact(codeConversion(code))
}
export function getHenseiDataByApi(
  fleets: Array<Array<{ id: number }>>,
  ships: Record<number, any>,
  equips: Record<number, any>,
): FleetsData {
  return compact(fleets.map(fleet =>
    compact(fleet.map((ship): ShipData | undefined => {
      if (ship.id !== -1) {
        const s = ships[ship.id]
        const e = s.api_slot                // arr
        const ex = s.api_slot_ex            // int

        const id = s.api_ship_id
        const lv = s.api_lv
        const saku = s.api_sakuteki[0]
        const soku = s.api_soku
        const slots: SlotList = compact(e.map((slotId: number): SlotData | undefined => {
          if (slotId > 0) {
            const slot = equips[slotId]
            const sData: SlotData = { id: slot.api_slotitem_id, lv: slot.api_level }
            if (slot.api_alv) sData.alv = slot.api_alv
            return sData
          }
        }))
        if (ex > 0) slots.ex = { id: ex }

        return {
          id,
          lv,
          saku,
          slots,
          soku,
        }
      }
    }))
  ))
}
export function dataToThirdparty(oldData: FleetsData) {
  const newData: Record<string, any> = { version: 4 }
  oldData.forEach((fleet: FleetData | undefined, fi: number) => {
    const f: Record<string, any> = {}
    if (fleet) {
      fleet.forEach((ship: ShipData | undefined, si: number) => {
        if (!ship) return
        const { id, lv, slots } = ship
        const s: Record<string, any> = { id, lv, luck: -1, items: {} }
        slots.forEach((slot: SlotData, ei: number) => {
          const e: Record<string, any> = { id: slot.id, rf: slot.lv }
          if (slot.alv) e.mas = slot.alv
          s.items[`i${ei + 1}`] = e
        })
        f[`s${si + 1}`] = s
      })
    }
    newData[`f${fi + 1}`] = f
  })
  return newData
}
