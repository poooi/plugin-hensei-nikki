import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs } from '@blueprintjs/core'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import Details from './details'
import Ship from './ship'

const NavTabs = styled(Tabs)`
  .bp3-tab {
    margin: 0;
    text-align: center;
    &.nav-tab-1 {
      width: 100%;
    }
    &.nav-tab-2 {
      width: 50%;
    }
    &.nav-tab-3 {
      width: 33.3%;
    }
    &.nav-tab-4 {
      width: 25%;
    }
  }
`

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
        <NavTabs
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
                className={`nav-tab-${data.length}`}
              />
            )
          }
        </NavTabs>
      )
    } else {
      return <Fleet fleet={data[0]} />
    }
  }
}
