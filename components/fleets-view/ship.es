import React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import memoize from 'fast-memoize'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { join } from 'path-extra'
import { constSelector } from 'views/utils/selectors'
import { SlotitemIcon } from 'views/components/etc/icon'

const { i18n, ROOT } = window

const slotDetailSelector = memoize(slotId =>
  createSelector([ constSelector ], ({ $equips }) => ({ $equip: $equips[slotId] }))
)

const Slot = connect(
  (state, { slotId }) => slotDetailSelector(slotId)
)(($equip, slotId, slot) => {
  const { lv, alv } = slot
  const name = i18n.resources.__(($equip || {api_name: ''}).api_name)
  const equipIconId = $equip ? $equip.api_type[3] : 0
  const overlay = <Tooltip id="name">{ name }</Tooltip>
  return (
    <div className="slotitem-container">
      <SlotitemIcon className="slotitem-img" slotitemId={equipIconId} />
      <OverlayTrigger placement="top" overlay={overlay}>
        <span className="slot-name">{ name }</span>
      </OverlayTrigger>
      <span className="slot-improvment">
          &nbsp;&nbsp;{ lv ? <strong style={{color: '#45A9A5'}}>★{ lv }</strong> : ''}
          {
            alv && 1<= alv && alv <= 7
            ? <img className="alv-img" src={join(ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
            : ''
          }
     </span>
    </div>
  )
})

const shipDetailSelector = memoize(shipId =>
  createSelector([ constSelector ], ({ $ships, $shipTypes }) =>
    ({ $ship: $ships[shipId], $shipType: $shipTypes[$ships[shipId].api_stype] })
  )
)

const Ship = connect(
  (state, { shipId }) => shipDetailSelector(shipId)
)(($ship, $shipType, shipId, ship) => (
  <div className="ship-item">
    <span className="ship-name">{ i18n.resources.__($ship.api_name || '') }</span>
    <div className="ship-detail">
      <span>Lv.{ ship.lv }</span>
      <span className="ship-type">
        { i18n.resources.__(($shipType || {api_name: ''}).api_name) }
      </span>
    </div>
    <div className="slot-detail">
      { ship.slots.map((slot, i) => <Slot key={i} slotId={slot.id} slot={slot} />) }
    </div>
  </div>
))

export default Ship
