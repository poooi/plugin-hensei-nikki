import fs from 'fs-extra'
import { join } from 'path-extra'
import FileWriter from 'views/utils/fileWriter'
import { transSavedData } from './calc'

const { APPDATA_PATH, getStore } = window
const PLUGIN_PATH = join(APPDATA_PATH, 'hensei-nikki')
const DATA_PATH = join(PLUGIN_PATH, `${getStore('info.basic.api_member_id')}.json`)
const fileWriter = new FileWriter()

export function saveData(data) {
  if (!data || !Object.keys(data).length) return
  fileWriter.write(DATA_PATH, JSON.stringify(data))
}

export function loadData() {
  let data = {}
  try {
    fs.ensureDirSync(PLUGIN_PATH)
    data = fs.readJSONSync(DATA_PATH)
    if (!(data instanceof Object)) data = {}
  } catch (e) {
    data = {}
  }
  return transSavedData(data)
}

export function loadImportFile(filename) {
  let data
  try {
    fs.accessSync(filename, fs.R_OK)
    data = fs.readJSONSync(filename)
    if (!(data instanceof Object)) data = {}
  } catch (e) {
    data = {}
    throw e
  }
  return data
}
