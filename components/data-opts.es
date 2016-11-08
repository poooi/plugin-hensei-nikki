import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { optsSelector, henseiDataSelector } from '../redux/selectors'
import { __ } from '../utils'

import DataEditModule from '../containers/data-edit-module'
import DataExportModule from '../containers/data-export-module'

export default connect(

)(class DataOpts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: 'opts'
    }
  }
  onOptsClick = (opt) => {
    this.setState({ active: opt })
  }
  onDeleteClick = () => {
    // TODO: toggleModal
    this.setState({ active: 'opts' })
  }
  render() {
    const { active } = this.state
    const { opts, data, onSwitchTopState, onSwitchSubState } = this.props
    switch (active) {
    case 'export':
      return <DataExportModule />
    case 'edit':
      return <DataEditModule />
    }
    return (
      <div className="data-opts">
        <Button bsSize="small" onClick={this.onOptsClick.bind(this, 'export')}>
          <FontAwesome name="share-square-o" /> {__('Export')}
        </Button>
        <Button bsSize="small" onClick={this.onOptsClick.bind(this, 'edit')}>
          <FontAwesome name="plus-square-o" /> {__('Edit')}
        </Button>
        <Button bsSize="small" onClick={this.onDeleteClick}>
          <FontAwesome name="trash"  /> {__('Delete Records')}
        </Button>
      </div>
    )
  }
})
