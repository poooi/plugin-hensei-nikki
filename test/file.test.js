const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load
let jsonOnDisk = {}
let readError
let accessError
let writeError
const writes = []
let writerCount = 0

global.window = {
  APPDATA_PATH: '/appdata',
  getStore: () => 42,
}

Module._load = function load(request, parent, isMain) {
  if (request === 'path-extra') return { join: (...parts) => parts.join('/') }
  if (request === 'views/utils/file-writer') {
    return class FileWriter {
      constructor() { writerCount += 1 }
      write(path, contents) {
        if (writeError) throw writeError
        writes.push({ path, contents })
      }
    }
  }
  if (request === 'fs-extra') return {
    R_OK: 4,
    ensureDirSync() {},
    readJSONSync() {
      if (readError) throw readError
      return jsonOnDisk
    },
    accessSync() {
      if (accessError) throw accessError
    },
  }
  return originalLoad.call(this, request, parent, isMain)
}

const { loadData, loadImportFile, saveData } = require('../utils/file.js')

test('saveData uses one account-scoped writer and preserves write order', () => {
  const first = { first: { version: 'poi-h-v1', fleets: [] } }
  const second = { second: { version: 'poi-h-v1', fleets: [] } }
  saveData(first)
  saveData(second)
  saveData({})

  assert.equal(writerCount, 1)
  assert.deepEqual(writes, [
    { path: '/appdata/hensei-nikki/42.json', contents: JSON.stringify(first) },
    { path: '/appdata/hensei-nikki/42.json', contents: JSON.stringify(second) },
  ])

  writeError = new Error('write failed')
  assert.throws(() => saveData(first), /write failed/)
  writeError = undefined
})

test('loadData converts current and legacy records while preserving failures', () => {
  jsonOnDisk = {
    current: { version: 'poi-h-v1', fleets: [] },
    legacy: { version: 1, ships: [[101, [40, -1], [], [], []]], tags: ['old'] },
  }
  readError = undefined
  const loaded = loadData()
  assert.deepEqual(loaded.current, jsonOnDisk.current)
  assert.equal(loaded.legacy.note, 'old')

  readError = new Error('read failed')
  assert.deepEqual(loadData(), {})
})

test('loadImportFile keeps valid data, normalizes non-objects, and rethrows I/O errors', () => {
  readError = undefined
  accessError = undefined
  jsonOnDisk = { version: 'poi-h-v1', fleets: [] }
  assert.deepEqual(loadImportFile('/tmp/records.json'), jsonOnDisk)

  jsonOnDisk = 'not an object'
  assert.deepEqual(loadImportFile('/tmp/records.json'), {})

  readError = new Error('parse failed')
  assert.throws(() => loadImportFile('/tmp/records.json'), /parse failed/)
  readError = undefined
  accessError = new Error('missing')
  assert.throws(() => loadImportFile('/tmp/missing.json'), /missing/)
})
