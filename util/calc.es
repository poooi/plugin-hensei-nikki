import { chunk, fromPairs, map, unzip, concat, fill, range } from 'lodash'
import { getTyku, getSaku25, getSaku25a, getSaku33 } from 'views/utils/game-utils'

const arrDepth = (p, a) => Math.max(p, a instanceof Array ? a.reduce(arrDepth, 0) + 1 : 0)
const fillIfEmpty = (arr, length) => arr.concat(new Array(length - arr.length))

// const getEquipsItem = (id, { lv, alv }) => {
//   const { api_type, api_tyku, api_saku } = getShip(id)
//   const data = [ {}, { api_type, api_tyku, api_saku } ]
//   if (lv) data[0].api_level = lv
//   if ([ 6, 7, 10 ].includes(api_type[2])) data[0].api_alv = alv || 0
//   return data
// }
//
// const getSlots = (data, num) => fillIfEmpty(data.map(([id, lv]) => ({ [id]: getEquipsItem(id, { lv }) })), num)
//
// const getShipItem = ship => {
//   if (ship instanceof Array) return { [ship[0]]: { lv: ship[1][0], slots: getSlots(unzip([ship[2], ship[3], ship[4]]), $ship.api_slot_num) } }
//   if (ship instanceof Object) return { [ship.id]: { lv: ship.lv, slots: [ ...Object.keys(ship.item) ] } }
//   return false
// }

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
function oldSlots(idArr, lvArr, alvArr) {
  if (!idArr.length) return
  const slots = []
  idArr.forEach((id, i) => {
    slot = { id }
    if (lvArr[i]) slot.lv = lvArr[i]
    if (alvArr[i]) slot.alv = alvArr[i]
    slots.push(slot)
  })
  return slots
}
function oldFleet(data) {
  if (!data.length) return
  const fleet = []
  data.forEach(s => fleet.push({ id: s[0], lv: s[1][0], slots: oldSlots(s[2], s[3], s[4]) }))
  return fleet
}
function oldVer(data) {
  const depth = arrDepth(0, data)
  const fleets = []
  if (depth === 3) {
    fleets.push(oldFleet(data))
  } else if (depth === 4) {
    data.forEach(fleet => fleets.push(oldFleet(fleet)))
  } else {
    return
  }
  return fleets
}
/*
  v3
  {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}
*/
/*
  v4
  {version: 4, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}
*/
function newSlots(data) {
  const slots = []
  range(1, 5).forEach(i => {
    const s = data['i' + i]
    if (s && s.id) {
      const { id, rf, rp, mas } = s
      const slot = { id }
      if (rf) slot.lv = rf
      if (rp) slot.alv = rp
      if (mas) slot.alv = mas
      slots.push(slot)
    } else {
      slots.push([])
    }
  })
  if (data.ix) slots.ex = data.ix
  return slots
}
function newFleet(data) {
  const fleet = []
  range(1, 7).forEach(i => {
    const ship = data['s' + i]
    if (ship && Object.keys(ship).length) {
      const { id, lv, items } = ship
      fleet.push({ id, lv, slots: newSlots(items) })
    }
  })
  return fleet
}
function newVer(data) {
  const fleets = []
  range(1, 5).forEach(i => {
    const fleet = data['f' + i]
    if (fleet && Object.keys(fleet).length) fleets.push(newFleet(fleet))
  })
  return fleets
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

function codeConversion(data) {
  if (data && checkData(data)) return data
  let fleets
  if (data instanceof Array) { // thirdparty old version
    fleets = oldVer(data)
  } else if (data instanceof Object) {
    if ([ 3, 4 ].indexOf(data.version) > 0) { // thirdparty new version
      fleets = newVer(data)
    } else if (data.ships && data.details) { // HenseiNikki old version
      fleets = oldVer(data.ships)
    }
  }
  return fleets
}

/*
  details: {
    equipsData: [
      [
        { _equip.api_alv, _equip.api_level },
        { $equip.api_type, $equip.api_tyku, $equip.api_saku },
      ],
      ...
    ],
    shipsData: [
      [ { _ship.api_sakuteki: [ api_sakuteki[0] ] } ],
      ...
    ],
    teitokuLv: 0,
  }

  forTyku
  equipsData [ [ { _equip.api_alv, _equip.api_level }, { $equip.api_type, $equip.api_tyku } ], ... ]
  return { min, max }

  forSaku25
  shipsData [ [ { _ship.api_sakuteki: [ api_sakuteki[0] ] } ], ... ]
  equipsData [ [ [], { $equip.api_type, $equip.api_saku } ], ... ]
  return { recon, radar, ship, total } ship + recon + radar = total

  forSaku25a
  shipsData [ [ { _ship.api_sakuteki: [ api_sakuteki[0] ] } ], ... ]
  equipsData [ [ [], { $equip.api_type, $equip.api_saku } ], ... ]
  teitokuLv
  return { ship, item, teitoku, total } ship + item - teitoku = total

  forSaku33
  shipsData [ [ { _ship.api_sakuteki: [ api_sakuteki[0] ] } ], ... ]
  equipsData [ [ {  _equip.api_level } , { $equip.api_type, $equip.api_saku } ], ... ]
  teitokuLv
  return { ship, item, teitoku, total } ship + item - teitoku + 2 * shipCount = total
*/

function getDetails(details) {
  const { equipsData, shipsData, teitokuLv } = details

  getTyku(equipsData)
  getSaku25(shipsData, equipsData)
  getSaku25a(equipsData, shipsData, teitokuLv)
  getSaku33(equipsData, shipsData, teitokuLv)
}

function getFleets(fleets) {

}

export function getHenseiData(data) {
  return {
    details: getDetails(data.detail),
    fleets: getFleets(data.fleets),
  }
}
