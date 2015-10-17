{React, ReactBootstrap, JSON, toggleModal} = window
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

EditTagTab = React.createClass
  getInitialState: ->
    delDisable: true
    selectTitle: 0
    tags: []
    tagChecked: []
  componentWillReceiveProps: (nextProps) ->
    if nextProps.indexKey is nextProps.selectedKey and nextProps.henseiData.titles?
      tagChecked = []
      title = nextProps.henseiData.titles[0]
      tags = nextProps.henseiData[title].tags
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
  handleTitleSelect: (e) ->
    selectTitle = parseInt e.target.value
    title = @props.henseiData.titles[selectTitle]
    tags = @props.henseiData[title].tags
    tagChecked = []
    for item in tags
      tagChecked.push false
    @setState
      selectTitle: selectTitle
      tags: tags
      tagChecked: tagChecked
  handleTagAddClick: (tagInput) ->
    {tags} = @state
    tags.push tagInput
    @setState
      tags: tags
  handleSaveClick: ->
    {selectTitle, tags} = @state
    henseiData = @props.henseiData
    title = henseiData.titles[selectTitle]
    henseiData[title].tags = tags
    @props.saveData henseiData
    title = @props.henseiData.titles[selectTitle]
    @setState
      selectTitle: 0
      tags: @props.henseiData[title].tags
      btnDisable: true
  render: ->
    <div className='tab-container'>
      <div className='container-col'>
        <Input type='select'
               label={__ 'Select title'}
               value={@state.selectTitle}
               onChange={@handleTitleSelect}>
          {
            if @props.henseiData?
              for title, index in @props.henseiData.titles
                <option value={index} key={index}>{title}</option>
          }
        </Input>
        <div>
          {
            for tag, index in @state.tags
              title = @props.henseiData.titles[@state.selectTitle]
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

module.exports = EditTagTab
