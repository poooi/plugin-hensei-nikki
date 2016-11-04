import React, { Component } from 'react'
import { join } from 'path-extra'
import { store } from 'views/createStore'

import ImportModule from './containers/import-module'

export const reactClass = class HenseiNikki extends Component {
  render() {
    return (
      <div id="HenseiNikki">
        <link rel="stylesheet" href={join(__dirname , 'assets', 'hensei-nikki.css')} />
        <link rel="stylesheet" href={join(__dirname, 'assets', 'ship-item.css')} />
        <ImportModule />
        {/* <DataModule /> */}
      </div>
    )
  }
}

export function pluginDidLoad() {
  store.dispatch({ type: '@@poi-plugin-hensei-nikki@init' })
}
