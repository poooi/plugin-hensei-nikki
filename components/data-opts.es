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

export default connect(
  '', { onDeleteData }
)(class DataOpts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: 'opts',
    }
  }
  onOptsClick = (opt) => {
    this.setState({ active: opt })
  }
  onDeleteClick = () => {
    const { onDeleteData, title } = this.props
    window.toggleModal(__('Delete'), __('Confirm?'), [{
      name: __('Delete'),
      func: () => onDeleteData(title),
    }])
    this.setState({ active: 'opts' })
  }
  render() {
    const { active } = this.state
    const { title } = this.props

    return (
      <>
        <ButtonGroupM className="data-opts" fill>
          <Button
            icon="export"
            onClick={this.onOptsClick.bind(this, 'export')}
          >
            {__('Export')}
          </Button>
          <Button
            icon="edit"
            onClick={this.onOptsClick.bind(this, 'edit')}
          >
            {__('Edit')}
          </Button>
          <Button
            icon="delete"
            onClick={this.onDeleteClick}
          >
            {__('Delete Records')}
          </Button>
        </ButtonGroupM>
        {
          active === 'export' && (
            <DataExportModule
              title={title}
              onCancel={this.onOptsClick.bind(this, 'opts')}
            />
          )
        }
        {
          active === 'edit' && (
            <DataEditModule
              title={title}
              onCancel={this.onOptsClick.bind(this, 'opts')}
            />
          )
        }
      </>
    )
  }
})
