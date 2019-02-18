import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs } from '@blueprintjs/core'
import { isEqual } from 'lodash'
import Details from './details'
import Ship from './ship'

const Fleet = ({ fleet }) => (
  <div className="fleets-container">
    <Details fleet={fleet} />
    <div className="ships-container">
      { fleet.map((ship, i) => ship.id ? <Ship key={i} shipId={ship.id} ship={ship} /> : '') }
    </div>
  </div>
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
    const data = this.props.fleets || this.props.code
    const nextData = nextProps.fleets || nextProps.code
    if (!isEqual(data, nextData)) {
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
        <Tabs
          animate={false}
          selectedTabId={selectedKey}
          onChange={this.onTabSelected}
        >
          {
            data.map((fleet, i) =>
              !fleet ? '' :
              <Tab
                id={i}
                key={i}
                title={tabName[i]}
                panel={<Fleet fleet={fleet} />}
              />
            )
          }
        </Tabs>
      )
    } else {
      return <Fleet fleet={data[0]} />
    }
  }
}
