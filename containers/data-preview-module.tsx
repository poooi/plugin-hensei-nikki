import React, { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { trim } from 'lodash'
import {
  Button,
  Checkbox,
  InputGroup,
  ControlGroup,
  FormGroup,
  TextArea,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { fleetsSelector, shipsSelector, equipsSelector } from 'views/utils/selectors'
import { __, getHenseiDataByApi } from '../utils'
import FleetsView from '../components/fleets-view'
import { Fleet } from '../utils/calc'

const CheckZone = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2em 0 1em;
`
const ControlGroupM = styled(ControlGroup)`
  margin-bottom: 1em;
`
const FormGroupM = styled(FormGroup)`
  margin-bottom: 1em;
`

interface SelectInputStateProps {
  fleets: HenseiHostFleet[]
  ships: Record<string, HenseiApiShip>
  equips: Record<string, HenseiApiEquip>
}

interface SelectInputOwnProps {
  onShowPreview: (data: Fleet[]) => void
  onNext: (title: string, note: string, data: Fleet[]) => void
}

interface SelectInputProps extends SelectInputStateProps, SelectInputOwnProps {}

interface SelectInputState {
  deckChecked: boolean[]
  btnDisable: boolean
  title: string
  note: string
}

class SelectInput extends Component<SelectInputProps, SelectInputState> {
  state: SelectInputState = {
    deckChecked: [false, false, false, false],
    btnDisable: true,
    title: '',
    note: '',
  }

  onCheck = (index: number): void => {
    const deckChecked = [...this.state.deckChecked]
    deckChecked[index] = !deckChecked[index]
    const btnDisable = !deckChecked.some(Boolean)
    this.setState({ deckChecked, btnDisable }, () => {
      this.props.onShowPreview(btnDisable ? [] : this.getHenseiData())
    })
  }

  onNext = (): void => {
    const { title, note } = this.state
    this.props.onNext(title, note, this.getHenseiData())
  }

  onTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ title: trim(event.currentTarget.value) })
  }

  onNoteChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ note: trim(event.currentTarget.value) })
  }

  getHenseiData = (): Fleet[] => {
    const { fleets, ships, equips } = this.props
    const { deckChecked } = this.state
    const ids = fleets
      .filter((_fleet, index) => deckChecked[index])
      .map((fleet) => fleet.api_ship.map((id) => ({ id })))
    return getHenseiDataByApi(ids, ships, equips)
  }

  render(): JSX.Element {
    const { fleets } = this.props
    const { deckChecked, btnDisable, title, note } = this.state
    return (
      <>
        <CheckZone>
          {fleets.map((fleet, index) => (
            <Checkbox key={index} onChange={() => this.onCheck(index)} checked={deckChecked[index]}>
              {fleet.api_name}
            </Checkbox>
          ))}
        </CheckZone>
        <ControlGroupM fill>
          <InputGroup
            type="text"
            placeholder={__('Title')}
            value={title}
            onChange={this.onTitleChange}
          />
          <Button disabled={btnDisable || !title.length} onClick={this.onNext}>{__('Next')}</Button>
        </ControlGroupM>
        <FormGroupM label={__('Note')} labelFor="note-input">
          <TextArea fill id="note-input" onChange={this.onNoteChange} value={note} />
        </FormGroupM>
      </>
    )
  }
}

const ConnectedSelectInput = connect<SelectInputStateProps, SelectInputOwnProps>(
  createSelector(
    [fleetsSelector, shipsSelector, equipsSelector],
    (fleets, ships, equips) => ({ fleets, ships, equips }),
  ),
)(SelectInput)

export interface DataPreviewModuleProps {
  onAddData: (title: string, note: string, data: Fleet[]) => void
  onCancel: () => void
}

interface DataPreviewModuleState {
  preCode: Fleet[]
}

export default class DataPreviewModule extends Component<DataPreviewModuleProps, DataPreviewModuleState> {
  state: DataPreviewModuleState = { preCode: [] }

  onNext = (title: string, note: string, data: Fleet[]): void => {
    this.props.onAddData(title, note, data)
  }

  onShowPreview = (data: Fleet[]): void => {
    this.setState({ preCode: data })
  }

  render(): JSX.Element {
    return (
      <div className="data-preview-module">
        <ConnectedSelectInput onShowPreview={this.onShowPreview} onNext={this.onNext} />
        {this.state.preCode.length > 0 && <FleetsView code={this.state.preCode} />}
      </div>
    )
  }
}

export { SelectInput }
