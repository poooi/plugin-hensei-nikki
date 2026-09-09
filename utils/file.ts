import * as fs from 'fs-extra'
import { join } from 'path-extra'
import FileWriter from 'views/utils/file-writer'
import { SavedDataRecords, transSavedData } from './calc'

const { APPDATA_PATH, getStore } = window
const PLUGIN_PATH = join(APPDATA_PATH, 'hensei-nikki')
const memberId = getStore('info.basic.api_member_id')
const DATA_PATH = join(PLUGIN_PATH, `${memberId}.json`)
const fileWriter = new FileWriter()

export function saveData(data: SavedDataRecords): void {
  if (!data || !Object.keys(data).length) return
  fileWriter.write(DATA_PATH, JSON.stringify(data))
}

export function loadData(): SavedDataRecords {
  let data: unknown = {}
  try {
    fs.ensureDirSync(PLUGIN_PATH)
    data = fs.readJSONSync(DATA_PATH)
    if (!(data instanceof Object)) data = {}
  } catch (error) {
    data = {}
  }
  return transSavedData(data)
}

export function loadImportFile(filename: string): unknown {
  let data: unknown
  try {
    fs.accessSync(filename, fs.R_OK)
    data = fs.readJSONSync(filename)
    if (!(data instanceof Object)) data = {}
  } catch (error) {
    data = {}
    throw error
  }
  return data
}
