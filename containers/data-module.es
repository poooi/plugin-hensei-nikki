import React, { Component } from 'react'
import DataList from '../components/data-list'
import DataView from '../components/data-view'

export default class DataModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTitle: '',
    }
  }
  onShowData = (title) => {
    this.setState({ activeTitle: title })
  }
  render() {
    const { activeTitle } = this.state
    return (
      <div>
        <DataList onShowData={this.onShowData} activeTitle={activeTitle} />
        <DataView title={activeTitle} />
      </div>
    )
  }
})
