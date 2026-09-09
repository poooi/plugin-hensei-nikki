import React from 'react'
import { Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import styled from 'styled-components'
import { join } from 'path-extra'
import { SlotitemIcon } from 'views/components/etc/icon'
import { equipInfoSelector, shipInfoSelector, EquipInfo, ShipInfo } from '../../utils/selectors'
import { FleetShip, Identifier, Slot } from '../../utils/calc'

const Overlay = styled.div`
  padding: 1em;
`

export interface SlotProps {
  slotId: Identifier
  slot: Slot | Identifier
}

export function SlotItem({ slotId, slot }: SlotProps): JSX.Element {
  const { name, iconId, lv, alv }: EquipInfo = equipInfoSelector(slotId, slot)(window.getStore())
  const hasImprovement = Boolean(lv || (alv !== null && alv !== undefined && alv >= 1 && alv <= 7))
  return (
    <div className="slotitem-container">
      <SlotitemIcon className="slotitem-img" slotitemId={iconId} />
      <Popover
        position={Position.BOTTOM}
        interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
        content={<Overlay id="name">{name}</Overlay>}
      >
        <span className="slot-name">{name}</span>
      </Popover>
      {hasImprovement && (
        <span className="slot-improvment">
          {typeof lv === 'number' && lv > 0 && (
            <strong style={{ color: '#45A9A5' }}>&nbsp;★{lv}</strong>
          )}
          {alv !== null && alv !== undefined && alv >= 1 && alv <= 7
            ? <img className="alv-img" alt="" src={join(window.ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
            : null}
        </span>
      )}
    </div>
  )
}

export interface ShipProps {
  shipId: Identifier
  ship: FleetShip
}

export default function Ship({ shipId, ship }: ShipProps): JSX.Element {
  const { lv, name, type, slots }: ShipInfo = shipInfoSelector(shipId, ship)(window.getStore())
  return (
    <div className="ship-item">
      <span className="ship-name">{name}</span>
      <div className="ship-detail">
        {typeof lv === 'number' && <span>Lv.{lv}</span>}
        <span className="ship-type">{type}</span>
      </div>
      <div className="slot-detail">
        {slots.map((slot, index) => {
          if (slot === -1) return null
          const slotId = typeof slot === 'object' ? slot.id : slot
          return <SlotItem key={index} slotId={slotId} slot={slot} />
        })}
      </div>
    </div>
  )
}
