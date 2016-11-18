const getI18n = window.i18n.resources.__

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
