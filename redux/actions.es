export const HENSEI_SAVE_DATA = '@@HENSEI_SAVE_DATA'
export const HENSEI_SAVE_TITLE = '@@HENSEI_SAVE_TITLE'
export const HENSEI_SAVE_TAGS = '@@HENSEI_SAVE_TAGS'
export const HENSEI_SWITCH_TOP_STATE = '@@HENSEI_SWITCH_TOP_STATE'
export const HENSEI_SWITCH_SUB_STATE = '@@HENSEI_SWITCH_SUB_STATE'

export function onSaveData(title, fleets) {
  return {
    type: HENSEI_SAVE_DATA,
    title,
    fleets,
  }
}
export function onSaveTitle(oldTitle, newTitle) {
  return {
    type: HENSEI_SAVE_TITLE,
    oldTitle,
    newTitle,
  }
}
export function onSaveTags(title, tags) {
  return {
    type: HENSEI_SAVE_TAGS,
    title,
    tags,
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
