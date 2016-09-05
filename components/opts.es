import React, { Component } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { onSwitchState } from '../redux/actions'
import { __ } from '../utils'

export default Opts = connect(
  state => ({}),
  { onSwitchState }
)(() => {
  const title = <FontAwesome name='plus-square-o' />
  const { onSwitchState } = this.props
  return (
    <DropdownButton title={title} key={0} id="henseinikki-add-dropdown">
      <MenuItem eventKey='1' onSelect={onSwitchState.bind(this, 'add')}>{__ 'Add'}</MenuItem>
      <MenuItem eventKey='2' onSelect={onSwitchState.bind(this, 'import')}>{__ 'Import'}</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey='3' onSelect={onSwitchState.bind(this, 'importFile')}>{__ 'Import records file'}</MenuItem>
      <MenuItem eventKey='4' onSelect={onSwitchState.bind(this, 'exportFile')}>{__ 'Export records file'}</MenuItem>
    </DropdownButton>
  )
})
