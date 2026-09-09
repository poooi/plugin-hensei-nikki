import React from 'react'
import { connect } from 'react-redux'
import { Card } from '@blueprintjs/core'
import DataOpts from './data-opts'
import FleetsView from './fleets-view'
import { dataByTitleSelector } from '../utils'
import { Fleet, isSavedFleetData } from '../utils/calc'

interface DataViewOwnProps {
  title: string
}

interface DataViewStateProps {
  fleets: Array<Fleet | undefined>
  note: string
}

interface DataViewProps extends DataViewOwnProps, DataViewStateProps {}

const dataViewStateSelector = (title: string) => (state: HenseiHostRootState): DataViewStateProps => {
  const { data } = dataByTitleSelector(title)(state)
  if (!isSavedFleetData(data)) return { fleets: [], note: '' }
  return { fleets: data.fleets, note: data.note || '' }
}

export function DataView({ title, fleets, note }: DataViewProps): JSX.Element {
  return (
    <>
      <DataOpts title={title} />
      {note && <Card>{note}</Card>}
      <FleetsView fleets={[...fleets]} />
    </>
  )
}

export default connect<DataViewStateProps, DataViewOwnProps>(
  (state, { title }) => dataViewStateSelector(title)(state),
)(DataView)
