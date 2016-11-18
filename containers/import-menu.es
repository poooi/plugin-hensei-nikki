import React, { Component } from 'react'
import { connect } from 'react-redux'
import { DropdownButton, Button, MenuItem } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { remote } from 'electron'
import fs from 'fs-extra'
import { __, henseiDataSelector } from '../utils'
import { onSaveData, onImportFile } from '../redux'
import DataPreviewModule from './data-preview-module'
import DataEditModule from './data-edit-module'

const { dialog } = remote.require('electron')

const Menu = connect(
  '', { onImportFile }
)(class Menu extends Component {
  constructor(props) {
    super(props)
  }
  onMenuSelected = (eventKey) => {
    let key
    switch (eventKey) {
      case 'importFile':
        this.onFileImportSelected()
        key = 'menu'
        break
      case 'exportFile':
        this.onFileExportSelected()
        key = 'menu'
        break
      default:
        key = eventKey
    }
    this.props.switchState(key)
  }
  onFileImportSelected = (e) => {
    const { onImportFile } = this.props
    const filename = dialog.showOpenDialog({
      title: __('Import records file'),
      filters: [{ name: "json file", extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (filename && filename[0]) {
      onImportFile(loadImportFile(filename[0]))
    } else {
      window.toggleModal("找不到该文件")
    }
  }
  onFileExportSelected = (e) => {
    const filename = dialog.showSaveDialog({
      title: __('Export records file'),
      defaultPath: "HenseiNikki.json",
    })
    let msg
    if (filename) {
      fs.writeFile(filename, JSON.stringify(this.props.data), err => {
        if (err) {
          console.log(err)
          msg = "数据导出失败"
        } else {
          msg = "数据导出成功"
        }
        window.toggleModal(msg)
      })
    }
  }
  render() {
    return (
      <DropdownButton title={<FontAwesome name="plus-square-o" />} key={0} id="henseinikki-add-dropdown">
        <MenuItem eventKey="add" onSelect={this.onMenuSelected}>{__('Add')}</MenuItem>
        <MenuItem eventKey="import" onSelect={this.onMenuSelected}>{__('Import')}</MenuItem>
        <MenuItem divider />
        <MenuItem eventKey="importFile" onSelect={this.onMenuSelected}>{__('Import records file')}</MenuItem>
        <MenuItem eventKey="exportFile" onSelect={this.onMenuSelected}>{__('Export records file')}</MenuItem>
      </DropdownButton>
    )
  }
})

const ImportModule = connect(
  '', { onSaveData }
)(class ImportModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: 'preview',
      data: '',
    }
  }
  onAddData = (data) => {
    this.setState({ data, active: 'edit' })
  }
  onSaveData = (title, note) => {
    this.props.onSaveData(title, { fleets: this.state.data, note })
  }
  onGoBack = (e) => {
    this.setState({ active: 'preview' })
  }
  onCancel = (e) => {
    this.props.switchState('menu')
  }
  reder() {
    if (this.state.active === 'preview') {
      return (
        <div className="import-module">
          <Button bsSize="small" onClick={this.onCancel}>X</Button>
          <DataPreviewModule type={active} onAddData={this.onAddData} />
        </div>
      )
    } else {
      return (
        <div className="import-module">
          <Button bsSize="small" onClick={this.onGoBack}><FontAwesome name='arrow-left' /></Button>
          <Button bsSize="small" onClick={this.onCancel}>X</Button>
          <DataEditModule onSaveData={this.onSaveData} />
        </div>
      )
    }
  }
})

// TODO: move actions to action file
export default class ImportMenu extends Component {
  constructor(props) {
    super(props)
    this.state ={
      active: 'menu',
    }
  }
  switchState = (active) => {
    if (active === this.state.active) return
    this.setState({ active })
  }
  render() {
    const { active } = this.state
    if (active === 'menu') {
      return <Menu switchState={this.switchState} />
    } else {
      return <ImportModule switchState={this.switchState} />
    }
  }
}
