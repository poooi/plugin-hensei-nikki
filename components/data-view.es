import React from 'react'
import DataOpts from './data-opts'
import FleetsView from './hensei-part'

export default const DataView = ({ title }) => (
  <div>
    <DataOpts title={title} />
    <FleetsView title={title} />
  </div>
)
