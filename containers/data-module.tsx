import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataList from '../components/data-list'
import DataView from '../components/data-view'
import { henseiDataSelector } from '../utils'
import { SavedDataRecords } from '../utils/calc'

interface DataModuleProps {
  data?: SavedDataRecords
}

interface DataModuleState {
  activeTitle: string
}

export class DataModule extends Component<DataModuleProps, DataModuleState> {
  state: DataModuleState = { activeTitle: '' }

  componentWillReceiveProps(nextProps: DataModuleProps): void {
    const { data } = nextProps
    if (!data) return
    const { activeTitle } = this.state
    if (activeTitle && !data[activeTitle]) this.setState({ activeTitle: '' })
    if (!activeTitle && Object.keys(data).length) {
      this.setState({ activeTitle: Object.keys(data)[0] || '' })
    }
  }

  onShowData = (activeTitle: string): void => {
    this.setState({ activeTitle })
  }

  render(): JSX.Element {
    const { activeTitle } = this.state
    return (
      <div className="hensei-list">
        <DataList onShowData={this.onShowData} activeTitle={activeTitle} />
        {activeTitle && <DataView title={activeTitle} />}
      </div>
    )
  }
}

export default connect(henseiDataSelector)(DataModule)
