import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataList from '../components/data-list'
import DataView from '../components/data-view'

export default connect(

)(class DataModule extends Component {
  constructor() {

  }
  render() {
    return (
      <div>
        <DataList />
        <DataView />
      </div>
    )
  }
})
