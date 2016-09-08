import { combineReducers } from 'redux'
import { loadData } fron '../utils'
import {
  HENSEI_SWITCH_TOP_STATE,
  HENSEI_SWITCH_SUB_STATE,
} from './actions'

const initialState = {
  "initStatus": {
    "init": false,
  },
  "henseiData": {
    "data": {},
  },
  "opts": {
    "top": "list",
    "sub": "data",
  },
}

function initStatusReducer(state = initialState.initStatus, action) {
  switch (action.type) {
  case '@@Response/kcsapi/api_get_member/require_info':
  case '@@poi-plugin-senka-calc@init':
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
  case '@@poi-plugin-senka-calc@init':
    return {
      ...state,
      data: loadData(),
    }
  case HENSEI_SAVE_DATA: {
    const { title, fleets } = this.action
    data[title] = fleets
    return {
      ...state,
      data,
    }
  }
  case HENSEI_SAVE_TITLE: {
    const { oldTitle, newTitle } = this.action
    data[newTitle] = data[oldTitle]
    delete data[oldTitle]
    return {
      ...state,
      data,
    }
  }
  case HENSEI_SAVE_TAGS: {
    const { title, tags } = this.action
    data[title].tags = tags
    return {
      ...state,
      data,
    }
  }
  }
  return state
}

function optsReducer(state = initStatusSelector.opts, action) {
  switch (action.type) {
  case HENSEI_SWITCH_TOP_STATE:
    return {
      ...state,
      top: action.name,
    }
  case HENSEI_SWITCH_SUB_STATE:
    return {
      ...state,
      sub: action.name,
    }
  }
  return state
}
