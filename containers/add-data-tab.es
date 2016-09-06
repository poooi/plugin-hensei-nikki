import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Label, FormControl, ButtonGroup, OverlayTrigger, Popover, Button } from 'react-bootstrap'
import { forEach, includes } from 'lodash'

const initialState = {
  title: '',
  saveDisable: true,
  preDisable: true,
  tags: [],
  deckChecked: [false, false, false, false],
  previewShow: false,
  deck: '',
}

export default Opts = connect(
  createSelector([
    topStateSelector,
    henseiDataSelector,
  ], ({ topState }, data) => ({ topState, data })),
  { onSwitchTopState, onSwitchSubState }
)(class AddDataTab extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.topState !== this.props.topState && nextProps.topState === 'add') {
      this.setState({
        ...initialState,
      })
    }
  }
  onTitileChange = (e) => {
    const title = e.target.value
    const { deckChecked, saveDisable } = this.state

    if (title && !title.length && includes(deckChecked, true)) {
      saveDisable = false
    } else {
      saveDisable = true
    }

    this.setState({
      title,
      saveDisable,
    })
  }
  onAddTag(tag) => {
    // TODO: Mv to tags editor
    const { tags } = this.state
    if (includes(tags, tag)) {
      toggleModal(__('Error'), __('The tag is already exist.'))
    } else {
      tags.push(tag)
    }
    this.setState({
      tags,
    })
  }
  onSaveData = (e) => {
    const { deckChecked, title, tags } = this.state
    const { getDeckDetail, handleAddData } = this.props

    handleAddData(title, getDeckDetail(deckChecked, tags))

    this.setState({
      ...initialState,
    })
  }
  onShowPreview = (e) => {
    const { deckChecked, title, tags, previewShow, preDisable, saveDisable } = this.state
    const { getDeckDetail } = this.props
    if (previewShow) {
      this.setState({
        previewShow: false,
      })
    } else {
      this.setState({
        deck: getDeckDetail(deckChecked, tags),
        previewShow: true,
      })
    }
  }
  onClickChecobox = (index) => {
    const { deckChecked, title } = this.state
    deckChecked[index] = !deckChecked[index]

    let saveDisable = true
    let preDisable = true
    if (includes(deckChecked, true)) {
      preDisable = false
      if (title && title.length) {
        saveDisable = false
      }
    }
    this.setState({
      deckChecked,
      saveDisable,
      preDisable,
      showPre: false,
    })
  }
  render() {
    const { decks } = window
    const { deckChecked, title, tags, previewShow, deck } = this.state
    const d = []
    const t = []
    forEach(decks, (deck, i) => {
      d.push(
        <Checkbox key={i}
                  onChange={this.onClickChecobox.bind(this, i)}
                  checked={deckChecked[i]}>
          { deck.api_name }
        </Checkbox>
      )
    })
    forEach(tags, (tag, i) => {
      t.push(
        <Label bsSize="medium" style={margin: 5} key={i}>
          { tag }
        </Label>
      )
    })
    return (
      <div className="tab-container">
        <div className="deck-container">{ d }</div>
        <FormControl type="text"
                     label={__('Title')}
                     placeholder={__('Title')}
                     value={title}
                     ref="title"
                     onChange={this.onTitileChange} />
        <TagsInputContainer handleTagAddClick={this.onAddTag} />
        <div style={display: 'flex', padding: 5}>{ t }</div>
        <Panel collapsible expanded={previewShow}>
          <HenseiItem deckItem={deck}/>
        </Panel>
        <div style={display: 'flex'}>
          <Button bsSize="small"
                  disabled={preDisable}
                  onClick={this.onShowPreview}
                  style={width: '50%'}>
            {__('Preview')}
          </Button>
          <Button bsSize="small"
                  disabled={saveDisable}
                  onClick={this.onSaveData}
                  style={width: '50%'}>
            {__('Save')}
          </Button>
        </div>
      </div>
    )
  }
})
