import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from '@blueprintjs/core'
import styled from 'styled-components'
import { onDeleteData } from '../redux'
import { __ } from '../utils'
import DataEditModule from '../containers/data-edit-module'
import DataExportModule from '../containers/data-export-module'

const ButtonGroupM = styled(ButtonGroup)`
  margin: 1em 0;
`

type ActiveOption = 'opts' | 'export' | 'edit'

export interface DataOptsProps {
  title: string
  onDeleteData: (title: string) => void
}

interface DataOptsState {
  active: ActiveOption
}

export class DataOpts extends Component<DataOptsProps, DataOptsState> {
  state: DataOptsState = { active: 'opts' }

  onOptsClick = (active: ActiveOption): void => {
    this.setState({ active })
  }

  onDeleteClick = (): void => {
    const { onDeleteData, title } = this.props
    window.toggleModal(__('Delete'), __('Confirm?'), [{
      name: __('Delete'),
      func: () => onDeleteData(title),
    }])
    this.setState({ active: 'opts' })
  }

  render(): JSX.Element {
    const { active } = this.state
    const { title } = this.props
    return (
      <>
        <ButtonGroupM className="data-opts" fill>
          <Button icon="export" onClick={() => this.onOptsClick('export')}>
            {__('Export')}
          </Button>
          <Button icon="edit" onClick={() => this.onOptsClick('edit')}>
            {__('Edit')}
          </Button>
          <Button icon="delete" onClick={this.onDeleteClick}>
            {__('Delete Records')}
          </Button>
        </ButtonGroupM>
        {active === 'export' && (
          <DataExportModule title={title} onCancel={() => this.onOptsClick('opts')} />
        )}
        {active === 'edit' && (
          <DataEditModule title={title} onCancel={() => this.onOptsClick('opts')} />
        )}
      </>
    )
  }
}

export default connect<{}, { title: string }, { onDeleteData: typeof onDeleteData }>(
  null,
  { onDeleteData },
)(DataOpts)
