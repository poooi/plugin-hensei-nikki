import React, { Component } from 'react'

const initialState = {
  addDisable: true,
  inputTag: '',
}

export default class TagsInput extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }
  componentWillMount() {
    this.setState({
      ...initialState,
    })
  }
  onInputTagChange = (e) => {
    let { addDisable, inputTag } = this.state
    inputTag = e.target.value
    addDisable = inputTag && inputTag.length
    this.setState({
      addDisable,
      inputTag,
    })
  }
  onAddTag = () => {
    this.props.onAddTag(this.state.inputTag)
    this.setState({
      ...initialState,
    })
  }
  render() {
    const { addDisable, inputTag } = this.state
    return (
      <div className="tags-input-container">
        <FormControl style={margin: 10}
                     type="text"
                     label={__('Tag')}
                     placeholder={__('Tag')}
                     value={inputTag}
                     ref="inputTag"
                     onChange={this.onInputTagChange} />
        <Button style={height: '50%', width: '20%', margin: 10}
                bsSize="small"
                disabled={addDisable}
                onClick={this.onAddTag}>
          {__('Add')}
        </Button>
      </div>
    )
  }
}
