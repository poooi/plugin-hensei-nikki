import React, { Component } from 'react'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { filterBuffer } from '../utils'
import { titlesSelector } from '../redux/selectors'

export default connect(
  titlesSelector,
)(class TitleList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filterKey: '',
      titles: '',
      showTitles: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    const { titles, status } = nextProps
    const { _titles, _status } = this.state
    if ((titles !== _titles) || (status === 'list' && status !== _status)) {
      this.setState({
        titles,
        showTitles: titles,
      })
    }
  }
  onKeywordChange = (e) => {
    const key = e.target.value
    const matchedTitles = filterBuffer(key)
    this.setState({
      filterKey: key,
      showTitles: matchedTitles,
    })
  }
  handleClick = (title) => {
    if (title !=== this.props.activeTitle) {
      this.props.onSelectTitle(title)
    }
  }
  render() {
    return (
      <div style={{flex: '0 1', maxWidth: 80, minWidth: 50}}>
        <DropdownButton title={title} key={0} id="henseinikki-add-dropdown">
          <MenuItem eventKey='1' onSelect={@props.handleAddDataClick}>{__ 'Add'}</MenuItem>
          <MenuItem eventKey='2' onSelect={@props.handleAddDataClick}>{__ 'Import'}</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey='3' onSelect={@props.handleAddDataClick}>{__ 'Import records file'}</MenuItem>
          <MenuItem eventKey='4' onSelect={@props.handleAddDataClick}>{__ 'Export records file'}</MenuItem>
        </DropdownButton>
        <div style={flex: 1} className='titles-keywords'>
          <FormControl type='text'
                       value={@state.filterKey}
                       placeholder={__ 'Keywords'}
                       ref='keywords'
                       onChange={@handleKeyWordChange} />
        </div>
        <div>
          <ButtonGroup vertical bsSize='xsmall' className='titles-container'>
          {
            if @state.showData?
              if @state.showData.titles? and @state.showData.titles isnt []
                for title, index in @state.showData.titles
                  <OverlayTrigger key={index} placement='right' overlay={
                    <Popover id="titles">
                      <div style={padding: 7}>
                        <div>{title}</div>
                        <div>
                          {
                            if @state.showData[title].tags.length != 0
                              for tag, tagIndex in @state.showData[title].tags
                                <Label style={display: 'inline-block', margin: 5, fontSize: 14}
                                       key={tagIndex}>
                                 {tag}
                                </Label>
                          }
                        </div>
                      </div>
                    </Popover>
                  }>
                    <Button style={margin: '0px'}
                            onClick={@handleClick.bind(@, title)}
                            className={if @props.activeTitle is title then 'active' else ''}>
                      {title}
                    </Button>
                  </OverlayTrigger>
          }
          </ButtonGroup>
        </div>
      </div>
    )
  }
})
