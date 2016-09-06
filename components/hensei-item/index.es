import React, { Component } from 'react'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { henseiDataSelector } from '../redux/selectors'

import FleetItem from './fleet-item'

export default connect(
  henseiDataSelector
)(class HenseiItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deckId: 0,
      selectedKey: 0,
      tabs: ['I', 'II', 'III', 'IV'],
      data: {},
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.activeTitle !=== this.props.activeTitle) {
      const data = nextProps.data[nextProps.activeTitle]
      this.setState({
        selectedKey: 0,
        data,
      })
    }
  }
  onTabSelected = (selectedKey) => {
    this.setState({
      selectedKey,
    })
  }
  render() {
    const { selectedKey, tabs, data } = this.state
    const tabs = []

    forEach(data, (fleet, idx) => {
      tabs.push(
        <Tab eventKey={idx} title={tabs[idx]} key={idx}>
          <FleetItem fleet={fleet} />
        </Tab>
      )
    })

    return (
      <Tabs activeKey={selectedKey}
            onSelect={onTabSelected}
            animation={false}
            id="hensei-list-tabs">
        { tabs }
      </Tabs>
    )
  }
})
