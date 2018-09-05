import React, { Component } from 'react'
import { observer, observe } from 'redux-observers'
import { join } from 'path-extra'
import { store } from 'views/create-store'

import { reducer } from './redux'
import { henseiDataSelector, saveData } from './utils'
import ImportMenu from './containers/import-menu'
import DataModule from './containers/data-module'

export const reactClass = class HenseiNikki extends Component {
  render() {
    return (
      <div id="HenseiNikki">
        <link rel="stylesheet" href={join(__dirname , 'assets', 'hensei-nikki.css')} />
        <link rel="stylesheet" href={join(__dirname, 'assets', 'ship-item.css')} />
        <ImportMenu />
        <DataModule />
      </div>
    )
  }
}

export { reducer }

let unsubHenseiDataObserve

export function pluginDidLoad() {

  unsubHenseiDataObserve = observe(store, [observer(
    henseiDataSelector,
    (dispatch, current, previous) => {
      if (!current.data) return
      saveData(current.data)
    }
  )])

  store.dispatch({ type: '@@poi-plugin-hensei-nikki@init' })
}

export function pluginWillUnload() {
  unsubHenseiDataObserve()
}
