import React from 'react'
import DataOpts from './data-opts'
import FleetsView from './fleets-view'

const DataView = ({ title }) => (
  <div>
    <DataOpts title={title} />
    <FleetsView title={title} />
  </div>
)

export default DataView
