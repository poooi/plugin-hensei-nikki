import { combineReducers } from 'redux'
import { loadData } from '../utils'

export function onSaveData(title, fleets) {
  return {
    type: '@@HENSEI_SAVE_DATA',
    title,
    fleets,
  }
}
export function onSaveTitle(oldTitle, newTitle) {
  return {
    type: '@@HENSEI_REPLACE_TITLE',
    oldTitle,
    newTitle,
  }
}
export function onSaveNote(title, note) {
  return {
    type: '@@HENSEI_REPLACE_NOTE',
    title,
    note,
  }
}

const initialState = {
  "initStatus": {
    "init": false,
  },
  "henseiData": {
    "data": {},
  }
}

function initStatusReducer(state = initialState.initStatus, action) {
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

function dataReducer(state = initialState.henseiData, action) {
  const { data } = this.state
  switch (action.type) {
  case '@@Response/kcsapi/api_get_member/require_info':
  case '@@poi-plugin-hensei-nikki@init':
    return {
      ...state,
      data: loadData(),
    }
  case '@@HENSEI_SAVE_DATA': {
    const { title, fleets } = this.action
    data[title] = fleets
    return {
      ...state,
      data,
    }
  }
  case '@@HENSEI_REPLACE_TITLE': {
    const { oldTitle, newTitle } = this.action
    data[newTitle] = data[oldTitle]
    delete data[oldTitle]
    return {
      ...state,
      data,
    }
  }
  case '@@HENSEI_REPLACE_NOTE': {
    const { title, note } = this.action
    data[title].note = note
    return {
      ...state,
      data,
    }
  }
  }
  return state
}

export const reducer = combineReducers({
  initStatus: initStatusReducer,
  henseiData: dataReducer,
})
