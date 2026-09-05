export interface PoiResources {
  fixedT?: (key: string, options: { keySeparator: boolean }) => string
  __(key: string): string
}

export interface PoiI18n {
  resources: PoiResources
}

export interface HostShip {
  api_name: string
  api_stype: number
  api_maxeq: number[]
}

export interface HostEquip {
  api_name: string
  api_type: number[]
  api_baku: number
  api_tyku: number
  api_houk: number
  api_houm: number
  api_saku: number
  api_level?: number
  api_alv?: number
}

export interface HostApiShip {
  api_slot: number[]
  api_slot_ex?: number | null
  api_sakuteki: number[]
  api_lv: number
}

export interface HostConstState {
  $ships: Record<number, HostShip>
  $shipTypes: Record<number, { api_name: string }>
  $equips: Record<number, HostEquip>
}

export interface HostStoreState {
  [key: string]: unknown
}

declare global {
  interface Window {
    APPDATA_PATH: string
    i18n: PoiI18n
    getStore(path: string): unknown
    toggleModal(...messages: string[]): void
  }
}
