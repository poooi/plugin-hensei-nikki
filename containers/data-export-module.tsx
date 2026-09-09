import React, { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  FormGroup,
  HTMLSelect,
  Icon,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { shell } from 'electron'
import { __, dataByTitleSelector, dataToThirdparty, isSavedFleetData } from '../utils'
import { SavedFleetData } from '../utils/calc'

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

type ExportType = 'poi' | 'thirdparty'

interface DataExportOwnProps {
  title: string
  onCancel: () => void
}

interface DataExportStateProps {
  data: SavedFleetData
}

interface DataExportProps extends DataExportOwnProps, DataExportStateProps {}

interface DataExportState {
  code: string
  type: ExportType
}

export function exportCode(data: SavedFleetData, type: ExportType): string {
  const output = type === 'poi'
    ? { version: data.version, fleets: data.fleets }
    : dataToThirdparty(data.fleets)
  return JSON.stringify(output)
}

function exportableData(state: HenseiHostRootState, title: string): SavedFleetData {
  const { data } = dataByTitleSelector(title)(state)
  return isSavedFleetData(data) ? data : { version: 'poi-h-v1', fleets: [] }
}

export class DataExportModule extends Component<DataExportProps, DataExportState> {
  constructor(props: DataExportProps) {
    super(props)
    this.state = { code: exportCode(props.data, 'poi'), type: 'poi' }
  }

  componentWillReceiveProps(nextProps: DataExportProps): void {
    if (nextProps.data !== this.props.data) {
      this.setState({ code: exportCode(nextProps.data, this.state.type) })
    }
  }

  onCopy = (): void => {
    try {
      const clipboardService = require('views/services/clipboard')
      clipboardService.copyText(this.state.code)
    } catch (error) {
      const { clipboard } = require('electron')
      clipboard.writeText(this.state.code)
    }
    window.toggleModal(__('Copy'), __('The code has been copied to the clipboard.'))
  }

  onTypeSelected = (event: ChangeEvent<HTMLSelectElement>): void => {
    const type: ExportType = event.currentTarget.value === 'poi' ? 'poi' : 'thirdparty'
    if (type === this.state.type) return
    this.setState({ code: exportCode(this.props.data, type), type })
  }

  onOpenExternal = (url: string): void => {
    shell.openExternal(url)
  }

  render(): JSX.Element {
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
        {type === 'thirdparty' && (
          <Tips>
            {__('Support')}:
            <a onClick={() => this.onOpenExternal('http://fleet.diablohu.com')}>
              是谁呼叫舰队
            </a>,
            <a onClick={() => this.onOpenExternal('http://www.kancolle-calc.net/')}>
              艦載機厨デッキビルダー
            </a>。
          </Tips>
        )}
      </CardM>
    )
  }
}

export default connect<DataExportStateProps, DataExportOwnProps>(
  (state, { title }) => ({ data: exportableData(state, title) }),
)(DataExportModule)
