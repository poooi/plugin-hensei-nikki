import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { FormControl, Button } from 'react-bootstrap'

export default connect(
  (state, { title }) =>
    createSelector([
      fleetsByTitleSelector(title),
    ], fleets => ({ note: fleets.note })),
  { saveData }
)(class DataEditModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      note: '',
      saveDisable: false,
    }
  }
  onTitileChange = (e) => {
    const title = e.target.value
    const saveDisable = this.checkChanges(title, this.state.note)
  }
  onNoteChange = (e) => {
    const note = e.target.value
    const saveDisable = this.checkChanges(this.state.title, note)
  }
  onSave = (e) => {
    const { title, note } = this.state
    const { onSaveData } = this.props
    onSaveData(title, note)
  }
  checkChanges(newTitle, newNote) {
    const { title, note } = this.props
    const saveDisable = !(newTitle === title || newNote === note)
    this.setState({ newTitle, newNote, saveDisable })
  }
  render() {
    const { fleets, type } = this.props
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
