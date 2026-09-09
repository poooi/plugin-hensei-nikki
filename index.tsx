import React, { Component } from 'react'
import { connect } from 'react-redux'
import { observer, observe } from 'redux-observers'
import { join } from 'path-extra'
import { store } from 'views/create-store'
import {
  Icon,
  Button,
  Popover,
  Position,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import styled from 'styled-components'

import { reducer, onImportFile } from './redux'
import { __, exportRecordsFile, henseiDataSelector, saveData, loadImportFile } from './utils'
import ImportModule from './containers/import-module'
import DataModule from './containers/data-module'

const { dialog } = remote.require('electron')

interface OptionsOwnProps {
  switchState: (state: string) => void
}

interface OptionsStateProps {
  data?: HenseiHostRootState['poi-plugin-hensei-nikki']['henseiData']['data']
}

interface OptionsDispatchProps {
  onImportFile: typeof onImportFile
}

interface OptionsProps extends OptionsOwnProps, OptionsStateProps, OptionsDispatchProps {}

const OptionsPop = styled(Popover)`
  position: absolute;
  top: 1em;
  left: 1em;
`

export class Options extends Component<OptionsProps> {
  onMenuSelected = (eventKey: string): void => {
    switch (eventKey) {
      case 'importFile':
        this.onFileImportSelected()
        break
      case 'exportFile':
        this.onFileExportSelected()
        break
      default:
        this.props.switchState(eventKey)
    }
  }

  onFileImportSelected = (): void => {
    const options = {
      title: __('Import records file'),
      filters: [{ name: 'json file', extensions: ['json'] }],
      properties: ['openFile'],
    }
    const filename = dialog.showOpenDialogSync
      ? dialog.showOpenDialogSync(options)
      : dialog.showOpenDialog
        ? dialog.showOpenDialog(options)
        : undefined
    if (filename && filename[0]) {
      this.props.onImportFile(loadImportFile(filename[0]))
    } else if (filename) {
      window.toggleModal('找不到该文件')
    }
  }

  onFileExportSelected = (): void => {
    const options = {
      title: __('Export records file'),
      defaultPath: 'HenseiNikki.json',
    }
    const filename = dialog.showSaveDialogSync
      ? dialog.showSaveDialogSync(options)
      : dialog.showSaveDialog
        ? dialog.showSaveDialog(options)
        : undefined
    if (filename) exportRecordsFile(filename, this.props.data || {}, (message) => window.toggleModal(message))
  }

  render(): JSX.Element {
    return (
      <OptionsPop
        position={Position.BOTTOM}
        content={
          <Menu>
            <MenuItem text={__('Add')} icon="add-to-artifact" onClick={() => this.onMenuSelected('add')} />
            <MenuItem text={__('Import records file')} icon="add-to-folder" onClick={() => this.onMenuSelected('importFile')} />
            <MenuItem text={__('Export records file')} icon="folder-shared-open" onClick={() => this.onMenuSelected('exportFile')} />
          </Menu>
        }
      >
        <Button><Icon icon="add" /></Button>
      </OptionsPop>
    )
  }
}

const ConnectedOptions = connect<OptionsStateProps, OptionsOwnProps, OptionsDispatchProps>(
  henseiDataSelector,
  { onImportFile },
)(Options)

interface HenseiNikkiState {
  activeState: string
}

export class HenseiNikki extends Component<{}, HenseiNikkiState> {
  state: HenseiNikkiState = { activeState: '' }

  switchState = (activeState: string): void => {
    this.setState({ activeState })
  }

  render(): JSX.Element {
    const { activeState } = this.state
    return (
      <div id="HenseiNikki">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'hensei-nikki.css')} />
        {activeState !== 'add' && <ConnectedOptions switchState={this.switchState} />}
        {activeState === 'add' && <ImportModule switchState={this.switchState} />}
        {activeState !== 'add' && <DataModule />}
      </div>
    )
  }
}

export const reactClass = HenseiNikki
export { reducer }

let unsubscribe: (() => void) | undefined

export function pluginDidLoad(): void {
  unsubscribe = observe(store, [observer(
    henseiDataSelector,
    (_dispatch, current) => {
      if (current.data) saveData(current.data)
    },
  )])
  store.dispatch({ type: '@@poi-plugin-hensei-nikki@init' })
}

export function pluginWillUnload(): void {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = undefined
  }
}
