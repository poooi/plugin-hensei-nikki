import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { join } from 'path-extra'
import { shipDataSelectorFactory, constSelector } from 'views/utils/selectors'
import { SlotitemIcon } from 'views/components/etc/icon'

const { i18n } = window

const Slot = slotId => {
  const overlay = <Tooltip id="name">{ name }</Tooltip>
  return (
    <div className="slotitem-container">
      <SlotitemIcon className="slotitem-img" slotitemId={equipIconId} />
      <OverlayTrigger placement="top" overlay={overlay}>
        <span className="slot-name">{ name }</span>
      </OverlayTrigger>
      <span className="slot-improvment">
          &nbsp;&nbsp;{ lv ? <strong style={color: '#45A9A5'}>★{ lv }</strong> : ''}
          {
            alv && 1<= alv && alv <= 7
            ? <img className="alv-img" src={join(ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
            : ''
          }
     </span>
    </div>
  )
}

const shipDetailSelector = memoize(shipId =>
  createSelector([
    shipDataSelectorFactory(shipId),
    constSelector,
  ], ([ ship, $ship ] = [], { $shipTypes }) => (
    { ship, $ship, $shipTypes }
  ))
)

export default const Ship = connect(
  (state, { shipId }) => shipDetailSelector(shipId)
)((ship, $ship, $shipTypes, shipId, _ship) => (
  <div className="ship-item">
    <span className="ship-name">{ i18n.resources.__($ship.api_name || '') }</span>
    <div className="ship-detail">
      <span>Lv.{ (ship || { api_lv: _ship.lv }).api_lv }</span>
      <span className="ship-type">
        { i18n.resources.__(($shipTypes[$ship.api_stype] || {api_name: ''}).api_name) }
      </span>
    </div>
    <div className="slot-detail">{ slots.map((slot, i) => <Slot key={i} slotId={slot.id}  />) }</div>
  </div>
))
