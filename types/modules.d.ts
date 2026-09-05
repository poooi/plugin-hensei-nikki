declare module 'views/utils/selectors' {
  type Selector<State, Result> = (state: State) => Result

  interface HostShip {
    api_name: string
    api_stype: number
    api_maxeq: number[]
  }

  interface HostEquip {
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

  interface HostApiShip {
    api_slot: number[]
    api_slot_ex?: number | null
    api_sakuteki: number[]
    api_lv: number
  }

  interface HostConstState {
    $ships: Record<number, HostShip>
    $shipTypes: Record<number, { api_name: string }>
    $equips: Record<number, HostEquip>
  }

  interface HostStoreState {
    [key: string]: unknown
  }

  export const constSelector: Selector<HostStoreState, HostConstState>
  export function equipDataSelectorFactory(
    id: number,
  ): Selector<HostStoreState, [HostEquip | undefined, HostEquip | undefined]>
  export function shipDataSelectorFactory(
    id: number,
  ): Selector<HostStoreState, [HostApiShip | undefined, HostShip | undefined]>
  export function extensionSelectorFactory<T>(
    key: string,
  ): Selector<HostStoreState, T>
}
