import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs } from 'react-bootstrap'
import { fleetsByTitleSelector } from '../../utils'
import Details from './details'
import Ship from './ship'

const Fleet = ({ fleet }) => (
  <div>
    <Details fleet={fleet} />
    <div className="ships-container">
      { fleet.map((ship, i) => <Ship key={i} shipId={ship.id} ship={ship} />) }
    </div>
  </div>
)

export default connect(
  (state, { title, code }) =>
    title ? fleetsByTitleSelector(title) : { code }
)(class FleetsView extends Component {
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
    const { fleets, code } = this.props
    const { tabName, selectedKey } = this.state
    const data = fleets || code
    if (data.length > 1 && data[1] !== undefined) {
      return (
        <Tabs activeKey={selectedKey}
              onSelect={this.onTabSelected}
              animation={false}
              id="hensei-list-tabs">
          {
            data.map((fleet, i) => {
              <Tab eventKey={i} title={tabName[i]} key={i}>
                <Fleet fleet={fleet} />
              </Tab>
            })
          }
        </Tabs>
      )
    } else {
      return <Fleet fleet={data[0]} />
    }
  }
}
)
