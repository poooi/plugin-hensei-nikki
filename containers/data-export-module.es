import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Card,
  Icon,
  Button,
  FormGroup,
  HTMLSelect,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { shell, clipboard } from 'electron'
import { __, dataByTitleSelector, dataToThirdparty } from '../utils'

const CardM = styled(Card)`
  margin: 1em 0;
`

const Panel = styled.div`
  width: 100%;
  height: 200px;
  overflow: auto;
  margin: 1em 0;
  padding: 1em;
  background: rgba(0, 0, 0, .1);
`

const Tips = styled.div`
  margin: .5em 0;
`

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
  onTypeSelected = (e) => {
    const type = e.target.value
    if (type === this.state.type) return
    const { version, fleets } = this.props.data
    const code = type === 'poi'
               ? JSON.stringify({ version, fleets })
               : JSON.stringify(dataToThirdparty(fleets))
    this.setState({ code, type })
  }
  render() {
    const { type, code } = this.state
    return (
      <CardM>
        <Button onClick={this.props.onCancel}>
          <Icon icon="cross" />
        </Button>
        <Panel>{code}</Panel>
        <FormGroup label="代码类型">
          <HTMLSelect value={type} onChange={this.onTypeSelected}>
            <option value="poi">poi</option>
            <option value="thirdparty">第三方</option>
          </HTMLSelect>
        </FormGroup>
        <Button onClick={this.onCopy}>{__('Copy')}</Button>
        {
          type === 'thirdparty' && (
            <Tips>
              {__('Support')}:
                <a onClick={shell.openExternal.bind(this, 'http://fleet.diablohu.com')}>
                  是谁呼叫舰队
                </a>,
                <a onClick={shell.openExternal.bind(this, 'http://www.kancolle-calc.net/')}>
                  艦載機厨デッキビルダー
                </a>。
            </Tips>
          )
        }
      </CardM>
    )
  }
})
