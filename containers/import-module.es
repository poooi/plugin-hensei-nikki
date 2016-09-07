import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormControl, Button } from 'react-bootstrap'

const { toggleModal } = window
const initialState = {
  importCode: '',
  inputTitle: '',
  btnDisable: true,
}

export default connect(
  createSelector([
    subStateSelector,
    henseiDataSelector,
  ], ({ subState }, data) => ({ subState, data })),
  { onSwitchTopState, onSwitchSubState }
)(class ImportModule extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subState === 'import' && this.props.subState !== 'import') {
      this.setState({
        ...initialState
      })
    }
  }
  checkState(state) {
    const newState = { ...this.state, ...state }
    const { importCode, inputTitle, btnDisable } = newState

    if (inputTitle && inputTitle.length && importCode && importCode.length) {
      btnDisable = false
    } else {
      btnDisable = true
    }

    this.setState({
      ...newState,
      btnDisable,
    })
  }
  onInputTitleChange = (e) => {
    this.checkState({ inputTitle: e.target.value })
  }
  onImportCodeChange = (e) => {
    this.checkState({ importCode: e.target.value })
  }
  onImportCode() {
    let { importCode, inputTitle } = this.state
    importCode = JSON.parse(importCode)
    // TODO: codeConversion
  }
  render() {
    const { importCode, inputTitle, btnDisable } = this.state

    return (
      <div style={width: '99%'}>
        <FormControl type="text"
                     label={__('Title')}
                     placeholder={__('Title')}
                     value={inputTitle}
                     ref="inputTitle"
                     onChange={this.onInputTitleChange} />
        <FormControl style={height: '250px'}
                     componentClass="textarea"
                     label={__('Import code')}
                     placeholder={__('Import code')}
                     value={importCode}
                     ref="importCode"
                     onChange={this.onImportCodeChange} />
        <Button disabled={btnDisable}
                onClick={this.onImportCode}
                block>
          {__('Import')}
        </Button>
      </div>
    )
  }
})
