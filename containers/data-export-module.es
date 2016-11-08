import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormControl, Button } from 'react-bootstrap'
import { codeConversion } from '../utils'

export default connect(
  (state, { title }) => ({ code: state.data[title].fleets })
})(class DataExportModule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subState === 'export' && this.props.subState !== 'export') {
      const { fleets } = nextProps.data[nextProps.title]
      const code = JSON.stringify(codeConversion(fleets))
      this.setState({ code })
    }
  }
  onCopy = (e) => {
    clipboard.writeText(this.state.code)
    window.toggleModal(__('Copy'), __('The code has been copied to the clipboard.'))
  }
  render() {
    return (
      <div className="tab-container">
        <span>
          {__('Support')}:
            <a onClick={openExternal.bind(this, 'http://fleet.diablohu.com')}>
              是谁呼叫舰队
            </a>,
            <a onClick={openExternal.bind(this, 'http://www.kancolle-calc.net/')}>
              艦載機厨デッキビルダー
            </a>。
        </span>
        <div className="container-col">
          <Button bsSize="small" onClick={this.onCopy}>{__('Copy')}</Button>
          <FormControl style={height: 250}
                       componentClass="textarea"
                       label={__('Code')}
                       placeholder={__('Code')}
                       value={this.state.code} />
        </div>
      </div>
    )
  }
})
