{React, ReactBootstrap, $ships, $shipTypes, $slotitems} = window
{Button, Input} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

TagsInputContainer = require './tagsInputContainer'

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    deckId: 0
    saveDisable: true
    tags: []
    tagsStyle: []
  componentWillReceiveProps: (nextProps)->
    if nextProps.indexKey is nextProps.selectedKey
      @setState
        saveDisable: true
        deckId: 0
        title: ''
        tags: []
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
  handleTagAddClick: (tagInput, tagType) ->
    {tags, tagsStyle} = @state
    tags.push tagInput
    tagsStyle.push tagType
    @setState
      tags: tags
      tagsStyle: tagsStyle
  handleSaveClick: ->
    {deckId, title, tags, tagsStyle} = @state
    deck = @props.getDeckDetail deckId, tags, tagsStyle
    @props.handleAddData title, deck
    @setState
      saveDisable: true
      deckId: 0
      title: ''
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
      <TagsInputContainer handleTagAddClick={@handleTagAddClick} />
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
