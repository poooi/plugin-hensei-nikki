import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { constSelector } from 'views/utils/selectors'
import { FormControl, ButtonGroup, Button, OverlayTrigger, Popover } from 'react-bootstrap'
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
    const { onKeywordChange, onTitleSelected } = this

    if (!data || !showData) return <div></div>

    return (
      <div className="title-list">
        <FormControl type="text"
                     className="title-keywords"
                     value={keywords}
                     placeholder={__("Keywords")}
                     onChange={onKeywordChange} />
        <ButtonGroup vertical bsSize="xsmall" className="titles-container">
          {
            Object.keys(showData).map((title, i) => (
              <OverlayTrigger key={i} placement="right" overlay={
                <Popover id={`note-${title}`} style={{padding: 7}}>
                    <p>{ title }</p>
                    { showData[title].note ? <p>{ showData[title].note }</p> : undefined }
                </Popover>
              }>
                <Button style={{ margin: 0 }}
                        onClick={onTitleSelected.bind(this, title)}
                        className={activeTitle === title ? 'active' : ''}>
                  {title}
                </Button>
              </OverlayTrigger>
            ))
          }
        </ButtonGroup>
      </div>
    )
  }
})
