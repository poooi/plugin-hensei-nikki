type HenseiPluginState = import('../redux').HenseiState
interface HenseiReactElement {
  type: unknown
  props: HenseiReactNode
  key: string | number | null
}
type HenseiReactNode = HenseiReactElement | string | number | boolean | null | undefined | HenseiReactNode[]

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
  api_ship_id: Identifier
  api_sakuteki: number[]
  api_soku: number
  api_maxeq: number[]
  api_slot: number[]
  api_slot_ex: number
}

interface HenseiApiEquip {
  api_level: number
  api_alv?: number
  api_slotitem_id?: Identifier
}

type Identifier = number | string

interface HenseiHostFleet {
  api_name: string
  api_ship: number[]
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
    'poi-plugin-hensei-nikki': {
      __(key: string): string
    }
    resources: {
      fixedT?: (key: string, options: { keySeparator: boolean }) => string
      __(key: string): string
    }
    main: {
      __(key: string): string
    }
  }
  toggleModal(...messages: Array<string | HenseiModalAction[]>): void
}

declare const __dirname: string

interface HenseiDialogOptions {
  title: string
  filters?: Array<{ name: string; extensions: string[] }>
  properties?: string[]
  defaultPath?: string
}

interface HenseiDialog {
  showOpenDialogSync?: (options: HenseiDialogOptions) => string[] | undefined
  showOpenDialog?: (options: HenseiDialogOptions) => string[] | undefined
  showSaveDialogSync?: (options: HenseiDialogOptions) => string | undefined
  showSaveDialog?: (options: HenseiDialogOptions) => string | undefined
}

interface HenseiModalAction {
  name: string
  func: () => void
}

declare const i18n: Window['i18n']

declare module 'fs-extra' {
  export const R_OK: number
  export function ensureDirSync(path: string): void
  export function readJSONSync(path: string): unknown
  export function accessSync(path: string, mode: number): void
}

declare module 'fs' {
  export function writeFile(
    path: string,
    contents: string,
    callback: (error: Error | null) => void,
  ): void
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
  export function createSelector<State, First, Second, Third, Result>(
    inputs: [Selector<State, First>, Selector<State, Second>, Selector<State, Third>],
    result: (first: First, second: Second, third: Third) => Result,
  ): Selector<State, Result>
}

declare module 'react' {
  export type Key = string | number
  export type ReactText = string | number
  export type ReactNode = HenseiReactNode
  export interface ReactElement {
    type: unknown
    props: ReactNode
    key: Key | null
  }
  export interface SyntheticEvent<T = Element> {
    currentTarget: T
    target: EventTarget
  }
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  export interface CSSProperties {
    [property: string]: string | number | undefined
  }
  export interface HTMLAttributes {
    id?: string
    className?: string
    rel?: string
    href?: string
    style?: CSSProperties
    children?: ReactNode
    onClick?: () => void
    value?: string
  }
  export interface ImgHTMLAttributes extends HTMLAttributes {
    alt?: string
    src?: string
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
    props: object | null,
    ...children: ReactNode[]
  ): ReactElement
  export namespace JSX {
    interface Element extends ReactElement {}
    interface IntrinsicElements {
      div: HTMLAttributes
      span: HTMLAttributes
      strong: HTMLAttributes
      img: ImgHTMLAttributes
      option: HTMLAttributes
      a: HTMLAttributes
    }
  }
  const React: { createElement: typeof createElement; Fragment: unknown }
  export const Fragment: unknown
  export default React
}

declare module 'react-redux' {
  import { ComponentType } from 'react'

  type BoundActionCreators<Creators> = {
    [Key in keyof Creators]: Creators[Key] extends (...args: infer Arguments) => unknown
      ? (...args: Arguments) => void
      : never
  }

  export function connect<TStateProps, TOwnProps = {}>(
    mapStateToProps: (state: HenseiHostRootState, ownProps: TOwnProps) => TStateProps,
  ): <Props extends TStateProps & TOwnProps>(component: ComponentType<Props>) => ComponentType<Omit<Props, keyof TStateProps>>
  export function connect<TStateProps, TOwnProps, TCreators>(
    mapStateToProps: ((state: HenseiHostRootState, ownProps: TOwnProps) => TStateProps) | null,
    mapDispatchToProps: TCreators,
  ): <Props extends TStateProps & TOwnProps & BoundActionCreators<TCreators>>(
    component: ComponentType<Props>,
  ) => ComponentType<Omit<Props, keyof TStateProps | keyof BoundActionCreators<TCreators>>>
}

declare module '@blueprintjs/core' {
  import { ReactNode, SyntheticEvent, ComponentType } from 'react'

  interface CommonProps {
    className?: string
    children?: ReactNode
  }
  export interface ButtonProps extends CommonProps {
    disabled?: boolean
    icon?: string
    rightIcon?: string
    fill?: boolean
    onClick?: () => void
  }
  export interface InputGroupProps extends CommonProps {
    id?: string
    leftIcon?: string
    placeholder?: string
    value?: string
    type?: string
    onChange?: (event: SyntheticEvent<HTMLInputElement>) => void
  }
  export interface TextAreaProps extends CommonProps {
    fill?: boolean
    id?: string
    value?: string
    onChange?: (event: SyntheticEvent<HTMLTextAreaElement>) => void
  }
  export interface CheckboxProps extends CommonProps {
    checked?: boolean
    onChange?: () => void
  }
  export interface ControlGroupProps extends CommonProps {
    fill?: boolean
  }
  export interface MenuItemProps extends CommonProps {
    text?: ReactNode
    icon?: string
    onClick?: () => void
  }
  export interface FormGroupProps extends CommonProps {
    label?: ReactNode
    labelFor?: string
  }
  export interface HTMLSelectProps extends CommonProps {
    value?: string
    onChange?: (event: SyntheticEvent<HTMLSelectElement>) => void
  }
  export const Card: ComponentType<CommonProps>
  export const Button: ComponentType<ButtonProps>
  export const ButtonGroup: ComponentType<CommonProps & { fill?: boolean }>
  export const Icon: ComponentType<{ icon: string }>
  export const FormGroup: ComponentType<FormGroupProps>
  export const InputGroup: ComponentType<InputGroupProps>
  export const TextArea: ComponentType<TextAreaProps>
  export const HTMLSelect: ComponentType<HTMLSelectProps>
  export const Checkbox: ComponentType<CheckboxProps>
  export const ControlGroup: ComponentType<ControlGroupProps>
  export const Menu: ComponentType<CommonProps>
  export const MenuItem: ComponentType<MenuItemProps>

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
  import { ComponentType, HTMLAttributes } from 'react'

  interface StyledFactory {
    <Props>(component: ComponentType<Props>): StyledTemplate<Props>
    div: StyledTemplate<HTMLAttributes>
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

declare module 'views/services/clipboard' {
  export function copyText(text: string): void
}

declare module 'electron' {
  export const dialog: HenseiDialog
  export const clipboard: {
    writeText(text: string): void
  }
  export const shell: {
    openExternal(url: string): void
  }
}

declare module 'views/create-store' {
  interface HenseiStore {
    dispatch(action: { type: string }): void
    getState(): HenseiHostRootState
    subscribe(listener: () => void): () => void
  }
  export const store: HenseiStore
}

declare module 'redux-observers' {
  import { Selector } from 'reselect'

  export function observer<State, Selection>(
    selector: Selector<State, Selection>,
    callback: (dispatch: (action: { type: string }) => void, current: Selection, previous: Selection | undefined) => void,
  ): unknown
  export function observe(store: unknown, observers: unknown[]): () => void
}

declare module 'views/utils/selectors' {
  export const fleetsSelector: (state: HenseiHostRootState) => HenseiHostFleet[]
  export const shipsSelector: (state: HenseiHostRootState) => Record<string, HenseiApiShip>
  export const equipsSelector: (state: HenseiHostRootState) => Record<string, HenseiApiEquip>
}

declare function require(moduleName: 'views/services/clipboard'): typeof import('views/services/clipboard')
declare function require(moduleName: 'electron'): typeof import('electron')

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
  export function trim(value: string): string
}

declare namespace JSX {
  interface Element extends HenseiReactElement {}
  interface IntrinsicAttributes {
    key?: string | number
  }
  interface IntrinsicElements {
    link: import('react').HTMLAttributes
    div: import('react').HTMLAttributes
    span: import('react').HTMLAttributes
    strong: import('react').HTMLAttributes
    img: import('react').ImgHTMLAttributes
    option: import('react').HTMLAttributes
    a: import('react').HTMLAttributes
  }
}
