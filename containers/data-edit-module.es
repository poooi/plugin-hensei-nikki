import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { FormControl, Button } from 'react-bootstrap'
import { __, fleetsByTitleSelector, saveData } from '../utils'

export default connect(
  (state, { title }) =>
    !title
    ? { note: "" }
    : createSelector([
        fleetsByTitleSelector(title),
      ], fleets => ({ note: fleets.note })),
  { saveData }
)(class DataEditModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      note: '',
      saveDisable: true,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.title !== this.props.title) {
      this.setState({
        title: nextProps.title,
        note: nextProps.note,
      })
    }
  }
  onTitileChange = (e) => {
    this.checkChanges(e.target.value, this.state.note)
  }
  onNoteChange = (e) => {
    this.checkChanges(this.state.title, e.target.value)
  }
  onSave = (e) => {
    const { title, note } = this.state
    const { onSaveData } = this.props
    onSaveData(title, note)
  }
  checkChanges(newTitle, newNote) {
    const { title, note } = this.props
    const saveDisable = (newTitle === title && newNote === note)
                        || !newTitle.length
    this.setState({
      title: newTitle,
      note: newNote,
      saveDisable,
    })
  }
  render() {
    const { saveDisable, title, note } = this.state

    return(
      <div className="data-edit-module">
        <FormControl type="text"
                     label={__('Title')}
                     placeholder={__('Title')}
                     value={title}
                     onChange={this.onTitileChange} />
        <FormControl componentClass='textarea'
                     label={__('Note')}
                     placeholder={__('Note')}
                     value={note}
                     onChange={this.onNoteChange} />
        <Button bsSize="small" disabled={saveDisable} onClick={this.onSave}>
          {__('Save')}
        </Button>
      </div>
    )
  }
})
