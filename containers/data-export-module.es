import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap'
import { shell, clipboard } from 'electron'
import { __, fleetsByTitleSelector, dataToThirdparty } from '../utils'

export default connect(
  (state, { title }) => fleetsByTitleSelector(title)
)(class DataExportModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      type: 'poi',
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fleets !== this.props.fleets) {
      const fleets = nextProps.type === 'poi'
                   ? nextProps.fleets
                   : dataToThirdparty(nextProps.fleets)
      const code = JSON.stringify(fleets)
      this.setState({ code })
    }
  }
  onCopy = (e) => {
    clipboard.writeText(this.state.code)
    window.toggleModal(__('Copy'), __('The code has been copied to the clipboard.'))
  }
  onTypeSelected = (type) => {
    if (type === this.state.type) return
    const { fleets } = this.props
    const code = type === 'poi'
               ? JSON.stringify(fleets)
               : JSON.stringify(dataToThirdparty(fleets))
    this.setState({
      code,
      type,
    })
  }
  render() {
    return (
      <div className="tab-container">
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
                       value={this.state.code} />
        </div>
      </div>
    )
  }
})
