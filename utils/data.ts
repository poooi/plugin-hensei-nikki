const getI18n = window.i18n.resources.__

function isMacth(keyword: string, value: unknown): boolean {
  const k = String(keyword).toLowerCase().trim()
  const v = String(value).toLowerCase().trim()
  return v.indexOf(k) > 0
}

export function dataFilter(
  keyword: string,
  data: Record<string, any>,
  $ships: Record<number, any>,
  $equips: Record<number, any>,
): Record<string, any> {
  const allData: Record<string, any> = {}
  for (const title in data) {
    const fleetMatch = data[title].fleets.filter((fleet: any[]) => {
      const shipMatch = fleet.filter((ship: any) => {
        const slotsMacth = ship.slots.filter((slot: any) => {
          return isMacth(keyword, getI18n($equips[slot.id].api_name))
        })
        return isMacth(keyword, getI18n($ships[ship.id].api_name))
               || slotsMacth.length
      })
      return shipMatch.length
    })
    if (fleetMatch.length) allData[title] = data[title]
  }
  return allData
}
