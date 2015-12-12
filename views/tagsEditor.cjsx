{React, ReactBootstrap, FontAwesome} = window
{Button, Input, Label} = ReactBootstrap
{openExternal} = require 'shell'
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

getTags = (index, tag) ->
  <Label style={display: 'inline-block', margin: 5}
         key={index}>
   {tag}
  </Label>

TagsInputContainer = require './tagsInputContainer'

TagsEditor = React.createClass
  getInitialState: ->
    delDisable: true
    tags: []
    tagChecked: []
  componentWillReceiveProps: (nextProps) ->
    if nextProps.edit and !@props.edit
      tagChecked = []
      tags = nextProps.henseiData[nextProps.title].tags
      if tags.length <= 0
        tags = []
      for item in tags
        tagChecked.push false
      @setState
        tags: tags
        tagChecked: tagChecked
        delDisable: true
  handleClickCheckbox: (index) ->
    {tagChecked} = @state
    if tagChecked isnt []
      tagChecked[index] = !tagChecked[index]
      delDisable = true
      for tag in tagChecked
        if tag is true
          delDisable = false
      @setState {tagChecked, delDisable}
  handleDelClick: ->
    {tagChecked, tags} = @state
    delTags = []
    for item, index in tagChecked
      if item is true
        delTags.push tags[index]
    for delTag in delTags
      for tag, index in tags
        if delTag is tag
          tags.splice(index, 1)
    tagChecked = []
    for item in tags
      tagChecked.push false
    @setState
      delDisable: true
      tagChecked: tagChecked
      tags: tags
  handleTagAddClick: (tagInput) ->
    {tags} = @state
    tags.push tagInput
    @setState
      tags: tags
  handleSaveClick: ->
    {tags} = @state
    henseiData = @props.henseiData
    henseiData[@props.title].tags = tags
    @props.saveData henseiData
    @setState
      tags: @props.henseiData[@props.title].tags
      btnDisable: true
  render: ->
    <div className='tab-container'>
      <Button bsSize='small'
              onClick={@props.handleBackClick}
              style={width: '50%', margin: 10}>
        <FontAwesome name='arrow-left' />
      </Button>
      <div className='container-col'>
        <div>
          {
            for tag, index in @state.tags
              label = getTags index, tag
              <Input type='checkbox'
                     label={label}
                     key={index}
                     onChange={@handleClickCheckbox.bind(@, index)}
                     checked={@state.tagChecked[index]}/>
          }
          <Button style={alignItems: 'flex-end'}
                  bsSize='small'
                  disabled={@state.delDisable}
                  onClick={@handleDelClick}
                  block>
            {__ 'Delete'}
          </Button>
        </div>
        <TagsInputContainer handleTagAddClick={@handleTagAddClick} />
      </div>
      <Button bsSize='small'
              onClick={@handleSaveClick}
              block>
        {__ 'Save'}
      </Button>
    </div>

module.exports = TagsEditor
