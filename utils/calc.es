import { range } from 'lodash'
import {
  dataToThirdparty,
  getHenseiDataByApi,
  getHenseiDataByCode,
  transSavedData,
} from './fleet-data'

export { dataToThirdparty, getHenseiDataByApi, getHenseiDataByCode, transSavedData }
/*
  code types
  thirdparty (support: 艦載機厨デッキビルダー(old, v3, v4))
  data (support: latest 4 versions) title: { ships(fleets), details, tags }
*/

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
function checkData(data) {
  if (!(data instanceof Object)) return false
  const { version, tags, fleets } = data
  if (version !== 'poi-h-v1') return false
  if (!(tags instanceof Array)) return false
  if (!(fleets instanceof Array)) return false
  if (!fleets.length) return false
  if (fleets.length > 4) return false
  const fleetValid = fleets.every(fleet => {
    if (!(fleet instanceof Array)) return false
    if (fleet.length > 6) return false
    const shipValid = fleet.every(ship => {
      if (!(ship instanceof Object)) return false
      const { id, slots } = ship
      if (!id) return false
      if (!(slots instanceof Array)) return false
      if (slots.length > 4) return false
      const slotValid = slots.every(slot => {
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

const aircraftExpTable = [0, 10, 25, 40, 55, 70, 85, 100, 121]
const aircraftLevelBonus = {
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

function getShipSaku(id, lv) {
  return 0
  const sakuArr = $saku[id] // [ lv1, lv99, lv100, lv155 ]
  const baseSaku = lv >= 100 ? sakuArr[2] : sakuArr[0]
  const tempSaku = (lv >= 100 ? sakuArr[3] : sakuArr[1]) - baseSaku
  const base = lv >= 100 ? lv - 1 : lv - 99
  const temp = lv >= 100 ? 99 - 1 : 155 - 100
  return tempSaku * base / temp + baseSaku
}

//  data = { shipId: { slots: [ { id, lv, alv }, ... , ex: { id } ], lv }, ... }
function getTyku(data, $equipsData, $shipsData, landbaseStatus=0) {
  let minTyku = 0
  let maxTyku = 0
  let basicTyku = 0
  let reconBonus = 1
  for (const ship of data) {
    if (!ship.id) continue
    const { slots, id } = ship
    const maxeq = $shipsData[id].api_maxeq
    slots.forEach((slot, i) => {
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
function getSaku25(data, $equipsData) {
  let reconSaku = 0
  let shipSaku = 0
  let radarSaku = 0
  let totalSaku = 0
  for (const ship of data) {
    if (!ship.id) continue
    const { slots, saku, lv } = ship
    shipSaku += saku || 0
    slots.forEach(slot => {
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
function getSaku25a(data, $equipsData, teitokuLv) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  for (const ship of data) {
    if (!ship.id) continue
    const { slots, lv, saku } = ship
    let shipPureSaku = saku || 0
    slots.forEach(slot => {
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
function getSaku33(data, $equipsData, teitokuLv, mapModifier=1.0) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  let shipCount = 6
  for (const ship of data) {
    shipCount -= 1
    const { slots, saku, lv } = ship
    let shipPureSaku = saku || 0
    slots.forEach(slot => {
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

const speedInterpretation = {
  [5]: 'Slow',
  [10]: 'Fast',
  [15]: 'Fast+',
  [20]: 'Fastest',
}

function getSoku(fleet) {
  return speedInterpretation[Math.min(...fleet.map(ship => ship.soku).filter(soku => !!soku))]
}

export function getDetails(fleet, $equips, $ships, teitokuLv) {
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
