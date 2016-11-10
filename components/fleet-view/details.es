import React, { Component } from 'react'
import { connect } from 'react-redux'
import { constSelector } from 'views/utils/selectors'
import { getDetails, basicSelector, constDataSelector, fleetsByTitleSelector } from '../../utils'

export default connect(
  (state, { title }) =>
    createSelector([
      constSelector,
      fleetsByTitleSelector(title),
      basicSelector
    ], ({ $ships, $equips }, fleets, basic) => (
      { $ships, $equips, fleets, lv: basic.api_level }
    ))
)(class Details extends Component {
  constructor(props) {
    super(props)
    this.state = {
      details: {}
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.title !== this.props.title) {
      const { fleets, $equips, $ships, lv } = nextProps
      const details = getDetails(fleets, $equips, $ships, lv)
      this.setState({ details })
    }
  }
  render() {
    const { details } = this.state
    if (!details || !Object.keys(details).length) return <div></div>
    const { tyku, saku25, saku25a, saku33 } = details
    return (
      <div style={{display: "flex"}}>
        <span style={{flex: 1}}>{__('Total Lv')}. {totalLv}</span>
        <span style={{flex: 1}}>
          <OverlayTrigger placement='bottom' overlay={
            <Tooltip id={`topalert-FP-fleet-${fleetId}`}>
              <span>{__('Minimum FP')}: {tyku.min} {__('Maximum FP')}: {tyku.max}</span>
            </Tooltip>
          }>
            <span>{__('Fighter Power')}: {tyku.max}</span>
          </OverlayTrigger>
        </span>
        <span style={{flex: 1}}>
          <OverlayTrigger placement='bottom' overlay={
            <Tooltip id={`topalert-recon-fleet-${fleetId}`}>
              <div>{__('2-5 fall formula')}: {saku25a.ship} + {saku25a.item} - {saku25a.teitoku} = {saku25a.total}</div>
              <div>{__('2-5 old formula')}: {saku25.ship} + {saku25.recon} + {saku25.radar} = {saku25.total}</div>
              <div>{__('Formula 33')}: {saku33.total}</div>
            </Tooltip>
          }>
            <span>{__('LOS')}: {saku33.total.toFixed(2)}</span>
          </OverlayTrigger>
        </span>
      </div>
    )
  }
})
