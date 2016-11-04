import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { remote } from 'electron'
import { _ } from '../utils'
import DataPreviewModule from './data-preview-module'
import DataEditModule from './data-edit-module'

const { dialog } = remote.require('electron')

// TODO: move actions to action file
export default class ImportModule extends Component {
  constructor(props) {
    super(props)
    this.state ={
      active: 'preview',
      type: 'none',
      data: ''
    }
  }
  onMenuSelected = eventKey => {
    if (eventKey === 'importFile') {
      onFileImportSelected()
    } else if (eventKey === 'exportFile') {
      onFileExportSelected()
    }
    this.setState({ active: eventKey })
  }
  onFileImportSelected = () => {
    const saveData =  []
    let sum = 0
    const filename = dialog.showOpenDialog({
      title: __('Import records file'),
      filters: [{ name: "json file", extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (filename && filename[0]) {
      try {
        fs.accessSync(filename[0], fs.R_OK)
        const fileContentBuffer = fs.readJSONSync(filename[0])
        for (let title in fileContentBuffer) {
          if (Object.keys(saveData).includes(title)) continue
          saveData[title] = fileContentBuffer[title]
          sum += 1
        }
      } catch (e) {
        console.log(e.message)
        throw e
      }
    }
    // TODO: showModal if sum > 0 success import sum
  }
  onFileExportSelected = () => {
    const filename = dialog.showSaveDialog({
      title: __('Export records file'),
      defaultPath: "HenseiNikki.json",
    })
    if (filename) {
      fs.writeFile(filename, JSON.stringify(saveData), err => {
        if (err) console.log(err)
      }
    }
  }
  onGoBack = (e) => {
    this.setState({ active: 'preview' })
  }
  onCancel = (e) => {
    this.setState({ type: 'none', active: 'preview' })
  }
  onAddData = (data) => {
    this.setState({ data, active: 'edit' })
  }
  onSaveData = (title, note) => {
    this.props.saveData(title, note, data)
  }
  render() {
    const { active } = this.state
    if ([ 'add', 'import' ].includes(active)) {
      const activePre = active === 'preview'
      return(
        <div className="import-module">
          {
            !activePre
            ? <Button bsSize="small" onClick={this.onGoBack}><FontAwesome name='arrow-left' /></Button>
            : ''
          }
          <Button bsSize="small" onClick={this.onCancel}>X</Button>
          <DataPreviewModule type={active} onAddData={this.onAddData} show={activePre} />
          <DataEditModule onSaveData={this.onSaveData} show={!activePre} />
        </div>
      )
    } else {
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
  }
}
