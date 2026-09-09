import { combineReducers } from 'redux'
import { loadData } from '../utils/file'
import { SavedDataRecord, SavedDataRecords, SavedFleetData, transSavedData } from '../utils/calc'

export interface InitStatusState {
  init: boolean
}

export interface HenseiDataState {
  data: SavedDataRecords
}

export interface HenseiState {
  initStatus: InitStatusState
  henseiData: HenseiDataState
}

export interface SaveDataAction {
  type: '@@HENSEI_SAVE_DATA'
  title: string
  fleets: SavedFleetData
}

export interface ReplaceTitleAction {
  type: '@@HENSEI_REPLACE_TITLE'
  oldTitle: string
  newTitle: string
}

export interface ReplaceNoteAction {
  type: '@@HENSEI_REPLACE_NOTE'
  title: string
  note: string
}

export interface ImportDataAction {
  type: '@@HENSEI_IMPORT_DATA'
  importData: unknown
}

export interface ImportFileAction {
  type: '@@HENSEI_IMPORT_FILE'
  fileBuffer: unknown
}

export interface DeleteDataAction {
  type: '@@HENSEI_DELETE_DATA'
  title: string
}

export type HenseiAction =
  | { type: '@@Response/kcsapi/api_get_member/require_info' }
  | { type: '@@poi-plugin-hensei-nikki@init' }
  | SaveDataAction
  | ReplaceTitleAction
  | ReplaceNoteAction
  | ImportDataAction
  | ImportFileAction
  | DeleteDataAction

export const initialState: HenseiState = {
  initStatus: {
    init: false,
  },
  henseiData: {
    data: {},
  },
}

export function onSaveData(title: string, fleets: SavedFleetData): SaveDataAction {
  return {
    type: '@@HENSEI_SAVE_DATA',
    title,
    fleets,
  }
}

export function onSaveTitle(oldTitle: string, newTitle: string): ReplaceTitleAction {
  return {
    type: '@@HENSEI_REPLACE_TITLE',
    oldTitle,
    newTitle,
  }
}

export function onSaveNote(title: string, note: string): ReplaceNoteAction {
  return {
    type: '@@HENSEI_REPLACE_NOTE',
    title,
    note,
  }
}

export function onImportData(importData: unknown): ImportDataAction {
  return {
    type: '@@HENSEI_IMPORT_DATA',
    importData,
  }
}

export function onImportFile(fileBuffer: unknown): ImportFileAction {
  return {
    type: '@@HENSEI_IMPORT_FILE',
    fileBuffer,
  }
}

export function onDeleteData(title: string): DeleteDataAction {
  return {
    type: '@@HENSEI_DELETE_DATA',
    title,
  }
}

function initStatusReducer(
  state: InitStatusState = initialState.initStatus,
  action: HenseiAction,
): InitStatusState {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/require_info':
    case '@@poi-plugin-hensei-nikki@init':
      return {
        ...state,
        init: true,
      }
  }
  return state
}

function dataReducer(
  state: HenseiDataState = initialState.henseiData,
  action: HenseiAction,
): HenseiDataState {
  const data: SavedDataRecords = { ...state.data }
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/require_info':
    case '@@poi-plugin-hensei-nikki@init':
      return {
        ...state,
        data: loadData(),
      }
    case '@@HENSEI_SAVE_DATA':
      data[action.title] = action.fleets
      return {
        ...state,
        data,
      }
    case '@@HENSEI_REPLACE_TITLE':
      data[action.newTitle] = data[action.oldTitle]
      delete data[action.oldTitle]
      return {
        ...state,
        data,
      }
    case '@@HENSEI_REPLACE_NOTE':
      data[action.title].note = action.note
      return {
        ...state,
        data,
      }
    case '@@HENSEI_IMPORT_FILE': {
      let msg: string
      if (!(typeof action.fileBuffer === 'object')) {
        msg = '文件内容格式错误'
      } else {
        const formattedData = transSavedData(action.fileBuffer)
        for (const title in formattedData) {
          const tempData: SavedDataRecord | undefined = formattedData[title]
          if (!tempData) continue
          if (Object.keys(data).includes(title)) {
            if (data[title] != tempData) {
              data[`${title}_1`] = tempData
            }
          } else {
            data[title] = tempData
          }
        }
        const sum = Object.keys(data).length - Object.keys(state.data).length
        msg = sum ? `成功导入${sum}条数据` : '无可用数据'
      }
      window.toggleModal(msg)
      return {
        ...state,
        data,
      }
    }
    case '@@HENSEI_DELETE_DATA':
      delete data[action.title]
      return {
        ...state,
        data,
      }
  }
  return state
}

export const reducer = combineReducers<HenseiState, HenseiAction>({
  initStatus: initStatusReducer,
  henseiData: dataReducer,
})
