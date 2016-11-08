import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataOpts from './data-opts'
import FleetsView from './hensei-part'

export default connect(

)(class DataView extends Component {
  constructor() {

  }
  render() {
    return (
      <div>
        <DataOpts />
        <FleetsView />
      </div>
    )
  }
})
