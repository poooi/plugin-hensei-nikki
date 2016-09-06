import { isEmpty, forEach, reject, unzip } from 'lodash'
import {
  shipDataSelectorFactory,
  constSelector,
  shipEquipDataSelectorFactory,
  fleetShipsIdSelectorFactory,
} from 'views/utils/selectors'
import { getTyku, getSaku25, getSaku25a, getSaku33 } from 'views/utils/game-utils'
import { henseiDataSelector } from '../redux/selectors'
const { getStore } = window

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

function _filter(keyword, data) {
  if (!keyword) {
    return data
  }

  return unzip(data.filter((d) => {
    let match = false
    forEach(d, (value) => {
      key = String(value).toLowerCase().trim().indexOf(String(keyword).toLowerCase().trim())
      if (key >= 0) {
        match = true
      }
    })
    return match
  }))[0]
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


function getValue(data) {
  const values = []
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

export function dataFilter(keyword, data) {
  const allData = []

  if (isEmpty(data)) {
    return
  }

  forEach(data, (d, title) => {
    if (d.fleets.length > 1) {
      const fleets = []
      forEach(d.fleets, (fleet) => {
        fleets.push(fleet)
      })
      allData.push([title, getValue(fleets)])
    } else {
      allData.push([title, getValue(d.fleets)])
    }
  })

  return _filter(keyword, allData)
}
