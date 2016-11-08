import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Tab, Tabs } from 'react-bootstrap'
import { memoize } from 'lodash'
import Details from './details'
import Ship from './ship'

const Fleet = fleet => (
  <div>
    <Details fleetId={fleetId} />
    <div className="ships-container">
      { fleet.map((ship, i) => <Ship key={i} shipId={ship.id} ship={ship} />) }
    </div>
  </div>
)

export default const FleetsView = class FleetsView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedKey: 0,
      tabName: [ 'I', 'II', 'III', 'IV' ],
    }
  }
  onTabSelected = (selectedKey) => {
    if (selectedKey !== this.state.selectedKey) {
      this.setState({ selectedKey })
    }
  }
  render() {
    const { fleets } = this.props
    const { tabName } = this.state
    if (fleets.length > 1) {
      return (
        <Tabs activeKey={selectedKey}
              onSelect={this.onTabSelected}
              animation={false}
              id="hensei-list-tabs">
          {
            fleets.map((fleet, i) => {
              <Tab eventKey={i} title={tabName[i]} key={i}>
                <Fleet fleet={fleet} />
              </Tab>
            })
          }
        </Tabs>
      )
    } else {
      return <Fleet fleet={fleets[0]} />
    }
  }
}
