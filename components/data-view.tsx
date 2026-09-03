import React from 'react'
import { connect } from 'react-redux'
import { Card } from '@blueprintjs/core'
import DataOpts from './data-opts'
import FleetsView from './fleets-view'
import { henseiDataSelector } from '../utils'

const DataView = connect(
  (state: any, { title }: any) => {
    const { fleets, note } = henseiDataSelector(state).data[title]

    return { fleets, note }
  }
)(({ title, fleets, note }: any) =>
  <>
    <DataOpts title={title} />
    { note && <Card>{ note }</Card> }
    <FleetsView fleets={[...fleets]} />
  </>
)

export default DataView
