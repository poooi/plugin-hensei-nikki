import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs, Panel } from 'react-bootstrap'
import Details from './details'
import Ship from './ship'

const Fleet = ({ fleet }) => (
  <Panel className="fleets-container">
    <Details fleet={fleet} />
    <div className="ships-container">
      { fleet.map((ship, i) => ship.id ? <Ship key={i} shipId={ship.id} ship={ship} /> : '') }
    </div>
  </Panel>
)

export default class FleetsView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedKey: 0,
      tabName: [ 'I', 'II', 'III', 'IV' ],
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fleets !== this.props.fleets) {
      this.setState({ selectedKey: 0 })
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

    if (data.length > 1 && data[1]) {
      return (
        <Tabs activeKey={selectedKey}
              onSelect={this.onTabSelected}
              animation={false}
              id="hensei-list-tabs">
          {
            data.map((fleet, i) =>
              !fleet ? '' :
              <Tab eventKey={i} title={tabName[i]} key={i}>
                <Fleet fleet={fleet} />
              </Tab>
            )
          }
        </Tabs>
      )
    } else {
      return <Fleet fleet={data[0]} />
    }
  }
}
