import React, { Component } from 'react'
import { Tab, Tabs, TabId } from '@blueprintjs/core'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import { Fleet } from '../../utils/calc'
import Details from './details'
import Ship from './ship'

const NavTabs = styled(Tabs)`
  .bp3-tab {
    margin: 0;
    text-align: center;
    &.nav-tab-1 {
      width: 100%;
    }
    &.nav-tab-2 {
      width: 50%;
    }
    &.nav-tab-3 {
      width: 33.3%;
    }
    &.nav-tab-4 {
      width: 25%;
    }
  }
`

export interface FleetsViewProps {
  fleets?: Array<Fleet | undefined>
  code?: Fleet[]
}

interface FleetsViewState {
  selectedKey: TabId
  tabName: string[]
}

export interface FleetPanelProps {
  fleet: Fleet
}

export function FleetPanel({ fleet }: FleetPanelProps): JSX.Element {
  const ships = fleet.filter((ship): ship is NonNullable<typeof ship> => Boolean(ship && ship.id))
  return (
    <div className="fleets-container">
      <Details fleet={fleet} />
      <div className="ships-container">
        {ships.map((ship, index) => <Ship key={index} shipId={ship.id} ship={ship} />)}
      </div>
    </div>
  )
}

export default class FleetsView extends Component<FleetsViewProps, FleetsViewState> {
  constructor(props: FleetsViewProps) {
    super(props)
    this.state = {
      selectedKey: 0,
      tabName: ['I', 'II', 'III', 'IV'],
    }
  }

  componentWillReceiveProps(nextProps: FleetsViewProps): void {
    const data = this.props.fleets || this.props.code
    const nextData = nextProps.fleets || nextProps.code
    if (!isEqual(data, nextData)) this.setState({ selectedKey: 0 })
  }

  onTabSelected = (selectedKey: TabId): void => {
    if (selectedKey !== this.state.selectedKey) this.setState({ selectedKey })
  }

  render(): JSX.Element {
    const { fleets, code } = this.props
    const { tabName, selectedKey } = this.state
    const data = fleets || code || []

    if (data.length > 1 && data.some(Boolean)) {
      return (
        <NavTabs
          animate={false}
          selectedTabId={selectedKey}
          onChange={this.onTabSelected}
        >
          {data.map((fleet, index) => fleet
            ? <Tab
              id={index}
              key={index}
              title={tabName[index] || String(index + 1)}
              panel={<FleetPanel fleet={fleet} />}
              className={`nav-tab-${data.length}`}
            />
            : null)}
        </NavTabs>
      )
    }

    return <FleetPanel fleet={data[0] || []} />
  }
}
