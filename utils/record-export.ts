import * as fs from 'fs'
import { SavedDataRecords } from './calc'

export type RecordExportResult = '数据导出成功' | '数据导出失败'

export function exportRecordsFile(
  filename: string,
  data: SavedDataRecords,
  onResult: (result: RecordExportResult) => void,
): void {
  fs.writeFile(filename, JSON.stringify(data), (error: Error | null) => {
    if (error) {
      onResult('数据导出失败')
      return
    }
    onResult('数据导出成功')
  })
}
