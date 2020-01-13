import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Icon } from '@blueprintjs/core'
import { __ } from '../utils'
import { onSaveData } from '../redux'
import DataPreviewModule from './data-preview-module'

const ImportModule = connect(
  '', { onSaveData }
)(class ImportModule extends Component {
  onSaveData = (title, note, data) => {
    this.props.onSaveData(
      title,
      {
        note,
        fleets: data,
        version: 'poi-h-v1',
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
