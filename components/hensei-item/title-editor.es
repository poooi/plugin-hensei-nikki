import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel, FormControl, Button } from 'react-bootstrap'
import { onSaveTags, onSwitchSubState } from '../redux/actions'

const initialState = {
  inputTitle: '',
  saveDisable: true,
  show: false,
}

export default connect(
  state => ({}),
  { onSaveTags, onSwitchSubState }
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
      <Panel collapsible expanded={show} style={marginTop: 10, marginBottom: 0}>
        <FormControl style={margin: 10}
                     type="text"
                     label={__('Title')}
                     placeholder={__('Title')}
                     value={inputTitle}
                     ref="inputTitle"
                     onChange={this.onInputTitleChange} />
        <Button style={height: '50%', width: '50%', margin: 10}
                bsSize="small"
                disabled={saveDisable}
                onClick={this.onSave}>
          {__('Save')}
        </Button>
      </Panel>
    )
  }
})
