import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormControl, Button } from 'react-bootstrap'

export default connect(
  createSelector([
    deckSelector,
  ], deck => ({ deck })), {
    saveData
})(class DataEditModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      note: '',
    }
  }
  onTitileChange = (e) => {
    const title = e.target.value
    const { deckChecked } = this.state

    let saveDisable = !(title && title.length && includes(deckChecked, true))

    this.setState({ title })
  }
  onNoteChange = (e) => {
    const title = e.target.value
    const { deckChecked } = this.state

    let saveDisable = !(title && title.length && includes(deckChecked, true))

    this.setState({ note })
  }
  onSave = (e) => {
    const { title, note } = this.state
    const { onSaveData } = this.props
    onSaveData(title, note)
  }
  render() {
    const { fleets, type } = this.props
    const { deckChecked, title, note } = this.state

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
        <Button bsSize="small" disabled={saveDisable} nClick={this.onSave}>
          {__('Save')}
        </Button>
      </div>
    )
  }
})
