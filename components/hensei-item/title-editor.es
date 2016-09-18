import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel, FormControl, Button } from 'react-bootstrap'
import { onSaveTitle, onSwitchSubState } from '../redux/actions'
import { toggleModal, _ } from '../../utils'

const initialState = {
  inputTitle: '',
  saveDisable: true,
  show: false,
}

export default connect(
  state => ({}),
  { onSaveTitle, onSwitchSubState }
)(class TitleEditor extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subState !== this.props.subState) {
      this.setState({
        ...initialState,
        show: nextProps.subState === 'editTitle',
      })
    }
  }
  onInputTitleChange = (e) => {
    const inputTitle = e.target.value
    const saveDisable = !(inputTitle && inputTitle.length && inputTitle !== this.props.title)

    this.setState({
      inputTitle,
      saveDisable,
    })
  }
  onSave = () => {
    const { data, title, onSaveTitle } = this.props
    const { inputTitle } = this.state

    if (includes(Object.keys(data), inputTitle)) {
      toggleModal(__('Error'), __('The title is already exist.'))
    } else {
      onSaveTitle(title, inputTitle)
      onSwitchSubState('list')
    }
  }
  render() {
    const { inputTitle, saveDisable, show } = this.state
    return (
      <Panel collapsible expanded={show} className="title-editor">
        <FormControl type="text"
                     label={__('Title')}
                     placeholder={__('Title')}
                     value={inputTitle}
                     ref="inputTitle"
                     onChange={this.onInputTitleChange} />
        <Button bsSize="small"
                disabled={saveDisable}
                onClick={this.onSave}>
          {__('Save')}
        </Button>
      </Panel>
    )
  }
})
