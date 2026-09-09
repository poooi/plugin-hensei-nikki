const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load
const modalMessages = []
const copied = []

class ReactComponent {
  constructor(props) {
    this.props = props
    this.state = {}
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: { ...(props || {}), children: children.length === 1 ? children[0] : children },
  }
}

const React = {
  Component: ReactComponent,
  Fragment: Symbol('fragment'),
  createElement,
}

global.window = {
  APPDATA_PATH: '/appdata',
  ROOT: '/poi',
  getStore: () => ({}),
  i18n: {
    resources: { __: (value) => value },
    main: { __: (value) => value },
    'poi-plugin-hensei-nikki': { __: (value) => value },
  },
  toggleModal: (...messages) => modalMessages.push(messages),
}

const styled = () => () => null
styled.div = () => () => null
const blueprintComponent = () => null

function createSelector(...argumentsList) {
  const result = argumentsList.at(-1)
  const inputs = Array.isArray(argumentsList[0]) ? argumentsList[0] : argumentsList.slice(0, -1)
  return (state) => result(...inputs.map((input) => input(state)))
}

Module._load = function load(request, parent, isMain) {
  if (request === 'react') return React
  if (request === 'react-redux') return { connect: () => (component) => component }
  if (request === 'reselect') return { createSelector }
  if (request === 'fast-memoize') return (callback) => callback
  if (request === 'styled-components') return styled
  if (request === '@blueprintjs/core') return {
    Button: blueprintComponent,
    ButtonGroup: blueprintComponent,
    Card: blueprintComponent,
    FormGroup: blueprintComponent,
    HTMLSelect: blueprintComponent,
    Icon: blueprintComponent,
    InputGroup: blueprintComponent,
    Popover: blueprintComponent,
    PopoverInteractionKind: { HOVER_TARGET_ONLY: 'hover-target-only' },
    Position: { BOTTOM: 'bottom' },
    TextArea: blueprintComponent,
  }
  if (request === 'views/utils/selectors') return {
    constSelector: (state) => state.constants,
    extensionSelectorFactory: (key) => (state) => state[key],
  }
  if (request === 'views/components/etc/icon') return { SlotitemIcon: blueprintComponent }
  if (request === 'path-extra') return { join: (...parts) => parts.join('/') }
  if (request === 'fs-extra') return {
    R_OK: 4,
    ensureDirSync() {},
    readJSONSync() { return {} },
    accessSync() {},
  }
  if (request === 'views/utils/file-writer') return class FileWriter { write() {} }
  if (request === 'redux') return {
    combineReducers: (reducers) => (state = {}, action) => Object.fromEntries(
      Object.entries(reducers).map(([key, reducer]) => [key, reducer(state[key], action)]),
    ),
  }
  if (request === 'views/services/clipboard') return { copyText: (value) => copied.push(value) }
  if (request === 'electron') return {
    clipboard: { writeText: (value) => copied.push(value) },
    shell: { openExternal() {} },
  }
  return originalLoad.call(this, request, parent, isMain)
}

const { DataList } = require('../components/data-list.js')
const { DataModule } = require('../containers/data-module.js')
const { DataOpts } = require('../components/data-opts.js')
const { DataEditModule } = require('../containers/data-edit-module.js')
const { DataExportModule, exportCode } = require('../containers/data-export-module.js')

const record = (note = '') => ({
  version: 'poi-h-v1',
  fleets: [[{ id: 101, slots: [] }]],
  note,
})

test('record browsing preserves order, selection, and keyword filtering', () => {
  const data = { first: record('one'), second: record('two') }
  const selected = []
  const list = new DataList({
    activeTitle: 'first',
    onShowData: (title) => selected.push(title),
    data,
    $ships: { 101: { api_name: 'ship', api_stype: 1 } },
    $equips: {},
  })

  const module = new DataModule({ data })
  module.componentWillReceiveProps({ data })
  assert.equal(module.state.activeTitle, 'first')
  module.onShowData('second')
  assert.equal(module.state.activeTitle, 'second')

  list.onShowList()
  list.onTitleSelected('second')
  list.onKeywordChange({ currentTarget: { value: 'hip' } })
  assert.deepEqual(selected, ['second'])
  assert.deepEqual(Object.keys(list.state.showData), ['first', 'second'])
})

test('edit and delete controls dispatch concrete record actions', () => {
  const actions = []
  let cancelled = false
  const edit = new DataEditModule({
    title: 'first',
    note: 'old',
    onSaveTitle: (...values) => actions.push(['title', ...values]),
    onSaveNote: (...values) => actions.push(['note', ...values]),
    onCancel: () => { cancelled = true },
  })
  edit.onTitleChange({ currentTarget: { value: 'renamed' } })
  edit.onNoteChange({ currentTarget: { value: 'new note' } })
  edit.onSave()
  assert.deepEqual(actions, [['title', 'first', 'renamed'], ['note', 'renamed', 'new note']])
  assert.equal(cancelled, true)

  const deleted = []
  const options = new DataOpts({ title: 'renamed', onDeleteData: (title) => deleted.push(title) })
  options.onDeleteClick()
  const confirmation = modalMessages.at(-1)
  confirmation[2][0].func()
  assert.deepEqual(deleted, ['renamed'])
})

test('export preserves POI shape, third-party format, and copy result', () => {
  const data = record('private note')
  assert.equal(exportCode(data, 'poi'), JSON.stringify({ version: 'poi-h-v1', fleets: data.fleets }))
  assert.deepEqual(JSON.parse(exportCode(data, 'thirdparty')), {
    version: 4,
    f1: { s1: { id: 101, luck: -1, items: {} } },
  })

  const exported = new DataExportModule({ data, title: 'first', onCancel() {} })
  exported.onTypeSelected({ currentTarget: { value: 'thirdparty' } })
  exported.onCopy()
  assert.equal(copied.at(-1), exported.state.code)
  assert.deepEqual(modalMessages.at(-1), ['Copy', 'The code has been copied to the clipboard.'])
})
