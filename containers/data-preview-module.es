import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel, Button, Checkbox } from 'react-bootstrap'

export default connect(
  createSelector([
    deckSelector,
  ], deck => ({ deck })), {
    saveData
})(class AddDataModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      deckChecked: [false, false, false, false],
      previewShow: false,
    }
  }
  onChecoboxClicked = (index) => {
    const { deckChecked, title } = this.state
    deckChecked[index] = !deckChecked[index]

    let preDisable = !deckChecked.includes(true)
    let saveDisable = !(!preDisable && title && title.length)

    this.setState({ deckChecked })
  }
  onImportCodeChange = (e) => {
    this.checkState({ importCode: e.target.value })
  }
  onShowPreview = (e) => {
    const { type, onAddData } = this.props
    const { deckChecked, code } = this.state
    const data = type === 'add'
               ? getHenseiDataByFleet(deckChecked)
               : getHenseiDataByCode(code)
    onAddData(data)
  }
  render() {
    const { fleets, type } = this.props
    const { deckChecked, title, note } = this.state
    const checkbox = []

    fleets.forEach((fleet, index) => {
      checkbox.push(
        <Checkbox key={index}
                  onChange={this.onChecoboxClicked.bind(this, i)}
                  checked={deckChecked[index]}>
          { fleets.api_name }
        </Checkbox>
      )
    })

    return(
      <div className="add-data-preview-module">
        {
          type === 'add'
          ? <div className="fleets-checkzone">{checkbox}</div>
          : <FormControl componentClass="textarea"
                         label={__('Import code')}
                         placeholder={__('Import code')}
                         value={importCode}
                         onChange={this.onImportCodeChange} />
        }
        <Button bsSize="small" disabled={preDisable} onClick={this.onShowPreview}>
          {__('Preview')}
        </Button>
      </div>
    )
  }
})
