import React, { Component } from 'react'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { subStateSelector, henseiDataSelector } from '../redux/selectors'

import FleetItem from './fleet-item'
import TitleEditor from './title-editor'

export default connect(
  createSelector([
    subStateSelector,
    henseiDataSelector,
  ], ({ subState }, data) => { subState, data})
)(class HenseiItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
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
        <TitleEditor data={data}
                     title={this.props.activeTitle}
                     subState={this.props.subState} />
        { tabs }
      </Tabs>
    )
  }
})
