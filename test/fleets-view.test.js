const assert = require('node:assert/strict')
const test = require('node:test')
const Module = require('node:module')

const originalLoad = Module._load
const ReactComponent = class {
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
  ROOT: '/poi',
  getStore: () => ({}),
  i18n: { main: { __: (value) => value } },
}

const Tabs = () => null
const Tab = () => null
const Popover = () => null
const styled = () => () => null
styled.div = () => () => null

Module._load = function load(request, parent, isMain) {
  if (request === 'react') return React
  if (request === 'fast-memoize') return (callback) => callback
  if (request === 'react-redux') return { connect: () => (component) => component }
  if (request === 'reselect') return { createSelector: (...args) => (state) => args.at(-1)(...args.slice(0, -1).map((selector) => selector(state))) }
  if (request === '@blueprintjs/core') return {
    Popover,
    Position: { BOTTOM: 'bottom' },
    PopoverInteractionKind: { HOVER_TARGET_ONLY: 'hover-target-only' },
    Tab,
    Tabs,
  }
  if (request === 'styled-components') return styled
  if (request === 'path-extra') return { join: (...parts) => parts.join('/') }
  if (request === 'views/components/etc/icon') return { SlotitemIcon: () => null }
  if (request === 'views/utils/selectors') return {
    constSelector: (state) => state.constants,
    basicSelector: (state) => state.basic,
    extensionSelectorFactory: () => () => ({}),
    shipDataSelectorFactory: () => () => [undefined, undefined],
    equipDataSelectorFactory: () => () => [undefined, undefined],
  }
  return originalLoad.call(this, request, parent, isMain)
}

const { FleetPanel, default: FleetsView } = require('../components/fleets-view/index.js')
const { SlotItem } = require('../components/fleets-view/ship.js')
const { getLosDisplay } = require('../components/fleets-view/details.js')

function fleet(shipId = 101) {
  return [{ id: shipId, lv: 40, slots: [] }]
}

test('fleet presentation keeps valid ships while accepting empty and partial fleets', () => {
  const populated = FleetPanel({ fleet: [undefined, ...fleet()] })
  const shipsContainer = populated.props.children[1]
  assert.equal(shipsContainer.props.children.length, 1)

  const empty = FleetPanel({ fleet: [] })
  assert.deepEqual(empty.props.children[1].props.children, [])

  const allZero = FleetPanel({ fleet: fleet(0) })
  assert.deepEqual(allZero.props.children[1].props.children, [])
})

test('fleet tabs preserve selection and expose each non-empty fleet', () => {
  const view = new FleetsView({ fleets: [fleet(), undefined, fleet(202)] })
  const tabs = view.render()
  assert.notEqual(tabs.type, FleetPanel)
  assert.equal(tabs.props.selectedTabId, 0)
  assert.equal(tabs.props.children.filter(Boolean).length, 2)

  view.onTabSelected(2)
  assert.equal(view.render().props.selectedTabId, 2)
})

test('LOS keeps calculated zero distinct from unavailable values', () => {
  const formula = { total: 0 }
  assert.deepEqual(getLosDisplay({ saku33: formula, saku25: { total: 20 }, saku25a: { total: 30 } }), {
    value: 0,
    source: 'formula33',
  })
  assert.deepEqual(getLosDisplay({ saku33: { total: undefined }, saku25: { total: 20 }, saku25a: { total: 30 } }), {
    value: 20,
    source: 'legacy',
  })
  assert.equal(getLosDisplay({ saku33: { total: undefined }, saku25: { total: undefined }, saku25a: { total: undefined } }), undefined)
})

test('seaplane proficiency keeps the host icon relationship and zero level', () => {
  const previousStore = window.getStore
  const previousLoad = Module._load
  window.getStore = () => ({})
  Module._load = function load(request, parent, isMain) {
    if (request === '../../utils/selectors') return {
      equipInfoSelector: () => () => ({ name: 'seaplane', iconId: 42, lv: 0, alv: 3 }),
      shipInfoSelector: () => () => ({ name: 'ship', type: 'seaplane tender', lv: 0, slots: [] }),
    }
    return previousLoad.call(this, request, parent, isMain)
  }
  delete require.cache[require.resolve('../components/fleets-view/ship.js')]
  const { SlotItem: slotItem } = require('../components/fleets-view/ship.js')
  const rendered = slotItem({ slotId: 42, slot: { id: 42, lv: 0, alv: 3 } })
  const improvement = rendered.props.children[2]
  assert.equal(improvement.props.children[1].props.src, '/poi/assets/img/airplane/alv3.png')
  window.getStore = previousStore
  Module._load = previousLoad
})
