import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { isEmpty } from 'lodash'
import { DropdownButton, MenuItem, Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { optsSelector, henseiDataSelector } from '../redux/selectors'
import { onSwitchTopState, onSwitchSubState } from '../redux/actions'
import { __ } from '../utils'

export default Opts = connect(
  createSelector([
    optsSelector,
    henseiDataSelector,
  ], (opts, data) => ({ opts, data })),
  { onSwitchTopState, onSwitchSubState }
)(() => {
  const title = <FontAwesome name="plus-square-o" />
  const { opts, data, onSwitchTopState, onSwitchSubState } = this.props
  return (
    opts.top === 'list'
    ? (
      <div className="opts">
        <Button bsSize="small"
                onClick={onSwitchTopState.bind(this, 'list')}
                className="back">
          <FontAwesome name="arrow-left" />
        </Button>
      </div>
    )
    : (
      <div className="opts">
        <DropdownButton title={title} key={0} id="henseinikki-top-dropdown">
          <MenuItem eventKey="1" onSelect={onSwitchState.bind(this, 'add')}>
            {__('Add')}
          </MenuItem>
          <MenuItem eventKey="2" onSelect={onSwitchState.bind(this, 'import')}>
            {__('Import')}
          </MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="3" onSelect={onSwitchState.bind(this, 'importFile')}>
            {__('Import records file')}
          </MenuItem>
          <MenuItem eventKey="4" onSelect={onSwitchState.bind(this, 'exportFile')}>
            {__('Export records file')}
          </MenuItem>
        </DropdownButton>
        {
          opts.sub === 'data' && !isEmpty(data)
          ? (
            <div className="sub-opts">
              <Button bsSize="small" onClick={onSwitchSubState.bind(this, 'export')}>
                <FontAwesome name="share-square-o" /> {__('Export')}
              </Button>
              <DropdownButton title={dTitle} key={0} id="henseinikki-sub-dropdown">
                <MenuItem eventKey="1" onSelect={onSwitchSubState.bind(this, 'editTag')}>
                  {__('Edit tag')}
                </MenuItem>
                <MenuItem eventKey="2" onSelect={onSwitchSubState.bind(this, 'editTitle')}>
                  {__('Edit title')}
                </MenuItem>
              </DropdownButton>
              <Button bsSize="small" onClick={onSwitchSubState.bind(this, 'delete')}>
                <FontAwesome name="trash"  /> {__('Delete Records')}
              </Button>
            </div>
          )
          : undefined
        }
      </div>
    )
  )
})
