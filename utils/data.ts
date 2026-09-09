import { isSavedFleetData, SavedDataRecords } from './calc'

const getI18n = window.i18n.resources.__

function isMatch(keyword: string, value: string): boolean {
  const normalizedKeyword = String(keyword).toLowerCase().trim()
  const normalizedValue = String(value).toLowerCase().trim()
  return normalizedValue.indexOf(normalizedKeyword) > 0
}

export function dataFilter(
  keyword: string,
  data: SavedDataRecords,
  $ships: HenseiConstants['$ships'],
  $equips: HenseiConstants['$equips'],
): SavedDataRecords {
  const filtered: SavedDataRecords = {}
  for (const [title, record] of Object.entries(data)) {
    if (!isSavedFleetData(record)) continue
    const matches = record.fleets.some((fleet) => {
      if (!fleet) return false
      return fleet.some((ship) => {
        if (!ship) return false
        const constantShip = $ships[String(ship.id)]
        const shipMatches = constantShip && isMatch(keyword, getI18n(constantShip.api_name))
        const equipmentMatches = ship.slots.some((slot) => {
          const constantEquip = $equips[String(slot.id)]
          return Boolean(constantEquip && isMatch(keyword, getI18n(constantEquip.api_name)))
        })
        return Boolean(shipMatches || equipmentMatches)
      })
    })
    if (matches) filtered[title] = record
  }
  return filtered
}
