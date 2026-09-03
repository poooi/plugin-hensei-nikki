import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Icon } from '@blueprintjs/core'
import { __ } from '../utils'
import { onSaveData } from '../redux'
import DataPreviewModule from './data-preview-module'

type ImportModuleProps = any

const ImportModule = connect(
  '', { onSaveData }
)(class ImportModule extends Component {
  onSaveData = (title: string, note: string, data: any) => {
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
  onCancel = (_e?: any) => {
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
