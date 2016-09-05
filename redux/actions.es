
export const HENSEI_SAVE_DATA = '@@HENSEI_SAVE_DATA'
export const HENSEI_SWITCH_STATE = '@@HENSEI_SWITCH_STATE'


export function onSaveData() {
  return {
    type: HENSEI_SAVE_DATA,
  }
}

export function onSwitchState(name) {
  return {
    type: HENSEI_SWITCH_STATE,
    name,
  }
}
