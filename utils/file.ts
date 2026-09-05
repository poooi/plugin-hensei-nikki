import { createPersistence, type Persistence, type PersistenceWriter } from './persistence'
import type { PersistenceFileSystem } from './persistence'
import type { StoredData } from './fleet-data'

export { createPersistence } from './persistence'
export type {
  Persistence,
  PersistenceFileSystem,
  PersistenceOptions,
  PersistenceWriter,
} from './persistence'

interface FileWriterConstructor {
  new (): PersistenceWriter
}

interface ModuleWithDefault {
  default: unknown
}

interface PathModule {
  join(...paths: string[]): string
}

declare function require(moduleName: string): unknown

function isModuleWithDefault(value: unknown): value is ModuleWithDefault {
  return typeof value === 'object' && value !== null && 'default' in value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFileWriterConstructor(value: unknown): value is FileWriterConstructor {
  return typeof value === 'function'
}

function isFileSystem(value: unknown): value is PersistenceFileSystem {
  return isRecord(value)
    && typeof value.R_OK === 'number'
    && typeof value.ensureDirSync === 'function'
    && typeof value.readJSONSync === 'function'
    && typeof value.accessSync === 'function'
}

function isPathModule(value: unknown): value is PathModule {
  return isRecord(value) && typeof value.join === 'function'
}

function getFileWriter(): PersistenceWriter {
  const loaded: unknown = require('views/utils/file-writer')
  const candidate = isModuleWithDefault(loaded) ? loaded.default : loaded
  if (!isFileWriterConstructor(candidate)) throw new TypeError('Expected a FileWriter constructor')
  return new candidate()
}

function getFileSystem(): PersistenceFileSystem {
  const loaded = require('fs-extra')
  if (!isFileSystem(loaded)) throw new TypeError('Expected an fs-extra file system')
  return loaded
}

function getJoin(): PathModule['join'] {
  const loaded = require('path-extra')
  if (!isPathModule(loaded)) throw new TypeError('Expected a path-extra module')
  return loaded.join
}

let defaultPersistence: Persistence | undefined

function getDefaultPersistence(): Persistence {
  if (!defaultPersistence) {
    const join = getJoin()
    const pluginPath = join(window.APPDATA_PATH, 'hensei-nikki')
    const memberId = window.getStore('info.basic.api_member_id')
    const dataPath = join(pluginPath, `${String(memberId)}.json`)
    defaultPersistence = createPersistence({
      fileSystem: getFileSystem(),
      fileWriter: getFileWriter(),
      pluginPath,
      dataPath,
    })
  }
  return defaultPersistence
}

export function saveData(data: StoredData): void {
  getDefaultPersistence().saveData(data)
}

export function loadData(): StoredData {
  return getDefaultPersistence().loadData()
}

export function loadImportFile(filename: string): unknown {
  return getDefaultPersistence().loadImportFile(filename)
}
