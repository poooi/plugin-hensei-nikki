import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { onDeleteData } from '../redux'
import { __ } from '../utils'
import DataEditModule from '../containers/data-edit-module'
import DataExportModule from '../containers/data-export-module'

export default connect(
  '', { onDeleteData }
)(class DataOpts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: 'opts',
    }
  }
  onOptsClick = (opt) => {
    this.setState({ active: opt })
  }
  onDeleteClick = () => {
    window.toggleModal("真的要删除人家吗！？嘤嘤嘤～～/残忍拒绝/好吧不删")
    // const { onDeleteData, title } = this.props
    // onDeleteData(title)
    this.setState({ active: 'opts' })
  }
  render() {
    const { active } = this.state
    const { title } = this.props
    switch (active) {
    case 'export':
      return <DataExportModule title={title} />
    case 'edit':
      return <DataEditModule title={title} />
    }
    return (
      <div className="data-opts">
        <Button bsSize="small" onClick={this.onOptsClick.bind(this, 'export')}>
          <FontAwesome name="share-square-o" /> {__('Export')}
        </Button>
        <Button bsSize="small" onClick={this.onOptsClick.bind(this, 'edit')}>
          <FontAwesome name="plus-square-o" /> {__('Edit')}
        </Button>
        <Button bsSize="small" onClick={this.onDeleteClick}>
          <FontAwesome name="trash"  /> {__('Delete Records')}
        </Button>
      </div>
    )
  }
}
)
