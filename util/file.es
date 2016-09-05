import fs from 'fs-extra'
import { join } from 'path-extra'
import FileWriter from 'views/utils/fileWriter'

const { APPDATA_PATH, getStore } = window

const fileWriter = new FileWriter()
function getFilePath() {
  return join(APPDATA_PATH, 'hensei-nikki', `${getStore('info.basic.api_member_id')}.json`)
}
export function saveData(data) {
  fileWriter.write(
    getFilePath(),
    JSON.stringify(data)
  )
}
export function loadData() {
  let data = {}
  try {
    fs.ensureDirSync(join(APPDATA_PATH, 'hensei-nikki'))
    data = fs.readJSONSync(getFilePath())
    if (!(data instanceof Object)) {
      data = {}
    }
  } catch (e) {
    data = {}
  }
  return data
}
