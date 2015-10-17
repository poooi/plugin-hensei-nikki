{React, ReactBootstrap} = window
{Button, Input, Label} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TagsInputContainer = React.createClass
  getInitialState: ->
    tagDisable: true
    tagInput: ''
  handleTagInputChange: ->
    tagInput = @refs.tagInput.getValue()
    if tagInput? and tagInput.length > 0
      tagDisable = false
    else
      tagDisable = true
    @setState
      tagInput: tagInput
      tagDisable: tagDisable
  handleTagAddClick: ->
    {tagInput} = @state
    @props.handleTagAddClick tagInput
    @setState
      tagInput: ''
  render: ->
    <div className='tags-input-container'>
      <Input style={margin: 10}
             type='text'
             label={__ 'Tag'}
             placeholder={__ 'Tag'}
             value={@state.tagInput}
             hasFeedback
             ref='tagInput'
             onChange={@handleTagInputChange} />
      <Button style={height: '50%', width: '20%', margin: 10}
              bsSize='small'
              disabled={@state.tagDisable}
              onClick={@handleTagAddClick}>
        {__ 'Add'}
      </Button>
    </div>

module.exports = TagsInputContainer
