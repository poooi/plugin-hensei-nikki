import React, { Component } from 'react'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { __ } from '../utils'

import ShipItem from './ship-item'

const FleetItem = (data) => {

  const ships = []
  forEach(_ships, (ship, idx) => {
    ships.push(<ShipItem ship={ship} key={idx}/>)
  })

  return (
    <div className="titles-container">
      <div className="details-container">
        <span>{__('Total Lv')}{totalLv}</span>
        {
          fpBasic
          ? (
            <div>
              <OverlayTrigger placement='bottom' overlay={
                <Tooltip id='fp-basic'>
                  <div>{__('Basic FP')}: {fpBasic}</div>
                  <div>{__('Rank bonuses')}: {fpAlv}</div>
                </Tooltip>
              }>
                <span>{__('Fighter Power ')}{fpTotal}</span>
              </OverlayTrigger>
            </div>
          )
          : <span>{__('Fighter Power ')}{fpTotal}</span>
        }
        {
          los
          ? (
            <OverlayTrigger placement='bottom' overlay={
              <Tooltip id='los'>
                <div>{losA}{__(' Autumn')}</div>
                <div>{los}{__(' Old')}</div>
                { los33 ? <div>{los33}{__(' 33')}</div> : undefined }
              </Tooltip>
            }>
            {
              los33
              ? <span>{__('LOS ')}: {los33}</span>
              : <span>{__('LOS ')}: {losA}</span>
            }
            </OverlayTrigger>
          )
          : undefined
        }
      </div>
      <div className='ships-container'>{ ships }</div>
    </div>
  )
}
