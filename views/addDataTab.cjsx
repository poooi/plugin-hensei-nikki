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

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    deckId: 0
    saveDisable: true
    tagDisable: true
    tagType: 0
    tags: []
    tagsStyle: []
    tagTypesLabel: [__('Ship type'), "#{__('Ship type')}(#{__('Do not add')})",
                      __('Ship name'), "#{__('Ship name')}(#{__('Do not add')})",
                      __('Slot items'), __('Fighter Power '), __('LOS ')]
  componentWillReceiveProps: (nextProps)->
    if nextProps.indexKey is nextProps.selectedKey
      @setState
        saveDisable: true
        tagDisable: true
        deckId: 0
        title: ''
        tagType: ''
        tags: []
        tagsStyle: []
  handleTitleChange: ->
    title = @refs.title.getValue()
    if title? and title.length > 0
      saveDisable = false
    else
      saveDisable = true
    @setState
      title: title
      saveDisable: saveDisable
  handleDeckSelect: (e) ->
    deckId = parseInt e.target.value
    @setState
      deckId: deckId
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
    {tags, tagsStyle, tagInput, tagType} = @state
    tags.push tagInput
    tagsStyle.push getStyleByType(tagType)
    @setState
      tags: tags
      tagInput: ''
      tagsStyle: tagsStyle
  handleSaveClick: ->
    {deckId, title, tags, tagsStyle} = @state
    deck = @props.getDeckDetail deckId, tags, tagsStyle
    @props.handleAddData title, deck
    @setState
      saveDisable: true
      tagDisable: true
      deckId: 0
      title: ''
      tagType: ''
      tags: []
      tagsStyle: []
  render: ->
    <div className='add-data-tab'>
      <Input type='select'
             label={__ 'Select fleet'}
             value={@state.deckId}
             onChange={@handleDeckSelect}>
        {
          if window._decks?
            for deck, index in window._decks
              <option value={index} key={index}>{deck.api_name}</option>
        }
      </Input>
      <Input type='text'
             label={__ 'Title'}
             placeholder={__ 'Title'}
             value={@state.title}
             hasFeedback
             ref='title'
             onChange={@handleTitleChange} />
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
      <div style={display: 'flex', padding: 5}>
        {
          if @state.tags.length > 0
            for tag, index in @state.tags
              <Label bsSize='medium'
                     style={margin: 5}
                     bsStyle={@state.tagsStyle[index]}
                     key={index}>
                {tag}
              </Label>
        }
      </div>
      <div>
        <Button bsSize='small'
                disabled={@state.saveDisable}
                onClick={@handleSaveClick}
                block>
          {__ 'Save'}
        </Button>
      </div>
    </div>

module.exports = AddDataTab
