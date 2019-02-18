import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Icon } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { remote } from 'electron'
import fs from 'fs-extra'
import { __, loadImportFile } from '../utils'
import { onSaveData } from '../redux'
import DataPreviewModule from './data-preview-module'

const ImportModule = connect(
  '', { onSaveData }
)(class ImportModule extends Component {
  onSaveData = (title, data) => {
    this.props.onSaveData(
      title,
      {
        fleets: data,
        version: 'poi-h-v2',
      },
    )
    this.onCancel()
  }
  onCancel = (e) => {
    this.props.switchState('')
  }
  render() {
    return (
      <div className="import-module">
        <Button onClick={this.onCancel}>
          <Icon icon="cross" />
        </Button>
        <DataPreviewModule
          onAddData={this.onSaveData}
          onCancel={this.onCancel}
        />
      </div>
    )
  }
})

export default ImportModule
