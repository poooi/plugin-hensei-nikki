// import { reduce, uniqBy, forEach, pick, omit } from 'lodash'

const { i18n } = window
//export const storePath = 'plugin-senka'

export * from './data'
export * from './file'
export * from './calc'
export * from './selectors'

export const __ = i18n["poi-plugin-hensei-nikki"].__.bind(i18n["poi-plugin-hensei-nikki"])
