import { isEmpty, forEach, unzip } from 'lodash'
import {
  shipDataSelectorFactory,
  constSelector,
  shipEquipDataSelectorFactory,
  fleetShipsIdSelectorFactory,
} from 'views/utils/selectors'
import { getTyku, getSaku25, getSaku25a, getSaku33 } from 'views/utils/game-utils'
import { henseiDataSelector } from '../redux/selectors'

const getI18n = window.i18n.resources.__

export function getSlotInfo(id) {
  const equipsData = getStore(shipEquipDataSelectorFactory(id))
  const items = []

  forEach(equipsData, (data) => {
    const [ equip, $equip ] = data
    let item = {}
    if ($equip.api_name) {
      item.name = i18n.resources.__($equip.api_name)
    }
    if (equip.api_level) {
      item.lv = equip.api_level
    }
    if (equip.api_alv) {
      item.alv = equip.api_alv
    }
    items.push(item)
  })

  return items
}

export function getShipInfo(id) {
  const [ ship, $ship ] = getStore(shipDataSelectorFactory(id))
  const { $shipTypes } = getStore(constSelector(id))
  const slotitems = getSlotInfo(ship.api_id)

  return {
    name: i18n.resources.__($ship.api_name),
    type: i18n.resources.__($shipTypes[$ship.api_stype]),
    lv: ship.api_lv,
    luck: ship.api_lucky[0],
    slotitems,
  }
}

function getDeck(i) {

}

export function getDecksData(deckChecked, tags) {
  const data = {}
  forEach(deckChecked, (checked, i) => {
    if (checked) {
      const shipIds = getStore(fleetShipsIdSelectorFactory(i))
      data.details.push(getDeckDetails(i))
      data.fleets.push(getShipsData(i))
    }
  })
  return data
}


// {"version":4,
//   "f1":{
//     "s1":{
//       "id":"352",
//       "lv":0,
//       "luck":-1,
//       "items":{
//         "i1":{"id":12,"rf":0},
//         "i2":{"id":153,"rf":0},
//         "i3":{"id":55,"rf":0},
//         "i4":{"id":43,"rf":0}}}}}
// f(leet)*は艦隊、s(hip)*は船、i(item)*は装備でixは拡張スロット、rfは改修、masは熟練度


function getValue(fleets) {
  const values = []
  fleets.forEach(fleet => {
    fleet.forEach(ship => {
      const shipValues = []
      shipValues.push()
    })
  })
  forEach(data, (ship, idx) => {
    const ship = getShipInfo(ship.id)
    forEach(ship, (value, key) => {
      if (key === 'slotitems') {
        values.push(value.name)
      } else if (key !== 'lv'){
        values.push(value)
      }
    })
  })
  return values
}



function isMacth(keyword, value) {
  const k = String(keyword).toLowerCase().trim()
  const v = String(value).toLowerCase().trim()
  return v.indexOf(k) > 0
}

export function dataFilter(keyword, data, $ships, $equips) {
  const allData = {}
  for (let title in data) {
    const fleetMatch = data[title].fleets.filter(fleet => {
      const shipMatch = fleet.filter(ship => {
        const slotsMacth = ship.slots.filter(slot => {
          return isMacth(keyword, getI18n($equips[slot.id].api_name))
        })
        return isMacth(keyword, getI18n($ships[ship.id].api_name))
               || slotsMacth.length
      })
      return shipMatch.length
    })
    if (match.length) allData[title] = data[title]
  }
  return allData
}
