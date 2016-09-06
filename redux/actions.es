
export const HENSEI_SAVE_DATA = '@@HENSEI_SAVE_DATA'
export const HENSEI_SWITCH_TOP_STATE = '@@HENSEI_SWITCH_TOP_STATE'
export const HENSEI_SWITCH_SUB_STATE = '@@HENSEI_SWITCH_SUB_STATE'

export function onSaveData() {
  return {
    type: HENSEI_SAVE_DATA,
  }
}

export function onSwitchTopState(name) {
  return {
    type: HENSEI_SWITCH_TOP_STATE,
    name,
  }
}

export function onSwitchSubState(name) {
  return {
    type: HENSEI_SWITCH_SUB_STATE,
    name,
  }
}
