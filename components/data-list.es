import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { constSelector } from 'views/utils/selectors'
import {
  Button,
  Popover,
  Position,
  InputGroup,
  PopoverInteractionKind,
} from '@blueprintjs/core'
// import { FormControl, ButtonGroup, Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { __, henseiDataSelector, dataFilter } from '../utils'

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
    }
  }
  render() {
    const { activeTitle, data } = this.props
    const { keywords, showData } = this.state
    const { onTitleSelected } = this

    if (!Object.keys(data).length || !Object.keys(showData).length) return <></>

    return (
      <Popover
        className="title-selector"
        position={Position.BOTTOM}
        content={
          <div className="title-container">
            {
              Object.keys(showData).length > 10 && (
                <InputGroup
                  leftIcon="filter"
                  onChange={this.onKeywordChange}
                  placeholder={__('Keywords')}
                  value={keywords}
                />
              )
            }
            <div>
              {
                Object.keys(showData).map((title, i) => (
                  showData[title].note
                    ? (
                      <Popover
                        key={i}
                        position={Position.BOTTOM}
                        interactionKind={PopoverInteractionKind}
                        content={
                          <div>{showData[title].note}</div>
                        }
                      >
                        <Button
                          onClick={onTitleSelected.bind(this, title)}
                          disabled={activeTitle === title}
                        >
                          {title}
                        </Button>
                      </Popover>
                    )
                  : (
                    <Button
                      key={i}
                      onClick={onTitleSelected.bind(this, title)}
                      disabled={activeTitle === title}
                    >
                      {title}
                    </Button>
                  )
                ))
              }
            </div>
          </div>
        }
      >
        <Button
          className="selected-title"
          rightIcon="caret-down"
        >
          { activeTitle }
        </Button>
      </Popover>
    )
  }
})
