import { chunk, fromPairs, map, unzip, concat, fill } from 'lodash'
import { getTyku, getSaku25, getSaku25a, getSaku33 } from 'views/utils/game-utils'

const arrDepth = (p, a) => Math.max(p, a instanceof Array ? a.reduce(arrDepth, 0) + 1 : 0)
const fillIfEmpty = (arr, length) => arr.concat(new Array(length - arr.length))

const getEquipsItem = (id, { lv, alv }) => {
  const { api_type, api_tyku, api_saku } = getShip(id)
  const data = [ {}, { api_type, api_tyku, api_saku } ]
  if (lv) data[0].api_level = lv
  if ([ 6, 7, 10 ].includes(api_type[2])) data[0].api_alv = alv || 0
  return data
}

const getSlots = (data, num) => fillIfEmpty(data.map(([id, lv]) => ({ [id]: getEquipsItem(id, { lv }) })), num)

const getShipItem = ship => {
  if (ship instanceof Array) return { [ship[0]]: { lv: ship[1][0], slots: getSlots(unzip([ship[2], ship[3], ship[4]]), $ship.api_slot_num) } }
  if (ship instanceof Object) return { [ship.id]: { lv: ship.lv, slots: [ ...Object.keys(ship.item) ] } }
  return false
}
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
function oldVer(data) {
  const depth = arrDepth(data)
  const fleets = []
  if (depth === 3) {
    fleets.push(data.map(ship => getShipItem(ship)))
  } else if (depth === 4) {
    data.forEach(fleet => fleets.push(fleet.map(ship => getShipItem(ship))))
  } else {
    return false
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
function newVer(data, ver) {
  const fleets = []
  const alvStr = ver === 3 ? 'rp' : 'mas'
  for (let index in data) {
    if (index.includes('f')) {
      let fleet = data[index]
      fleets.push(fleet.map(ship => {
        for (let slot in ship.items) {
          ship.items[slot].alv = ship.items[slot][alvStr]
        }
        getShipItem(ship)
      }))
    }
  }
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
  version: poi-henseinikki-v1
  fleets: [ [ id: { lv, slots: { id: { ...equipsData }, .. }, exSlot: { id } }, ... ], ... ]
  ignore empty
  details: { equipsData, shipsData, teitokuLv }
  ignore empty
  tags: [ tag, ... ]
  [] for empty
*/

function codeConversion() {

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
