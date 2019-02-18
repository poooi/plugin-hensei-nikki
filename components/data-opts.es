import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { onDeleteData } from '../redux'
import { __ } from '../utils'
// import DataEditModule from '../containers/data-edit-module'
import DataExportModule from '../containers/data-export-module'

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
    switch (active) {
    case 'export':
      return <DataExportModule title={title} onCancel={this.onOptsClick.bind(this, 'opts')} />
    case 'edit':
      // return <DataEditModule title={title} onCancel={this.onOptsClick.bind(this, 'opts')} />
    }
    return (
      <>
        <ButtonGroup className="data-opts" fill>
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
        </ButtonGroup>
        {
          active === 'edit' && (
            <></>
          )
        }
      </>
    )
  }
}
)
