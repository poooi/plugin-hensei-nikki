import React, { Component } from 'react'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { getImagePath } from '../utils'

const ShipItem = (data) => {
  const slots = []
  forEach(_slots, (slot, i) => {
    const overlay = <Tooltip id="name">{ name }</Tooltip>
    slots.push(
      <div key={i} className="slotitem-container">
        <img className={`img-${useSVGIcon ? 'svg' : 'img'}`}
             src={getImagePath(useSVGIcon, type)} />
        <OverlayTrigger placement="top" overlay={overlay}>
          <span className="slot-name">{ name }</span>
        </OverlayTrigger>
        <span className="slot-improvment">
            &nbsp;&nbsp;{ lv ? <strong style={color: '#45A9A5'}>★{ lv }</strong> : ''}
            {
              alv && 1<= alv && alv <= 7
              ? <img className="alv-img" src={getImagePath('air', alv)} />
              : ''
            }
       </span>
      </div>
    )
  })
  return (
    <div className="ship-item">
      <div className="ship-detail">
        <span className="ship-name">{ name }</span>
        <div className="ship-detail-group">
          <span>Lv.{ lv }</span>
          <span className="ship-type">{ type }</span>
        </div>
      </div>
      <div className="slot-detail">
        { slots }
      </div>
    </div>
  )
}
