{React, ReactBootstrap} = window
{Button, Input, Label, Panel} = ReactBootstrap
{relative, join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

TagsInputContainer = require './tagsInputContainer'
HenseiItem = require './henseiItem'

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    saveDisable: true
    tags: []
    deckChecked: [false, false, false, false]
    showPre: false
    deck: ''
  componentWillReceiveProps: (nextProps)->
    if nextProps.status isnt @props.status and nextProps.status is 'add'
      @setState
        saveDisable: true
        title: ''
        tags: []
        deck: ''
        showPre: false
  handleTitleChange: ->
    title = @refs.title.getValue()
    flag = false
    for item in @state.deckChecked
      if item
        flag = true
    if title? and title.length > 0 and flag
      saveDisable = false
    else
      saveDisable = true
    @setState
      title: title
      saveDisable: saveDisable
  handleTagAddClick: (tagInput) ->
    {tags} = @state
    flag = true
    for tag in tags
      if tag is tagInput
        toggleModal __('Error'), __('The tag is already exist.')
        flag = false
    if flag
      tags.push tagInput
      @setState
        tags: tags
  handleSaveClick: ->
    {deckChecked, title, tags} = @state
    deck = @props.getDeckDetail deckChecked, tags
    @props.handleAddData title, deck
    @setState
      saveDisable: true
      deckChecked: [false, false, false, false]
      title: ''
      tags: []
  handlePreClick: ->
    {deckChecked, title, tags, showPre} = @state
    if showPre
      @setState
        showPre: false
    else
      deck = @props.getDeckDetail deckChecked, tags
      @setState
        deck: deck
        showPre: true
  handleClickCheckbox: (index) ->
    {deckChecked} = @state
    if deckChecked.length > 0
      deckChecked[index] = !deckChecked[index]
      flag = false
      for deck in deckChecked
        if deck
          flag = true
          break
      if flag and @state.title.length > 0
        saveDisable = false
      else
        saveDisable = true
      @setState
        deckChecked: deckChecked
        saveDisable: saveDisable
  render: ->
    <div className='add-data-tab'>
      <Button bsSize='small'
              onClick={@props.handleBackClick}
              style={margin: 10}>
        <FontAwesome name='arrow-left' />
      </Button>
      <div style={display: 'flex', padding: 7}>
      {
        if window._decks?
          for deck, index in window._decks
            <Input type='checkbox'
                   label={deck.api_name}
                   key={index}
                   onChange={@handleClickCheckbox.bind(@, index)}
                   checked={@state.deckChecked[index]}/>
      }
      </div>
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
                     key={index}>
                {tag}
              </Label>
        }
      </div>
      <Panel collapsible expanded={@state.showPre}>
        {
          if @state.deck.ships?
            <HenseiItem deckItem={@state.deck}/>
        }
      </Panel>
      <div style={display: 'flex'}>
        <Button bsSize='small'
                disabled={@state.saveDisable}
                onClick={@handlePreClick}
                style={width: '50%'}>
          {__ 'Preview'}
        </Button>
        <Button bsSize='small'
                disabled={@state.saveDisable}
                onClick={@handleSaveClick}
                style={width: '50%'}>
          {__ 'Save'}
        </Button>
      </div>
    </div>

module.exports = AddDataTab
