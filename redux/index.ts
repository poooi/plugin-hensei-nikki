import { loadData } from '../utils/file'
import { transSavedData, type SavedRecord, type StoredData } from '../utils/fleet-data'

type Reducer<State, Action> = (state: State | undefined, action: Action) => State

export const SAVE_DATA = '@@HENSEI_SAVE_DATA'
export const REPLACE_TITLE = '@@HENSEI_REPLACE_TITLE'
export const REPLACE_NOTE = '@@HENSEI_REPLACE_NOTE'
export const IMPORT_DATA = '@@HENSEI_IMPORT_DATA'
export const IMPORT_FILE = '@@HENSEI_IMPORT_FILE'
export const DELETE_DATA = '@@HENSEI_DELETE_DATA'
export const POI_INIT = '@@poi-plugin-hensei-nikki@init'
export const REQUIRE_INFO = '@@Response/kcsapi/api_get_member/require_info'

export interface SaveDataAction {
  type: typeof SAVE_DATA
  title: string
  fleets: SavedRecord
}

export interface ReplaceTitleAction {
  type: typeof REPLACE_TITLE
  oldTitle: string
  newTitle: string
}

export interface ReplaceNoteAction {
  type: typeof REPLACE_NOTE
  title: string
  note: string
}

export interface ImportDataAction {
  type: typeof IMPORT_DATA
  importData: unknown
}

export interface ImportFileAction {
  type: typeof IMPORT_FILE
  fileBuffer: unknown
}

export interface DeleteDataAction {
  type: typeof DELETE_DATA
  title: string
}

export interface InitAction {
  type: typeof POI_INIT | typeof REQUIRE_INFO
}

export type HenseiAction =
  | SaveDataAction
  | ReplaceTitleAction
  | ReplaceNoteAction
  | ImportDataAction
  | ImportFileAction
  | DeleteDataAction
  | InitAction

export interface InitStatusState {
  init: boolean
}

export interface HenseiDataState {
  data: StoredData
}

export interface PluginState {
  initStatus: InitStatusState
  henseiData: HenseiDataState
}

export interface ReducerDependencies {
  loadData: () => StoredData
  notify: (message: string) => void
}

export function onSaveData(title: string, fleets: SavedRecord): SaveDataAction {
  return { type: SAVE_DATA, title, fleets }
}

export function onSaveTitle(oldTitle: string, newTitle: string): ReplaceTitleAction {
  return { type: REPLACE_TITLE, oldTitle, newTitle }
}

export function onSaveNote(title: string, note: string): ReplaceNoteAction {
  return { type: REPLACE_NOTE, title, note }
}

export function onImportData(importData: unknown): ImportDataAction {
  return { type: IMPORT_DATA, importData }
}

export function onImportFile(fileBuffer: unknown): ImportFileAction {
  return { type: IMPORT_FILE, fileBuffer }
}

export function onDeleteData(title: string): DeleteDataAction {
  return { type: DELETE_DATA, title }
}

export const initialState: PluginState = {
  initStatus: { init: false },
  henseiData: { data: {} },
}

export const initStatusReducer: Reducer<InitStatusState, HenseiAction> = (
  state = initialState.initStatus,
  action,
): InitStatusState => {
  switch (action.type) {
    case REQUIRE_INFO:
    case POI_INIT:
      return { ...state, init: true }
    default:
      return state
  }
}

export function createDataReducer(
  dependencies: ReducerDependencies = {
    loadData,
    notify: message => window.toggleModal(message),
  },
): Reducer<HenseiDataState, HenseiAction> {
  return (state = initialState.henseiData, action): HenseiDataState => {
    const data = { ...state.data }
    switch (action.type) {
      case REQUIRE_INFO:
      case POI_INIT:
        return { ...state, data: dependencies.loadData() }
      case SAVE_DATA:
        data[action.title] = action.fleets
        return { ...state, data }
      case REPLACE_TITLE:
        data[action.newTitle] = data[action.oldTitle]
        delete data[action.oldTitle]
        return { ...state, data }
      case REPLACE_NOTE: {
        const record = data[action.title]
        if (!record) return { ...state, data }
        record.note = action.note
        return { ...state, data }
      }
      case IMPORT_FILE: {
        let message: string
        if (typeof action.fileBuffer !== 'object') {
          message = '文件内容格式错误'
        } else {
          const formattedData = transSavedData(action.fileBuffer)
          for (const title in formattedData) {
            const record = formattedData[title]
            if (Object.keys(data).includes(title)) {
              if (data[title] != record) data[`${title}_1`] = record
            } else {
              data[title] = record
            }
          }
          const added = Object.keys(data).length - Object.keys(state.data).length
          message = added ? `成功导入${added}条数据` : '无可用数据'
        }
        dependencies.notify(message)
        return { ...state, data }
      }
      case DELETE_DATA:
        delete data[action.title]
        return { ...state, data }
      default:
        return state
    }
  }
}

export const dataReducer = createDataReducer()

export const reducer = (
  state: PluginState = initialState,
  action: HenseiAction,
): PluginState => ({
  initStatus: initStatusReducer(state.initStatus, action),
  henseiData: dataReducer(state.henseiData, action),
})
