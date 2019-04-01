import React, { Component } from 'react'
import { connect } from 'react-redux'
import { first, isEmpty } from 'lodash'
import DataList from '../components/data-list'
import DataView from '../components/data-view'
import { henseiDataSelector } from '../utils'

export default connect(
  henseiDataSelector
)(class DataModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTitle: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    const { data } = nextProps
    if (!data) return
    const { activeTitle } = this.state
    if (activeTitle && !data[activeTitle]) {
      this.setState({ activeTitle: '' })
    }
    if (!activeTitle && !isEmpty(data)) {
      this.setState({ activeTitle: first(Object.keys(data)) })
    }
  }
  onShowData = (title) => {
    this.setState({ activeTitle: title })
  }
  render() {
    const { activeTitle } = this.state

    return (
      <div className="hensei-list">
        <DataList onShowData={this.onShowData} activeTitle={activeTitle} />
        { activeTitle && <DataView title={activeTitle} /> }
      </div>
    )
  }
})
