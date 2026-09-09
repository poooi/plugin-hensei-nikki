type HenseiPluginState = import('../redux').HenseiState
interface HenseiHostRootState {
  'poi-plugin-hensei-nikki': HenseiPluginState
}

interface HenseiConstantShip {
  api_name: string
  api_stype: number
}

interface HenseiConstantEquip {
  api_name: string
  api_type: number[]
}

interface HenseiApiShip {
  api_lv: number
  api_sakuteki: number[]
  api_slot: number[]
  api_slot_ex: number
}

interface HenseiApiEquip {
  api_level: number
  api_alv?: number
}

interface HenseiConstants {
  $ships: Record<string, HenseiConstantShip>
  $shipTypes: Record<string, { api_name: string }>
  $equips: Record<string, HenseiConstantEquip>
}

interface Window {
  APPDATA_PATH: string
  getStore(path: string): string | number | undefined
  i18n: {
    resources: {
      fixedT?: (key: string, options: { keySeparator: boolean }) => string
      __(key: string): string
    }
  }
  toggleModal(...messages: string[]): void
}

declare module 'fs-extra' {
  export const R_OK: number
  export function ensureDirSync(path: string): void
  export function readJSONSync(path: string): unknown
  export function accessSync(path: string, mode: number): void
}

declare module 'path-extra' {
  export function join(...paths: string[]): string
}

declare module 'views/utils/file-writer' {
  export default class FileWriter {
    write(path: string, contents: string): void
  }
}

declare module 'redux' {
  export type Reducer<State, Action> = (state: State | undefined, action: Action) => State
  export function combineReducers<State, Action>(
    reducers: { [Key in keyof State]: Reducer<State[Key], Action> },
  ): Reducer<State, Action>
}

declare module 'reselect' {
  export type Selector<State, Result> = (state: State) => Result
  export function createSelector<State, Input, Result>(
    input: Selector<State, Input>,
    result: (input: Input) => Result,
  ): Selector<State, Result>
  export function createSelector<State, First, Second, Result>(
    inputs: [Selector<State, First>, Selector<State, Second>],
    result: (first: First, second: Second) => Result,
  ): Selector<State, Result>
}

declare module 'fast-memoize' {
  export default function memoize<Arguments extends readonly unknown[], Result>(
    callback: (...args: Arguments) => Result,
  ): (...args: Arguments) => Result
}

declare module 'views/utils/selectors' {
  import { Selector } from 'reselect'

  export const constSelector: Selector<HenseiHostRootState, HenseiConstants>
  export function extensionSelectorFactory(
    key: 'poi-plugin-hensei-nikki',
  ): Selector<HenseiHostRootState, HenseiPluginState>
  export function extensionSelectorFactory(key: string): Selector<HenseiHostRootState, unknown>
  export function shipDataSelectorFactory(
    id: number | string,
  ): Selector<HenseiHostRootState, [HenseiApiShip | undefined, HenseiConstantShip | undefined]>
  export function equipDataSelectorFactory(
    id: number,
  ): Selector<HenseiHostRootState, [HenseiApiEquip, HenseiConstantEquip | undefined]>
}
