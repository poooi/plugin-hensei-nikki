import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import {
  Card,
  Icon,
  Button,
  FormGroup,
  TextArea,
} from '@blueprintjs/core'
import { FormControl, Button, Well } from 'react-bootstrap'
import { __, fleetsByTitleSelector } from '../utils'
import { onSaveTitle, onSaveNote } from '../redux'

const CardM = styled(Card)`
  margin: 1em 0;
`

export default connect(
  (state, { title }) =>
    !title
    ? { note: "" }
    : createSelector([
        fleetsByTitleSelector(title),
      ], fleets => ({ note: fleets.note })),
  { onSaveTitle, onSaveNote }
)(class DataEditModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      note: '',
      saveDisable: true,
    }
  }
  componentDidMount() {
    const { title, note } = this.props
    this.setState({ title, note })
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
    const { onSaveTitle, onSaveNote, onCancel, type, onSaveData } = this.props
    if ([ 'add', 'import' ].includes(type)) {
      onSaveData(title, note)
    } else {
      if (this.props.title !== title) onSaveTitle(this.props.title, title)
      if (this.props.note !== note) onSaveNote(title, note)
    }
    onCancel()
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
      <CardM>
        <Button onClick={this.props.onCancel}>
          <Icon icon="cross" />
        </Button>
        <label>{__('Title')}</label>
        <InputGroup
          value={title}
          onChange={this.onTitileChange}
          placeholder={__('Title')}
        />
        <label>{__('Note')}</label>
        <TextArea
          onChange={this.onNoteChange}
          value={note}
        />
        <Button disabled={saveDisable} onClick={this.onSave}>
          {__('Save')}
        </Button>
      </CardM>
    )
  }
})
