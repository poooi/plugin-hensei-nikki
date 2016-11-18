import React from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { join } from 'path-extra'
import { SlotitemIcon } from 'views/components/etc/icon'
import { equipInfoSelector, shipInfoSelector } from '../../utils'

const Slot = connect(
  (state, { slotId, slot }) => equipInfoSelector(slotId, slot)
)((slotId, slot, { name, iconId, lv, alv }) => {
  const overlay = <Tooltip id="name">{ name }</Tooltip>
  return (
    <div className="slotitem-container">
      <SlotitemIcon className="slotitem-img" slotitemId={iconId} />
      <OverlayTrigger placement="top" overlay={overlay}>
        <span className="slot-name">{ name }</span>
      </OverlayTrigger>
      <span className="slot-improvment">
          &nbsp;&nbsp;{ lv ? <strong style={{color: '#45A9A5'}}>★{ lv }</strong> : ''}
          {
            alv && 1<= alv && alv <= 7
            ? <img className="alv-img" src={join(window.ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
            : ''
          }
     </span>
    </div>
  )
})

const Ship = connect(
  (state, { shipId, ship }) => shipInfoSelector(shipId, ship)
)((shipId, ship, { name, lv, type, slots }) => (
  <div className="ship-item">
    <span className="ship-name">{ name }</span>
    <div className="ship-detail">
      <span>Lv.{ lv }</span>
      <span className="ship-type">{ type }</span>
    </div>
    <div className="slot-detail">
      { slots.map((s, i) => <Slot key={i} slotId={s.id} slot={s} />) }
    </div>
  </div>
))

export default Ship
