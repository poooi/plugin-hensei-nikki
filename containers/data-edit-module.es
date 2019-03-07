import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import {
  Card,
  Icon,
  Button,
  FormGroup,
  InputGroup,
  TextArea,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { __, dataByTitleSelector } from '../utils'
import { onSaveTitle, onSaveNote } from '../redux'

const CardM = styled(Card)`
  margin: 1em 0;
`

const ButtonM = styled(Button)`
  margin-bottom: 1em;
`

export default connect(
  (state, { title }) =>
    !title
    ? { note: '' }
    : createSelector([
        dataByTitleSelector(title),
      ], ({ data }) => ({ note: data.note })),
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
        <ButtonM onClick={this.props.onCancel}>
          <Icon icon="cross" />
        </ButtonM>
        <FormGroup label={__('Title')} labelFor="title-input">
          <InputGroup
            id="title-input"
            value={title}
            onChange={this.onTitileChange}
            placeholder={__('Title')}
          />
        </FormGroup>
        <FormGroup label={__('Note')} labelFor="note-input">
          <TextArea
            fill
            id="note-input"
            onChange={this.onNoteChange}
            value={note}
          />
        </FormGroup>
        <Button disabled={saveDisable} onClick={this.onSave}>
          {__('Save')}
        </Button>
      </CardM>
    )
  }
})
