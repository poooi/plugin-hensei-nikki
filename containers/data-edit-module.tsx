import React, { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  FormGroup,
  Icon,
  InputGroup,
  TextArea,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { onSaveNote, onSaveTitle } from '../redux'
import { __, dataByTitleSelector } from '../utils'
import { isSavedFleetData } from '../utils/calc'

const CardM = styled(Card)`
  margin: 1em 0;
`

const ButtonM = styled(Button)`
  margin-bottom: 1em;
`

export interface DataEditOwnProps {
  title: string
  onCancel: () => void
}

interface DataEditStateProps {
  note: string
}

interface DataEditDispatchProps {
  onSaveTitle: typeof onSaveTitle
  onSaveNote: typeof onSaveNote
}

interface DataEditProps extends DataEditOwnProps, DataEditStateProps, DataEditDispatchProps {}

interface DataEditState {
  title: string
  note: string
  saveDisable: boolean
}

const dataEditStateSelector = (title: string) => (state: HenseiHostRootState): DataEditStateProps => {
  const { data } = dataByTitleSelector(title)(state)
  return { note: isSavedFleetData(data) ? data.note || '' : '' }
}

export class DataEditModule extends Component<DataEditProps, DataEditState> {
  constructor(props: DataEditProps) {
    super(props)
    this.state = {
      title: props.title,
      note: props.note,
      saveDisable: true,
    }
  }

  componentWillReceiveProps(nextProps: DataEditProps): void {
    if (nextProps.title !== this.props.title) {
      this.setState({
        title: nextProps.title,
        note: nextProps.note,
        saveDisable: true,
      })
    }
  }

  onTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.checkChanges(event.currentTarget.value, this.state.note)
  }

  onNoteChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    this.checkChanges(this.state.title, event.currentTarget.value)
  }

  onSave = (): void => {
    const { title, note } = this.state
    const { onSaveTitle, onSaveNote, onCancel } = this.props
    if (this.props.title !== title) onSaveTitle(this.props.title, title)
    if (this.props.note !== note) onSaveNote(title, note)
    onCancel()
  }

  checkChanges(title: string, note: string): void {
    const saveDisable = (title === this.props.title && note === this.props.note) || !title.length
    this.setState({ title, note, saveDisable })
  }

  render(): JSX.Element {
    const { saveDisable, title, note } = this.state
    return (
      <CardM>
        <ButtonM onClick={this.props.onCancel}>
          <Icon icon="cross" />
        </ButtonM>
        <FormGroup label={__('Title')} labelFor="title-input">
          <InputGroup
            id="title-input"
            value={title}
            onChange={this.onTitleChange}
            placeholder={__('Title')}
          />
        </FormGroup>
        <FormGroup label={__('Note')} labelFor="note-input">
          <TextArea fill id="note-input" onChange={this.onNoteChange} value={note} />
        </FormGroup>
        <Button disabled={saveDisable} onClick={this.onSave}>
          {__('Save')}
        </Button>
      </CardM>
    )
  }
}

export default connect<DataEditStateProps, DataEditOwnProps, {
  onSaveTitle: typeof onSaveTitle
  onSaveNote: typeof onSaveNote
}>(
  (state, { title }) => dataEditStateSelector(title)(state),
  { onSaveTitle, onSaveNote },
)(DataEditModule)
