import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Checkbox } from 'react-bootstrap'
import { fleetsSelector } from 'views/utils/selectors'
import { __, getHenseiDataByFleets, getHenseiDataByCode } from '../utils'

class CodeInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      btnDisable: true,
    }
  }
  onImportCodeChange = (e) => {
    const code = e.target.value
    const btnDisable = !code.length
    this.setState({ code, btnDisable })
  }
  onShowPreview = () => {
    this.props.onShowPreview(getHenseiDataByCode(this.state.code))
  }
  onNext = () => {
    this.props.onNext(getHenseiDataByCode(this.state.code))
  }
  render() {
    const { code, btnDisable } = this.state
    return (
      <div>
        <FormControl componentClass="textarea"
                     label={__('Import code')}
                     placeholder={__('Import code')}
                     value={code}
                     onChange={this.onImportCodeChange} />
        <Button bsSize="small" disabled={btnDisable} onClick={this.onShowPreview}>
          {__('Preview')}
        </Button>
        <Button bsSize="small" disabled={btnDisable} onClick={this.onNext}>
          {__('Next')}
        </Button>
      </div>
    )
  }
}

const SelectInput = connect(
  createSelector(fleetsSelector, fleets => ({ fleets }))
)(class SelectInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deckChecked: [false, false, false, false],
      btnDisable: true,
    }
  }
  onCheck = (index) => {
    const { deckChecked } = this.state
    deckChecked[index] = !deckChecked[index]
    const btnDisable = !deckChecked.filter(c => c).length
    this.setState({ deckChecked, btnDisable })
  }
  onShowPreview = () => {
    this.props.onShowPreview(this.getHenseiData())
  }
  onNext = () => {
    this.props.onNext(this.getHenseiData())
  }
  getHenseiData = () => {
    const { fleets } = this.props
    const { deckChecked } = this.state
    return getHenseiDataByFleets(fleets.filter((f, i) => deckChecked[i]))
  }
  render() {
    const { fleets } = this.props
    const { deckChecked, btnDisable } = this.state
    const { onCheck } = this
    const checkbox = fleets.map((fleet, i) => {
      <Checkbox key={i} onChange={onCheck.bind(this, i)} checked={deckChecked[i]}>
        { fleets.api_name }
      </Checkbox>
    })
    return (
      <div>
        <div className="fleets-checkzone">{ checkbox }</div>
        <Button bsSize="small" disabled={btnDisable} onClick={this.onShowPreview}>
          {__('Preview')}
        </Button>
        <Button bsSize="small" disabled={btnDisable} onClick={this.onNext}>
          {__('Next')}
        </Button>
      </div>
    )
  }
})

export default class DataPreviewModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preCode: '',
      previewShow: false,
    }
  }
  onNext = (data) => {
    this.props.onAddData(data)
  }
  onShowPreview = (data) => {
    let { previewShow, preCode } = this.state
    if (!previewShow) preCode = data
    this.setState({ preCode, previewShow: !previewShow })
  }
  render() {
    const { preCode, previewShow } = this.state

    return(
      <div className="add-data-preview-module">
        {
          this.props.type === 'add'
          ? <SelectInput onShowPreview={this.onShowPreview}
                         onNext={this.onNext} />
          : <CodeInput onShowPreview={this.onShowPreview}
                       onNext={this.onNext} />
        }
        { previewShow ? <FleetsView code={preCode} /> : ''}
      </div>
    )
  }
}
