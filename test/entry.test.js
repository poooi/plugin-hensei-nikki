const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load
const dispatches = []
const saved = []
const observed = []
const opened = []
const savedFiles = []
const importedFiles = []
const exportedFiles = []
let unloaded = 0

class ReactComponent {
  constructor(props) {
    this.props = props
    this.state = {}
  }

  setState(nextState, callback) {
    this.state = { ...this.state, ...nextState }
    if (callback) callback()
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: { ...(props || {}), children: children.length === 1 ? children[0] : children },
  }
}

global.window = {
  APPDATA_PATH: '/appdata',
  getStore: () => 17,
  i18n: { 'poi-plugin-hensei-nikki': { __: (value) => value } },
  toggleModal() {},
}

global.remote = {
  require: (moduleName) => {
    assert.equal(moduleName, 'electron')
    return {
      dialog: {
        showOpenDialogSync: (options) => {
          opened.push(options)
          return ['/tmp/records.json']
        },
        showSaveDialogSync: (options) => {
          savedFiles.push(options)
          return '/tmp/export.json'
        },
      },
    }
  },
}

Module._load = function load(request, parent, isMain) {
  if (request === 'react') return { Component: ReactComponent, createElement, Fragment: Symbol('fragment') }
  if (request === 'react-redux') return { connect: () => (component) => component }
  if (request === 'redux-observers') {
    return {
      observer: (selector, callback) => ({ selector, callback }),
      observe: (_store, observers) => {
        observed.push(observers[0])
        return () => { unloaded += 1 }
      },
    }
  }
  if (request === 'views/create-store') return {
    store: {
      dispatch: (action) => dispatches.push(action),
      getState: () => ({}),
      subscribe: () => () => {},
    },
  }
  if (request === 'electron') return { clipboard: {}, shell: {} }
  if (request === 'path-extra') return { join: (...parts) => parts.join('/') }
  if (request === 'styled-components') {
    const styled = () => () => null
    styled.div = () => () => null
    return styled
  }
  if (request === '@blueprintjs/core') {
    const component = () => null
    return {
      Button: component,
      Icon: component,
      Popover: component,
      Position: { BOTTOM: 'bottom' },
      Menu: component,
      MenuItem: component,
    }
  }
  if (request === './containers/import-module') return function ImportModule() {}
  if (request === './containers/data-module') return function DataModule() {}
  if (request === './utils') return {
    __: (value) => value,
    exportRecordsFile: (filename, data, onError) => exportedFiles.push({ filename, data, onError }),
    henseiDataSelector: (state) => state['poi-plugin-hensei-nikki'].henseiData,
    saveData: (data) => saved.push(data),
    loadImportFile: (filename) => {
      importedFiles.push(filename)
      return { imported: filename }
    },
  }
  if (request === '../utils/file') return {
    loadData: () => ({ loaded: { version: 'poi-h-v1', fleets: [] } }),
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

const entry = require('../index.js')
const { onImportFile } = require('../redux/index.js')

test('host entry renders the view and exercises reducer initialization plus persistence lifecycle', () => {
  const view = new entry.reactClass({})
  const initial = view.render()
  assert.equal(initial.props.children[0].props.rel, 'stylesheet')
  assert.equal(initial.props.children[3].type.name, 'DataModule')

  view.switchState('add')
  assert.equal(view.render().props.children[2].type.name, 'ImportModule')

  const options = new entry.Options({
    switchState: () => {},
    onImportFile: (fileBuffer) => dispatches.push(onImportFile(fileBuffer)),
    data: { existing: { version: 'poi-h-v1', fleets: [] } },
  })
  options.onMenuSelected('importFile')
  assert.deepEqual(opened, [{
    title: 'Import records file',
    filters: [{ name: 'json file', extensions: ['json'] }],
    properties: ['openFile'],
  }])
  assert.deepEqual(importedFiles, ['/tmp/records.json'])
  assert.deepEqual(dispatches.at(-1), {
    type: '@@HENSEI_IMPORT_FILE',
    fileBuffer: { imported: '/tmp/records.json' },
  })

  options.onMenuSelected('exportFile')
  assert.deepEqual(savedFiles, [{
    title: 'Export records file',
    defaultPath: 'HenseiNikki.json',
  }])
  assert.deepEqual(exportedFiles[0].filename, '/tmp/export.json')
  assert.deepEqual(exportedFiles[0].data, { existing: { version: 'poi-h-v1', fleets: [] } })

  const state = entry.reducer(undefined, { type: '@@poi-plugin-hensei-nikki@init' })
  assert.ok(state.henseiData.data.loaded)

  entry.pluginDidLoad()
  assert.deepEqual(dispatches.at(-1), { type: '@@poi-plugin-hensei-nikki@init' })
  observed[0].callback(() => {}, { data: { saved: { version: 'poi-h-v1', fleets: [] } } }, undefined)
  assert.deepEqual(saved, [{ saved: { version: 'poi-h-v1', fleets: [] } }])
  entry.pluginWillUnload()
  assert.equal(unloaded, 1)
})
