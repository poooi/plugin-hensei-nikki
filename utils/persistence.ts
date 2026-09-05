import { transSavedData, type StoredData } from './fleet-data'

export interface PersistenceFileSystem {
  readonly R_OK: number
  ensureDirSync(path: string): void
  readJSONSync(path: string): unknown
  accessSync(path: string, mode: number): void
}

export interface PersistenceWriter {
  write(path: string, content: string): void
}

export interface Persistence {
  saveData(data: StoredData): void
  loadData(): StoredData
  loadImportFile(filename: string): unknown
}

export interface PersistenceOptions {
  fileSystem: PersistenceFileSystem
  fileWriter: PersistenceWriter
  pluginPath: string
  dataPath: string
}

export function createPersistence(options: PersistenceOptions): Persistence {
  const { fileSystem, fileWriter, pluginPath, dataPath } = options

  return {
    saveData(data: StoredData): void {
      if (!Object.keys(data).length) return
      fileWriter.write(dataPath, JSON.stringify(data))
    },

    loadData(): StoredData {
      let data: unknown = {}
      try {
        fileSystem.ensureDirSync(pluginPath)
        data = fileSystem.readJSONSync(dataPath)
      } catch (error) {
        data = {}
      }
      return transSavedData(data)
    },

    loadImportFile(filename: string): unknown {
      fileSystem.accessSync(filename, fileSystem.R_OK)
      const data = fileSystem.readJSONSync(filename)
      return typeof data === 'object' && data !== null ? data : {}
    },
  }
}
