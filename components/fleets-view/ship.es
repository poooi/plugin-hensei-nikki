import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Popover,
  Position,
  PopoverInteractionKind,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { join } from 'path-extra'
import { SlotitemIcon } from 'views/components/etc/icon'
import { equipInfoSelector, shipInfoSelector } from '../../utils'

const Overlay = styled.div`
  padding: 1em;
`

const Slot = ({ slotId, slot }) => {
  const { name, iconId, lv, alv } = equipInfoSelector(slotId, slot)(window.getStore())
  return (
    <div className="slotitem-container">
      <SlotitemIcon className="slotitem-img" slotitemId={iconId} />
      <Popover
        position={Position.BOTTOM}
        interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
        content={
          <Overlay id="name">{ name }</Overlay>
        }
      >
        <span className="slot-name">{ name }</span>
      </Popover>
      {
        Boolean(lv || (alv && 1<= alv && alv <= 7))
        &&
        <span className="slot-improvment">
          {
            lv > 0
            &&
            <strong style={{color: '#45A9A5'}}>&nbsp;{ lv ? `★${lv}` : ''}</strong>
          }
          {
            alv && 1<= alv && alv <= 7
            ? <img className="alv-img" src={join(window.ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
            : ''
          }
        </span>
      }
    </div>
  )
}

const Ship = ({ shipId, ship }) => {
  const { lv, name, type, slots } = shipInfoSelector(shipId, ship)(window.getStore())
  return (
    <div className="ship-item">
      <span className="ship-name">{ name }</span>
      <div className="ship-detail">
        { lv && <span>Lv.{ lv }</span> }
        <span className="ship-type">{ type }</span>
      </div>
      <div className="slot-detail">
        { slots.map((s, i) => s === -1 ? undefined : <Slot key={i} slotId={s.id} slot={s} />) }
      </div>
    </div>
  )
}

export default Ship
