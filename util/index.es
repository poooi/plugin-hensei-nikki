// import { reduce, uniqBy, forEach, pick, omit } from 'lodash'

const { i18n } = window
//export const storePath = 'plugin-senka'

import * as data from './data'
import * as file from './file'
import * as calc from './calc'

export default {
  __: i18n["poi-plugin-hensei-nikki"].__.bind(i18n["poi-plugin-hensei-nikki"]),
  ...data,
  ...file,
  ...calc,
}
