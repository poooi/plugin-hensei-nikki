import { getTyku, getSaku25, getSaku25a, getSaku33 } from 'views/utils/game-utils'

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

}
/*
  v3
  {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}
*/
/*
  v4
  {version: 4, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}
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
  version: poi-henseinikki-v1
  fleets: [ [ { id, lv, slots: [ id, .. ], exSlot: { id } }, ... ], ... ]
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
