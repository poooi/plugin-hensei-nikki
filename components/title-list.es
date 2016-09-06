import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Label, FormControl, ButtonGroup, OverlayTrigger, Popover, Button } from 'react-bootstrap'
import { forEach } from 'lodash'
import { filterBuffer, __ } from '../utils'
import { henseiDataSelector } from '../redux/selectors'

export default connect(
  henseiDataSelector,
)(class TitleList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filterKey: '',
      data: {},
      showTitles: [],
    }
  }
  componentWillReceiveProps(nextProps) {
    const { data, topState } = nextProps
    const { _data, _topState } = this.state
    if ((data !== _data) || (status === 'list' && topState !== _topState)) {
      const showTitles = Object.keys(data)
      this.setState({
        data,
        showTitles,
      })
    }
  }
  onKeywordChange = (e) => {
    const key = e.target.value
    const matchedTitles = filterBuffer(key, this.state.data)
    this.setState({
      filterKey: key,
      showTitles: matchedTitles,
    })
  }
  onTitileClick = (title) => {
    if (title !=== this.props.activeTitle) {
      this.props.onSelectTitle(title)
    }
  }
  render() {
    const { filterKey, showTitles, data } = this.state
    const { activeTitle } = this.props
    const titles = []

    forEach(showTitles, (title, idx) => {

      const tags = []
      forEach(data[title].tags, (tag, i) => {
        tags.push(<Label className="tag" key={i}>{ tag }</Label>)
      })

      const overlay = <Popover id="titles" title={title}>{ tags }</Popover>
      titles.push(
        <OverlayTrigger key={idx} placement="right" overlay={overlay}>
          <Button onClick={this.onTitileClick.bind(this, title)}
                  className={activeTitle === title ? 'active' : ''}>
            { title }
          </Button>
        </OverlayTrigger>
      )

    })

    return (
      <div className="title-list">
        <FormControl type="text"
                     value={filterKey}
                     placeholder={__('Keywords')}
                     ref="keywords"
                     className="title-keywords"
                     onChange={this.onKeywordChange} />
        <ButtonGroup vertical bsSize="xsmall" className="titles-container">
        { showTitles.length ? titles : undefined }
        </ButtonGroup>
      </div>
    )
  }
})
