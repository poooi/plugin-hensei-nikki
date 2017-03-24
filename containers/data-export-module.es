import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormGroup, FormControl, ControlLabel, Button, Well } from 'react-bootstrap'
import { shell, clipboard } from 'electron'
import { __, dataByTitleSelector, dataToThirdparty } from '../utils'

export default connect(
  (state, { title }) => dataByTitleSelector(title)
)(class DataExportModule extends Component {
  constructor(props) {
    super(props)
    const { version, fleets } = props.data
    this.state = {
      code: JSON.stringify({ version, fleets }),
      type: 'poi',
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const { version, fleets } = nextProps.data
      const data = nextProps.type === 'poi'
                 ? { version, fleets }
                 : dataToThirdparty(nextProps.fleets)
      const code = JSON.stringify(data)
      this.setState({ code })
    }
  }
  onCopy = (e) => {
    clipboard.writeText(this.state.code)
    window.toggleModal(__('Copy'), __('The code has been copied to the clipboard.'))
  }
  onTypeSelected = (type) => {
    if (type === this.state.type) return
    const { version, fleets } = this.props.data
    const code = type === 'poi'
               ? JSON.stringify({ version, fleets })
               : JSON.stringify(dataToThirdparty(data.fleets))
    this.setState({
      code,
      type,
    })
  }
  render() {
    return (
      <Well className="data-export-module tab-container">
        <Button className="exit-btn" onClick={this.props.onCancel}>X</Button>
        <span>
          {__('Support')}:
            <a onClick={shell.openExternal.bind(this, 'http://fleet.diablohu.com')}>
              是谁呼叫舰队
            </a>,
            <a onClick={shell.openExternal.bind(this, 'http://www.kancolle-calc.net/')}>
              艦載機厨デッキビルダー
            </a>。
        </span>
        <FormGroup controlId="formControlsSelect">
          <ControlLabel>代码类型</ControlLabel>
          <FormControl componentClass="select" placeholder="代码类型" onChange={this.onTypeSelected}>
            <option value="poi">poi</option>
            <option value="thirdparty">第三方</option>
          </FormControl>
        </FormGroup>
        <div className="container-col">
          <Button bsSize="small" onClick={this.onCopy}>{__('Copy')}</Button>
          <FormControl style={{height: 250}}
                       componentClass="textarea"
                       label={__('Code')}
                       placeholder={__('Code')}
                       defaultValue={this.state.code} />
        </div>
      </Well>
    )
  }
})
