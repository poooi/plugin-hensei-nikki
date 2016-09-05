import { combineReducers } from 'redux'

const initialState = {
  "initStatus": {
    "init": false,
  },
  "henseiData": {
    data: {},
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
