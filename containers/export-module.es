import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormControl, Button } from 'react-bootstrap'
import { forEach, includes } from 'lodash'
import { shell, clipboard } from 'electron'

const { toggleModal } = window
const { openExternal } = shell

export default connect(
  createSelector([
    subStateSelector,
    henseiDataSelector,
  ], ({ subState }, data) => ({ subState, data })),
  { onSwitchTopState, onSwitchSubState }
)(class ExportMoudle extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subState === 'export' && this.props.subState !== 'export') {
      const code = JSON.stringify(nextProps.data[nextProps.title].fleets)
      this.setState({
        code,
      })
    }
  }
  onCopy = (e) => {
    clipboard.writeText(this.state.code)
    toggleModal(__('Copy'), __('The code has been copied to the clipboard.'))
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
          <Button bsSize="small" onClick={this.onCopy}>
            {__('Copy')}
          </Button>
          <FormControl style={height: '250px'}
                       componentClass="textarea"
                       label={__('Code')}
                       placeholder={__('Code')}
                       value={this.state.code} />
        </div>
      </div>
    )
  }
})
