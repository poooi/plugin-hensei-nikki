const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load
let savedFile = {}
const modalMessages = []

global.window = {
  APPDATA_PATH: '/appdata',
  getStore: () => 17,
  toggleModal: (...messages) => modalMessages.push(messages),
}

Module._load = function load(request, parent, isMain) {
  if (request === 'path-extra') return { join: (...parts) => parts.join('/') }
  if (request === 'views/utils/file-writer') return class FileWriter { write() {} }
  if (request === 'fs-extra') return {
    R_OK: 4,
    ensureDirSync() {},
    readJSONSync() { return savedFile },
    accessSync() {},
  }
  if (request === 'redux') {
    return {
      combineReducers: (reducers) => (state = {}, action) => Object.fromEntries(
        Object.entries(reducers).map(([key, reducer]) => [key, reducer(state[key], action)]),
      ),
    }
  }
  return originalLoad.call(this, request, parent, isMain)
}

const {
  reducer,
  onDeleteData,
  onImportFile,
  onSaveData,
  onSaveNote,
  onSaveTitle,
} = require('../redux/index.js')

test('state actions preserve initialization, record edits, import, and delete behavior', () => {
  savedFile = {
    loaded: { version: 'poi-h-v1', fleets: [], note: 'loaded' },
  }
  let state = reducer(undefined, { type: '@@poi-plugin-hensei-nikki@init' })
  assert.equal(state.initStatus.init, true)
  assert.deepEqual(state.henseiData.data.loaded, savedFile.loaded)

  const record = { version: 'poi-h-v1', fleets: [[{ id: 101, slots: [] }]], note: '' }
  state = reducer(state, onSaveData('main', record))
  assert.deepEqual(state.henseiData.data.main, record)

  state = reducer(state, onSaveTitle('main', 'renamed'))
  state = reducer(state, onSaveNote('renamed', 'annotated'))
  assert.equal(state.henseiData.data.main, undefined)
  assert.equal(state.henseiData.data.renamed.note, 'annotated')

  state = reducer(state, onImportFile({
    renamed: { version: 1, ships: [[202, [40, -1], [], [], []]] },
    imported: { version: 'poi-h-v1', fleets: [] },
  }))
  assert.ok(state.henseiData.data.renamed_1)
  assert.deepEqual(state.henseiData.data.imported, { version: 'poi-h-v1', fleets: [] })
  assert.deepEqual(modalMessages.at(-1), ['成功导入2条数据'])

  state = reducer(state, onDeleteData('imported'))
  assert.equal(state.henseiData.data.imported, undefined)

  reducer(state, onImportFile('not an object'))
  assert.deepEqual(modalMessages.at(-1), ['文件内容格式错误'])
})
