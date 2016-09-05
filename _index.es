import React, { Component } from 'react'
import { join } from 'path-extra'
import { store } from 'views/createStore'

import HenseiList from './containers/hensei-list'
import AddDataTab from './containers/add-data-tab'
import ImportModule from './containers/import-module'

export const reactClass = class HenseiNikki extends Component {
  render() {
    return (
      <div id='HenseiNikki' className='HenseiNikki'>
        <link rel='stylesheet' href={join(__dirname , 'assets', 'hensei-nikki.css')} />
        <link rel='stylesheet' href={join(__dirname, 'assets', 'ship-item.css')} />
        <HenseiList />
        <AddDataTab />
        <ImportModule />
      </div>
    )
  }
}

export function pluginDidLoad() {
  store.dispatch({ type: '@@poi-plugin-hensei-nikki@init' })
}
