{React, ReactBootstrap, $ships, $shipTypes, $slotitems} = window
{Button, Input, Label} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

getStyleByType = (type) ->
  switch type
    when 0 and 1
      return 'default'
    when 2 and 3
      return 'primary'
    when 4
      return 'info'
    when 5
      return 'warning'
    else
      return 'danger'

TagsInputContainer = React.createClass
  getInitialState: ->
    tagDisable: true
    tagInput: ''
    tagType: 0
    tagTypesLabel: [__('Ship type'), "#{__('Ship type')}(#{__('Do not add')})",
                      __('Ship name'), "#{__('Ship name')}(#{__('Do not add')})",
                      __('Slot items'), __('Fighter Power '), __('LOS ')]
  handleTagTypeSelect: (e) ->
    tagType = parseInt e.target.value
    @setState
      tagType: tagType
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
    {tagInput, tagType} = @state
    @props.handleTagAddClick tagInput, getStyleByType(tagType)
    @setState
      tagInput: ''
  render: ->
    <div className='tags-input-container'>
      <Input style={margin: 10}
             type='select'
             label={__ 'Select type'}
             value={@state.tagType}
             onChange={@handleTagTypeSelect}>
        {
          for item, index in @state.tagTypesLabel
            <option value={index} key={index}>{item}</option>
        }
      </Input>
      <Input style={margin: 10}
             type='text'
             label={@state.tagTypesLabel[@state.tagType]}
             placeholder={@state.tagTypesLabel[@state.tagType]}
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
