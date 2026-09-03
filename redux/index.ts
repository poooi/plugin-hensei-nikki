import { FleetsData, SavedRecord, transSavedData } from '../utils/calc'
import { loadData } from '../utils/file'

export interface HenseiState {
  data: Record<string, SavedRecord>
}

export interface RootState {
  initStatus: { init: boolean }
  henseiData: HenseiState
}

interface Action {
  type: string
  [key: string]: any
}

export function onSaveData(title: string, fleets: SavedRecord): Action {
  return { type: '@@HENSEI_SAVE_DATA', title, fleets }
}

export function onSaveTitle(oldTitle: string, newTitle: string): Action {
  return { type: '@@HENSEI_REPLACE_TITLE', oldTitle, newTitle }
}

export function onSaveNote(title: string, note: string): Action {
  return { type: '@@HENSEI_REPLACE_NOTE', title, note }
}

export function onImportData(importData: unknown): Action {
  return { type: '@@HENSEI_IMPORT_DATA', importData }
}

export function onImportFile(fileBuffer: unknown): Action {
  return { type: '@@HENSEI_IMPORT_FILE', fileBuffer }
}

export function onDeleteData(title: string): Action {
  return { type: '@@HENSEI_DELETE_DATA', title }
}

const initialState: RootState = {
  initStatus: { init: false },
  henseiData: { data: {} },
}

function initStatusReducer(state = initialState.initStatus, action: Action) {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/require_info':
    case '@@poi-plugin-hensei-nikki@init':
      return { ...state, init: true }
    default:
      return state
  }
}

function dataReducer(state = initialState.henseiData, action: Action): HenseiState {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/require_info':
    case '@@poi-plugin-hensei-nikki@init':
      return { ...state, data: loadData() }

    case '@@HENSEI_SAVE_DATA':
      return {
        ...state,
        data: { ...state.data, [action.title]: action.fleets },
      }

    case '@@HENSEI_REPLACE_TITLE': {
      const data = { ...state.data }
      data[action.newTitle] = data[action.oldTitle]
      delete data[action.oldTitle]
      return { ...state, data }
    }

    case '@@HENSEI_REPLACE_NOTE': {
      const current = state.data[action.title]
      if (!current) return state
      return {
        ...state,
        data: {
          ...state.data,
          [action.title]: { ...current, note: action.note },
        },
      }
    }

    case '@@HENSEI_IMPORT_FILE': {
      const data = { ...state.data }
      let msg: string
      const fileBuffer = action.fileBuffer
      if (!fileBuffer || typeof fileBuffer !== 'object' || Array.isArray(fileBuffer)) {
        msg = '文件内容格式错误'
      } else {
        const formattedData = transSavedData(fileBuffer as Record<string, any>)
        for (const title in formattedData) {
          const tempData = formattedData[title]
          if (!tempData) continue
          if (Object.prototype.hasOwnProperty.call(data, title)) {
            if (data[title] !== tempData) data[`${title}_1`] = tempData
          } else {
            data[title] = tempData
          }
        }
        const sum = Object.keys(data).length - Object.keys(state.data).length
        msg = sum ? `成功导入${sum}条数据` : '无可用数据'
      }
      if (msg) window.toggleModal(msg)
      return { ...state, data }
    }

    case '@@HENSEI_DELETE_DATA': {
      const data = { ...state.data }
      delete data[action.title]
      return { ...state, data }
    }

    default:
      return state
  }
}

export function reducer(state: RootState | undefined, action: Action): RootState {
  return {
    initStatus: initStatusReducer(state && state.initStatus, action),
    henseiData: dataReducer(state && state.henseiData, action),
  }
}

export type FleetRecord = FleetsData
