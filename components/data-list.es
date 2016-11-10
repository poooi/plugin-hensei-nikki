import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { FormControl, ButtonGroup, Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { showData } from '../redux/actions'
import { __, henseiDataSelector, dataFilter } from '../utils'

export default connect(
  createSelector([
    constSelector,
    henseiDataSelector,
  ], ({ $ships, $equips }, data) =>
  ({ $ships, $equips, data })),
  { showData }
)(class DataList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      keywords: '',
      active: '',
      showData: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.data && nextProps.data) {
      this.setState({ data: nextProps.data })
    }
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
    if (title !== this.state.active) {
      this.props.showData(title)
      this.setState({ active: title })
    }
  }
  render() {
    const { keywords, active, showData } = this.state
    const { onKeywordChange, onTitleSelected } = this

    if (!showData) return <div></div>

    return (
      <div>
        <FormControl type="text"
                     className="titles-keywords"
                     value={keywords}
                     placeholder={__("Keywords")}
                     onChange={onKeywordChange} />
        <ButtonGroup vertical bsSize="xsmall" className="titles-container">
          {
            Object.keys(showData).forEach((title, i) => (
              <OverlayTrigger key={i} placement="right" overlay={
                <Popover id={`note-${title}`} style={padding: 7}>
                    <div>{ title }</div>
                    <div>{ data[title].note }</div>
                </Popover>
              }>
                <Button style={{margin: 0}}
                        onClick={onTitleSelected.bind(this, title)}
                        className={active === title ? 'active' : ''}>
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
