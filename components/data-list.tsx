import React, { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import {
  Button,
  Card,
  InputGroup,
  Popover,
  Position,
  PopoverInteractionKind,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { constSelector } from 'views/utils/selectors'
import { __, dataFilter, henseiDataSelector } from '../utils'
import { isSavedFleetData, SavedDataRecords } from '../utils/calc'

const BlockButton = styled(Button)`
  display: block;
  position: relative;
  width: calc(100% - 3em);
  margin-left: 3em;
  text-align: center;
  .bp3-icon {
    position: absolute;
    top: .5em;
    right: 1em;
  }
`

const Overlay = styled.div`
  padding: 1em;
`

const FilterInput = styled(InputGroup)`
  margin-bottom: 1em;
`

const FleetTitle = styled(Button)`
  margin: .5em 1em .5em 0;
`

const CardM = styled(Card)`
  margin-top: 1em;
`

export interface DataListOwnProps {
  activeTitle: string
  onShowData: (title: string) => void
}

interface DataListStateProps {
  $ships: HenseiConstants['$ships']
  $equips: HenseiConstants['$equips']
  data: SavedDataRecords
}

interface DataListProps extends DataListOwnProps, DataListStateProps {}

interface DataListState {
  keywords: string
  showData: SavedDataRecords
  showList: boolean
}

const dataListStateSelector = createSelector(
  [constSelector, henseiDataSelector],
  ({ $ships, $equips }, { data }): DataListStateProps => ({
    $ships,
    $equips,
    data: data || {},
  }),
)

export class DataList extends Component<DataListProps, DataListState> {
  constructor(props: DataListProps) {
    super(props)
    this.state = {
      keywords: '',
      showData: props.data,
      showList: false,
    }
  }

  componentWillReceiveProps(nextProps: DataListProps): void {
    this.setState({ showData: nextProps.data })
  }

  onKeywordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { data, $ships, $equips } = this.props
    const keywords = event.currentTarget.value
    const showData = keywords ? dataFilter(keywords, data, $ships, $equips) : data
    this.setState({ keywords, showData })
  }

  onTitleSelected = (title: string): void => {
    if (title !== this.props.activeTitle) {
      this.props.onShowData(title)
      this.setState({ showList: false })
    }
  }

  onShowList = (): void => {
    this.setState({ showList: !this.state.showList })
  }

  render(): JSX.Element {
    const { activeTitle, data } = this.props
    const { keywords, showData, showList } = this.state

    if (!Object.keys(data).length || !Object.keys(showData).length) return <></>

    return (
      <>
        <BlockButton rightIcon="caret-down" onClick={this.onShowList}>
          {activeTitle}
        </BlockButton>
        {showList && (
          <CardM>
            {Object.keys(data).length > 10 && (
              <FilterInput
                leftIcon="filter"
                onChange={this.onKeywordChange}
                placeholder={__('Keywords')}
                value={keywords}
              />
            )}
            <div>
              {Object.entries(showData).map(([title, record]) => {
                const note = isSavedFleetData(record) ? record.note : undefined
                const titleButton = (
                  <FleetTitle
                    onClick={() => this.onTitleSelected(title)}
                    disabled={activeTitle === title}
                  >
                    {title}
                  </FleetTitle>
                )
                return note ? (
                  <Popover
                    key={title}
                    position={Position.BOTTOM}
                    interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
                    content={<Overlay>{note}</Overlay>}
                  >
                    {titleButton}
                  </Popover>
                ) : titleButton
              })}
            </div>
          </CardM>
        )}
      </>
    )
  }
}

export default connect(dataListStateSelector)(DataList)
