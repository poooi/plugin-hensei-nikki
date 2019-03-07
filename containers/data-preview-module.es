import React, { Component } from 'react'
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

const SelectInput = connect(
  createSelector([
    fleetsSelector,
    shipsSelector,
    equipsSelector,
  ], (fleets, ships, equips) => ({ fleets, ships, equips }))
)(class SelectInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deckChecked: [false, false, false, false],
      btnDisable: true,
      title: '',
      note: '',
    }
  }
  onCheck = (index) => {
    const { deckChecked } = this.state
    deckChecked[index] = !deckChecked[index]
    const btnDisable = !deckChecked.filter(c => c).length
    this.setState({ deckChecked, btnDisable }, () => {
      this.props.onShowPreview(btnDisable ? '' : this.getHenseiData())
    })
  }
  onNext = () => {
    const { title, note } = this.state
    this.props.onNext(title, note, this.getHenseiData())
  }
  onTitileChange = (e) => {
    this.setState({ title: trim(e.target.value) })
  }
  onNoteChange = (e) => {
    this.setState({ note: trim(e.target.value) })
  }
  getHenseiData = () => {
    const { fleets, ships, equips } = this.props
    const { deckChecked } = this.state
    const ids =
      fleets
        .filter((f, i) => deckChecked[i])
        .map(f => f.api_ship.map(s => ({ id: s })))
    return getHenseiDataByApi(ids, ships, equips)
  }
  render() {
    const { fleets } = this.props
    const { deckChecked, btnDisable, title, note } = this.state
    const { onCheck } = this
    return (
      <>
        <CheckZone>
          {
            fleets.map((fleet, i) =>
              <Checkbox
                key={i}
                onChange={onCheck.bind(this, i)}
                checked={deckChecked[i]}
              >
                { fleet.api_name }
              </Checkbox>
            )
          }
        </CheckZone>
        <ControlGroupM fill>
          <InputGroup
            type="text"
            placeholder={__('Title')}
            value={title}
            onChange={this.onTitileChange}
          />
          <Button
            disabled={btnDisable || !title.length}
            onClick={this.onNext}
          >
            {__('Next')}
          </Button>
        </ControlGroupM>
        <FormGroupM label={__('Note')} labelFor="note-input">
          <TextArea
            fill
            id="note-input"
            onChange={this.onNoteChange}
            value={note}
          />
        </FormGroupM>
      </>
    )
  }
})

export default class DataPreviewModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preCode: '',
    }
  }
  onNext = (title, note, data) => {
    this.props.onAddData(title, note, data)
  }
  onShowPreview = (data) => {
    this.setState({ preCode: data })
  }
  render() {
    const { preCode } = this.state

    return(
      <div className="data-preview-module">
        <SelectInput onShowPreview={this.onShowPreview} onNext={this.onNext} />
        { preCode && <FleetsView code={preCode} /> }
      </div>
    )
  }
}
