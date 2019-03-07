import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import {
  Popover,
  Position,
  PopoverInteractionKind,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { constSelector, basicSelector } from 'views/utils/selectors'
import { getDetails } from '../../utils'

const Overlay = styled.div`
  padding: 1em;
`

const __ = i18n.main.__.bind(i18n.main)

export default connect(
  createSelector([
    constSelector,
    basicSelector,
  ], ({ $ships, $equips }, basic) => (
    { $ships, $equips, lv: basic.api_level }
  ))
)(class Details extends Component {
  constructor(props) {
    super(props)
    this.state = {
      details: {},
    }
  }
  componentDidMount() {
    const { fleet, $equips, $ships, lv } = this.props
    this.getDetails(fleet, $equips, $ships, lv)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fleet !== this.props.fleet) {
      const { fleet, $equips, $ships, lv } = nextProps
      this.getDetails(fleet, $equips, $ships, lv)
    }
  }
  getDetails = (fleet, $equips, $ships, lv) => {
    const details = getDetails(fleet, $equips, $ships, lv)
    this.setState({ details })
  }
  render() {
    const { details } = this.state
    if (!details || !Object.keys(details).length) return <div></div>
    const { tyku, saku25, saku25a, saku33, saku33x3, saku33x4, soku } = details
    return (
      <div  className="details-container" style={{display: "flex", textAlign: "center"}}>
        { soku && <span style={{flex: 1}}>{__(soku)}</span> }
        <span style={{flex: 1}}>
          <Popover
            position={Position.BOTTOM}
            interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
            content={
              <Overlay id="hensei-nikki-details-FP">
                <div>{__('Minimum FP')}: {tyku.min}</div>
                <div>{__('Maximum FP')}: {tyku.max}</div>
                <div>{__('Basic FP')}: {tyku.basic}</div>
              </Overlay>
            }
          >
            <span>{__('Fighter Power')}: {tyku.max}</span>
          </Popover>
        </span>
        <span style={{flex: 1}}>
          <Popover
            position={Position.BOTTOM}
            interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
            content={
              <Overlay id="hensei-nikki-details-recon">
                {
                  !(saku33.total !== 0 && !saku33.total)
                  &&
                  <div className='recon-title'>
                    <span>{__('Formula 33')}</span>
                  </div>
                }
                {
                  !(saku33.total !== 0 && !saku33.total)
                  &&
                  <div className='recon-entry'>
                    <span className='recon-item'>× 1</span>
                    <span>{saku33.total}</span>
                  </div>
                }
                {
                  !(saku33.total !== 0 && !saku33.total)
                  &&
                  <div className='recon-entry'>
                    <span className='recon-item'>{`× 3 (6-2 & 6-3)`}</span>
                    <span>{saku33x3.total}</span>
                  </div>
                }
                {
                  !(saku33.total !== 0 && !saku33.total)
                  &&
                  <div className='recon-entry'>
                    <span className='recon-item'>{`× 4 (3-5 & 6-1)`}</span>
                    <span>{saku33x4.total}</span>
                  </div>
                }
                {
                  (
                    !(saku25.total !== 0 && !saku25.total)
                    || !(saku25a.total !== 0 && !saku25a.total)
                  )
                  &&
                  <div className='recon-title'>
                    <span>{__('Formula 2-5')}</span>
                  </div>
                }
                {
                  !(saku25a.total !== 0 && !saku25a.total)
                  &&
                  <div className='recon-entry'>
                    <span className='recon-item'>{__('Fall')}</span>
                    <span>{saku25a.total}</span>
                  </div>
                }
                {
                  !(saku25.total !== 0 && !saku25.total)
                  &&
                  <div className='recon-entry'>
                    <span className='recon-item'>{__('Legacy')}</span>
                    <span>{saku25.total}</span>
                  </div>
                }
              </Overlay>
            }
          >
            {
              (
                !(saku33.total !== 0 && !saku33.total)
                || !(saku25.total !== 0 && !saku25.total)
                || !(saku25a.total !== 0 && !saku25a.total)
              )
              &&
              <span>
                {__('LOS')}:
                {
                  !(saku33.total === 0 || !saku33.total)
                  ? saku33.total.toFixed(2)
                  : (
                    !(saku25.total !== 0 && !saku25.total)
                    ? <span>{saku25.total.toFixed(2)}({__('Legacy')})</span>
                    : <span>{saku25a.total.toFixed(2)}({__('Fall')})</span>
                  )
                }
              </span>
            }
          </Popover>
        </span>
      </div>
    )
  }
})
