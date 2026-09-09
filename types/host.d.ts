type HenseiPluginState = import('../redux').HenseiState
interface HenseiHostRootState {
  'poi-plugin-hensei-nikki': HenseiPluginState
}

interface HenseiConstantShip {
  api_name: string
  api_stype: number
  api_maxeq: number[]
}

interface HenseiConstantEquip {
  api_name: string
  api_type: number[]
  api_baku: number
  api_houk: number
  api_houm: number
  api_saku: number
  api_tyku: number
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

interface HenseiBasicInfo {
  api_level: number
}

interface Window {
  APPDATA_PATH: string
  ROOT: string
  getStore(path: string): string | number | undefined
  getStore(): HenseiHostRootState
  i18n: {
    resources: {
      fixedT?: (key: string, options: { keySeparator: boolean }) => string
      __(key: string): string
    }
    main: {
      __(key: string): string
    }
  }
  toggleModal(...messages: string[]): void
}

declare const i18n: Window['i18n']

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

declare module 'react' {
  export type Key = string | number
  export type ReactText = string | number
  export type ReactNode = ReactElement | ReactText | boolean | null | undefined | ReactNode[]
  export interface ReactElement {
    type: unknown
    props: Record<string, unknown>
    key: Key | null
  }
  export interface SyntheticEvent<T = Element> {
    currentTarget: T
    target: EventTarget
  }
  export interface CSSProperties {
    [property: string]: string | number | undefined
  }
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null
    displayName?: string
  }
  export interface ComponentClass<P = {}> {
    new (props: P): Component<P, object>
  }
  export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>
  export class Component<P = {}, S = {}> {
    readonly props: Readonly<P>
    state: Readonly<S>
    constructor(props: P)
    setState<K extends keyof S>(state: Pick<S, K> | S | null, callback?: () => void): void
    render(): ReactNode
  }
  export function createElement(
    type: unknown,
    props: Record<string, unknown> | null,
    ...children: ReactNode[]
  ): ReactElement
  export namespace JSX {
    interface Element extends ReactElement {}
    interface IntrinsicElements {
      [elementName: string]: Record<string, unknown>
    }
  }
  const React: { createElement: typeof createElement; Fragment: unknown }
  export const Fragment: unknown
  export default React
}

declare module 'react-redux' {
  import { ComponentType } from 'react'

  export function connect<TStateProps, TOwnProps = {}>(
    mapStateToProps: (state: HenseiHostRootState, ownProps: TOwnProps) => TStateProps,
  ): <Props extends TStateProps & TOwnProps>(component: ComponentType<Props>) => ComponentType<Omit<Props, keyof TStateProps>>
}

declare module '@blueprintjs/core' {
  import { ReactNode, SyntheticEvent, ComponentType } from 'react'

  export type TabId = string | number
  export interface TabsProps {
    animate?: boolean
    selectedTabId?: TabId
    onChange?: (newTabId: TabId, prevTabId: TabId, event: SyntheticEvent<HTMLElement>) => void
    children?: ReactNode
  }
  export interface TabProps {
    id: TabId
    key?: string | number
    title: ReactNode
    panel?: ReactNode
    className?: string
  }
  export const Tabs: ComponentType<TabsProps>
  export const Tab: ComponentType<TabProps>
  export interface PopoverProps {
    position?: Position
    interactionKind?: PopoverInteractionKind
    content?: ReactNode
    children?: ReactNode
  }
  export const Popover: ComponentType<PopoverProps>
  export enum Position { BOTTOM = 'bottom' }
  export enum PopoverInteractionKind { HOVER_TARGET_ONLY = 'hover-target-only' }
}

declare module 'styled-components' {
  import { ComponentType } from 'react'

  interface StyledFactory {
    <Props>(component: ComponentType<Props>): StyledTemplate<Props>
    div: (
      strings: TemplateStringsArray,
      ...interpolations: readonly unknown[]
    ) => ComponentType<Record<string, unknown>>
  }
  interface StyledTemplate<Props> {
    (
      strings: TemplateStringsArray,
      ...interpolations: readonly unknown[]
    ): ComponentType<Props>
  }
  const styled: StyledFactory
  export default styled
}

declare module 'views/components/etc/icon' {
  import { ComponentType } from 'react'

  export interface SlotitemIconProps {
    className?: string
    slotitemId: number
  }
  export const SlotitemIcon: ComponentType<SlotitemIconProps>
}

declare module 'fast-memoize' {
  export default function memoize<Arguments extends readonly unknown[], Result>(
    callback: (...args: Arguments) => Result,
  ): (...args: Arguments) => Result
}

declare module 'views/utils/selectors' {
  import { Selector } from 'reselect'

  export const constSelector: Selector<HenseiHostRootState, HenseiConstants>
  export const basicSelector: Selector<HenseiHostRootState, HenseiBasicInfo>
  export function extensionSelectorFactory(
    key: 'poi-plugin-hensei-nikki',
  ): Selector<HenseiHostRootState, HenseiPluginState>
  export function extensionSelectorFactory(key: string): Selector<HenseiHostRootState, unknown>
  export function shipDataSelectorFactory(
    id: number | string,
  ): Selector<HenseiHostRootState, [HenseiApiShip | undefined, HenseiConstantShip | undefined]>
  export function equipDataSelectorFactory(
    id: number,
  ): Selector<HenseiHostRootState, [HenseiApiEquip | undefined, HenseiConstantEquip | undefined]>
}

declare module 'lodash' {
  export function isEqual(left: unknown, right: unknown): boolean
}

declare namespace JSX {
  interface Element {
    type: unknown
    props: Record<string, unknown>
    key: string | number | null
  }
  interface IntrinsicAttributes {
    key?: string | number
  }
  interface IntrinsicElements {
    [elementName: string]: Record<string, unknown>
  }
}
