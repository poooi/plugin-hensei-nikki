import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { isEmpty, map } from 'lodash'
import { constSelector } from 'views/utils/selectors'
import {
  Card,
  Button,
  Popover,
  Position,
  InputGroup,
  PopoverInteractionKind,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { __, henseiDataSelector, dataFilter } from '../utils'

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

export default connect(
  createSelector([
    constSelector,
    henseiDataSelector,
  ], ({ $ships, $equips }, { data }) =>
  ({ $ships, $equips, data }))
)(class DataList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      keywords: '',
      showData: props.data,
      showList: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ showData: nextProps.data })
  }
  onKeywordChange = (e) => {
    const { data, $ships, $equips } = this.props
    const keywords = e.target.value
    const showData = keywords
                   ? dataFilter(keywords, data, $ships, $equips)
                   : data
    this.setState({
      keywords,
      showData,
    })
  }
  onTitleSelected = (title) => {
    if (title !== this.props.activeTitle) {
      this.props.onShowData(title)
      this.setState({ showList: false })
    }
  }
  onShowList = () => {
    this.setState({ showList: !this.state.showList })
  }
  render() {
    const { activeTitle, data } = this.props
    const { keywords, showData, showList } = this.state
    const { onTitleSelected } = this

    if (isEmpty(data) || isEmpty(showData)) return <></>

    return (
      <>
        <BlockButton
          rightIcon="caret-down"
          onClick={this.onShowList}
        >
          {activeTitle}
        </BlockButton>
        {
          showList && (
            <CardM>
              {
                Object.keys(data).length > 10 && (
                  <FilterInput
                    leftIcon="filter"
                    onChange={this.onKeywordChange}
                    placeholder={__('Keywords')}
                    value={keywords}
                  />
                )
              }
              <div>
                {
                  map(showData, ({ note }, title) => (
                    note
                      ? (
                        <Popover
                          key={title}
                          position={Position.BOTTOM}
                          interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
                          content={
                            <Overlay>{note}</Overlay>
                          }
                        >
                          <FleetTitle
                            onClick={onTitleSelected.bind(this, title)}
                            disabled={activeTitle === title}
                          >
                            {title}
                          </FleetTitle>
                        </Popover>
                      )
                    : (
                      <FleetTitle
                        key={title}
                        onClick={onTitleSelected.bind(this, title)}
                        disabled={activeTitle === title}
                      >
                        {title}
                      </FleetTitle>
                    )
                  ))
                }
              </div>
            </CardM>
          )
        }
      </>
    )
  }
})
