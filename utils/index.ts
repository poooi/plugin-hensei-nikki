const { i18n } = window

export * from './data'
export * from './file'
export * from './record-export'
export * from './calc'
export * from './selectors'

export const __ = i18n['poi-plugin-hensei-nikki'].__.bind(i18n['poi-plugin-hensei-nikki'])
