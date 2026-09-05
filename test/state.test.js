const assert = require('node:assert/strict')
const test = require('node:test')
const {
  DELETE_DATA,
  POI_INIT,
  dataReducer,
  initStatusReducer,
  onDeleteData,
  onImportFile,
  onSaveData,
  onSaveNote,
  onSaveTitle,
  createDataReducer,
} = require('../.quality/redux/index.js')
const { createPersistence } = require('../.quality/utils/persistence.js')

const record = (note = '') => ({
  version: 'poi-h-v1',
  fleets: [[{
    id: 100,
    lv: 40,
    slots: [],
  }]],
  note,
})

test('initializes both status and saved data from the loader', () => {
  const loaded = { loaded: record('loaded') }
  const reducer = createDataReducer({
    loadData: () => loaded,
    notify: () => undefined,
  })
  assert.deepEqual(initStatusReducer(undefined, { type: POI_INIT }), { init: true })
  assert.deepEqual(reducer(undefined, { type: POI_INIT }), { data: loaded })
})

test('adds, renames, edits notes, and deletes records through typed actions', () => {
  let state = dataReducer(undefined, onSaveData('first', record()))
  assert.deepEqual(state.data.first, record())

  state = dataReducer(state, onSaveTitle('first', 'renamed'))
  state = dataReducer(state, onSaveNote('renamed', 'updated'))
  assert.equal(state.data.first, undefined)
  assert.equal(state.data.renamed.note, 'updated')

  state = dataReducer(state, onDeleteData('renamed'))
  assert.deepEqual(state, { data: {} })
  assert.equal(DELETE_DATA, '@@HENSEI_DELETE_DATA')
})

test('imports current records and preserves duplicate naming and notification', () => {
  const messages = []
  const reducer = createDataReducer({
    loadData: () => ({}),
    notify: message => messages.push(message),
  })
  const current = record('current')
  const importedCurrent = record('imported')
  const state = reducer({ data: { current } }, onImportFile({
    current: importedCurrent,
    fresh: record('fresh'),
  }))

  assert.equal(state.data.current, current)
  assert.equal(state.data.current_1, importedCurrent)
  assert.equal(state.data.fresh.note, 'fresh')
  assert.deepEqual(messages, ['成功导入2条数据'])
})

test('imports legacy records after narrowing the file value', () => {
  const reducer = createDataReducer({
    loadData: () => ({}),
    notify: () => undefined,
  })
  const oldShip = ['100', [40, -1], [1], [4], [7]]
  const state = reducer(undefined, onImportFile({
    legacy: { version: 1, ships: [[oldShip]], tags: ['legacy'] },
  }))

  assert.deepEqual(state.data.legacy, {
    version: 'poi-h-v1',
    note: 'legacy',
    fleets: [[{
      id: '100',
      lv: 40,
      slots: [{ id: 1, lv: 4, alv: 7 }],
    }]],
  })
})

test('persists after conversion and keeps save/load ordering', () => {
  const events = []
  const stored = {
    saved: {
      version: 1,
      ships: [[['100', [40, -1], [1], [4], [7]]]],
      tags: ['from disk'],
    },
  }
  const fileSystem = {
    R_OK: 4,
    ensureDirSync: path => events.push(['ensure', path]),
    readJSONSync: path => {
      events.push(['read', path])
      return stored
    },
    accessSync: (path, mode) => events.push(['access', path, mode]),
  }
  const writes = []
  const persistence = createPersistence({
    fileSystem,
    fileWriter: { write: (path, content) => writes.push([path, content]) },
    pluginPath: '/plugin',
    dataPath: '/plugin/member.json',
  })

  persistence.saveData({ saved: record('saved') })
  assert.deepEqual(writes, [['/plugin/member.json', JSON.stringify({ saved: record('saved') })]])
  assert.deepEqual(persistence.loadData().saved.note, 'from disk')
  assert.deepEqual(events.slice(0, 2), [['ensure', '/plugin'], ['read', '/plugin/member.json']])
  assert.deepEqual(persistence.loadImportFile('/import.json'), stored)
  assert.deepEqual(events[2], ['access', '/import.json', 4])
})
