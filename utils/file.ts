import fs from 'fs'
import { join } from 'path'
import { transSavedData } from './calc'

function getDataPaths() {
  const { APPDATA_PATH, getStore } = window
  const pluginPath = join(APPDATA_PATH, 'hensei-nikki')
  return {
    pluginPath,
    dataPath: join(pluginPath, `${getStore('info.basic.api_member_id')}.json`),
  }
}

export function saveData(data: Record<string, unknown>): void {
  if (!data || !Object.keys(data).length) return
  const { dataPath } = getDataPaths()
  const FileWriter = require('views/utils/file-writer').default
  new FileWriter().write(dataPath, JSON.stringify(data))
}

export function loadData(): Record<string, any> {
  const { pluginPath, dataPath } = getDataPaths()
  let data: unknown = {}
  try {
    fs.mkdirSync(pluginPath, { recursive: true })
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {}
  } catch (e) {
    data = {}
  }
  return transSavedData(data as Record<string, any>)
}

export function loadImportFile(filename: string): Record<string, any> {
  let data
  try {
    fs.accessSync(filename, fs.constants.R_OK)
    data = JSON.parse(fs.readFileSync(filename, 'utf8'))
    if (!(data instanceof Object)) data = {}
  } catch (e) {
    data = {}
    throw e
  }
  return data
}
