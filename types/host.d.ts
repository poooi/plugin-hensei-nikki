declare const __dirname: string

declare function require(moduleName: string): any

interface PoiShipData {
  api_ship_id: number
  api_lv: number
  api_sakuteki: [number, ...number[]]
  api_soku: number
  api_slot: number[]
  api_slot_ex?: number
  api_name: string
  api_stype: number
  api_maxeq: number[]
}

interface PoiEquipData {
  api_slotitem_id: number
  api_level: number
  api_alv?: number
}

interface PoiStaticShipData {
  api_name: string
  api_stype: number
  api_maxeq: number[]
}

interface PoiStaticEquipData {
  api_name: string
  api_type: number[]
  api_baku: number
  api_tyku: number
  api_houk: number
  api_houm: number
  api_saku: number
}

interface Window {
  APPDATA_PATH: string
  ROOT: string
  i18n: {
    resources: {
      __: (key: string) => string
      fixedT?: (key: string, options?: { keySeparator?: boolean }) => string
    }
    [key: string]: any
  }
  getStore: <Value = any>(key?: string) => Value
  toggleModal: (...args: any[]) => void
}

declare const remote: { require: (moduleName: string) => any }
declare const i18n: { main: { __: (key: string) => string } }

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elementName: string]: any
  }
}

declare module 'react' {
  export type ReactNode = any
  export type ComponentType<Props = any> = any
  export class Component<Props = any, State = any> {
    constructor(props: Props)
    props: Readonly<Props>
    state: Readonly<State>
    setState(
      state: Partial<State> | ((state: State, props: Props) => Partial<State>),
      callback?: () => void,
    ): void
  }
  const React: { createElement: (...args: any[]) => any }
  export default React
}

declare module 'react-redux' {
  export const connect: any
}

declare module '@blueprintjs/core' {
  export const Button: any
  export const ButtonGroup: any
  export const Card: any
  export const Checkbox: any
  export const ControlGroup: any
  export const FormGroup: any
  export const HTMLSelect: any
  export const Icon: any
  export const InputGroup: any
  export const Menu: any
  export const MenuItem: any
  export const Popover: any
  export const PopoverInteractionKind: any
  export const Position: any
  export const Tab: any
  export const Tabs: any
  export const TextArea: any
}

declare module 'styled-components' {
  const styled: any
  export default styled
}

declare module 'redux' {
  export const combineReducers: any
}

declare module 'redux-observers' {
  export const observe: any
  export const observer: any
}

declare module 'reselect' {
  export const createSelector: any
}

declare module 'fast-memoize' {
  const memoize: any
  export default memoize
}

declare module 'lodash' {
  export const compact: any
  export const first: any
  export const isEmpty: any
  export const isEqual: any
  export const map: any
  export const range: any
  export const trim: any
}

declare module 'path-extra' {
  export const join: any
}

declare module 'path' {
  export const join: any
}

declare module 'fs-extra' {
  const fs: any
  export = fs
}

declare module 'fs' {
  const fs: any
  export = fs
}

declare module 'electron' {
  export const clipboard: any
  export const shell: any
}

declare module 'views/create-store' {
  export const store: any
}

declare module 'views/utils/file-writer' {
  const FileWriter: any
  export default FileWriter
}

declare module 'views/utils/selectors' {
  export const basicSelector: any
  export const constSelector: any
  export const equipDataSelectorFactory: any
  export const equipsSelector: any
  export const extensionSelectorFactory: any
  export const fleetsSelector: any
  export const shipDataSelectorFactory: any
  export const shipsSelector: any
}

declare module 'views/components/etc/icon' {
  export const SlotitemIcon: any
}

declare module 'views/services/clipboard' {
  export const copyText: (text: string) => void
}

declare module 'node:test' {
  const test: (name: string, fn: () => void | Promise<void>) => void
  export default test
}

declare module 'node:assert' {
  export const strict: {
    equal: (actual: any, expected: any) => void
    deepEqual: (actual: any, expected: any) => void
  }
}
