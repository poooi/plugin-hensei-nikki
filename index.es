import React, { Component } from 'react'
import { connect } from 'react-redux'
import { observer, observe } from 'redux-observers'
import { join } from 'path-extra'
import { store } from 'views/create-store'
import {
  Icon,
  Button,
  Popover,
  Position,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import styled from 'styled-components'

import { reducer, onImportFile } from './redux'
import { __, henseiDataSelector, saveData } from './utils'
import ImportModule from './containers/import-module'
import DataModule from './containers/data-module'
import fs from 'fs'

const { dialog } = remote.require('electron')

const OptionsPop = styled(Popover)`
  position: absolute;
  top: 1em;
  left: 1em;
`

const Options = connect(
  henseiDataSelector,
  { onImportFile }
)(class Options extends Component {
  constructor(props) {
    super(props)
  }
  onMenuSelected = (eventKey) => {
    switch (eventKey) {
      case 'importFile':
        this.onFileImportSelected()
        break
      case 'exportFile':
        this.onFileExportSelected()
        break
      default:
        this.props.switchState(eventKey)
    }

  }
  onFileImportSelected = (e) => {
    const filename = dialog.showOpenDialog({
      title: __('Import records file'),
      filters: [{ name: 'json file', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (filename && filename[0]) {
      this.props.onImportFile(loadImportFile(filename[0]))
    } else if (filename && !filename[0]) {
      window.toggleModal('找不到该文件')
    }
  }
  onFileExportSelected = (e) => {
    const filename = (dialog.showSaveDialogSync ? dialog.showSaveDialogSync : dialog.showSaveDialog)({
      title: __('Export records file'),
      defaultPath: 'HenseiNikki.json',
    })
    let msg
    if (filename) {
      fs.writeFile(filename, JSON.stringify(this.props.data), err => {
        if (err) {
          console.log(err)
          msg = '数据导出失败'
        } else {
          msg = '数据导出成功'
        }
        window.toggleModal(msg)
      })
    }
  }
  render() {
    return (
      <OptionsPop
        position={Position.BOTTOM}
        content={
          <Menu>
            <MenuItem
              text={__('Add')}
              icon="add-to-artifact"
              onClick={this.onMenuSelected.bind(this, 'add')}
            />
            <MenuItem
              text={__('Import records file')}
              icon="add-to-folder"
              onClick={this.onMenuSelected.bind(this, 'importFile')}
            />
            <MenuItem
              text={__('Export records file')}
              icon="folder-shared-open"
              onClick={this.onMenuSelected.bind(this, 'exportFile')}
            />
          </Menu>
        }
      >
        <Button>
          <Icon icon="add" />
        </Button>
      </OptionsPop>
    )
  }
})

export const reactClass = class HenseiNikki extends Component {
  constructor(props) {
    super(props)
    this.state = { activeState: '' }
  }
  switchState = (state) => {
    this.setState({ activeState: state })
  }
  render() {
    const { activeState } = this.state
    return (
      <div id="HenseiNikki">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'hensei-nikki.css')} />
        {activeState !== 'add' && <Options switchState={this.switchState} />}
        {activeState === 'add' && <ImportModule switchState={this.switchState} />}
        {activeState !== 'add' && <DataModule />}
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
