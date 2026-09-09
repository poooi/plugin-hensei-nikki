import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Icon } from '@blueprintjs/core'
import { __ } from '../utils'
import { onSaveData } from '../redux'
import DataPreviewModule from './data-preview-module'
import { Fleet } from '../utils/calc'

export interface ImportModuleOwnProps {
  switchState: (state: string) => void
}

interface ImportModuleDispatchProps {
  onSaveData: typeof onSaveData
}

interface ImportModuleProps extends ImportModuleOwnProps, ImportModuleDispatchProps {}

export class ImportModule extends Component<ImportModuleProps> {
  onSaveData = (title: string, note: string, data: Fleet[]): void => {
    this.props.onSaveData(title, {
      note,
      fleets: data,
      version: 'poi-h-v1',
    })
    this.onCancel()
  }

  onCancel = (): void => {
    this.props.switchState('')
  }

  render(): JSX.Element {
    return (
      <div className="import-module">
        <Button onClick={this.onCancel}><Icon icon="cross" /></Button>
        <DataPreviewModule onAddData={this.onSaveData} onCancel={this.onCancel} />
      </div>
    )
  }
}

export default connect<{}, ImportModuleOwnProps, { onSaveData: typeof onSaveData }>(
  null,
  { onSaveData },
)(ImportModule)
