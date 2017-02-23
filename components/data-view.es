import React from 'react'
import { connect } from 'react-redux'
import DataOpts from './data-opts'
import FleetsView from './fleets-view'
import { fleetsByTitleSelector, henseiDataSelector } from '../utils'

const DataView = connect(
  (state, { title }) => {
    const { fleets } = henseiDataSelector(state).data[title]
    return { fleets }
  }
)(({ title, fleets }) =>
  <div>
    <DataOpts title={title} />
    <FleetsView fleets={[...fleets]} />
  </div>
)

export default DataView
