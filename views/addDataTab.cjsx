{React, ReactBootstrap} = window
{Button, FormControl, Checkbox, Label, Panel} = ReactBootstrap
{relative, join} = require 'path-extra'
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])

TagsInputContainer = require './tagsInputContainer'
HenseiItem = require './henseiItem'

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    saveDisable: true
    preDisable: true
    tags: []
    deckChecked: [false, false, false, false]
    showPre: false
    deck: ''
  componentWillReceiveProps: (nextProps)->
    if nextProps.status isnt @props.status and nextProps.status is 'add'
      @setState
        saveDisable: true
        preDisable: true
        title: ''
        tags: []
        deck: ''
        showPre: false
  handleTitleChange: (e) ->
    title = e.target.value
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
      preDisable: true
      showPre: false
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
      saveDisable = true
      preDisable = true
      if flag
        preDisable = false
        if @state.title.length > 0
          saveDisable = false
      @setState
        deckChecked: deckChecked
        saveDisable: saveDisable
        preDisable: preDisable
        showPre: false
  render: ->
    <div className='tab-container'>
      <Button bsSize='small'
              onClick={@props.handleBackClick}
              style={margin: 10}>
        <FontAwesome name='arrow-left' />
      </Button>
      <div style={display: 'flex', padding: 7, alignItems: 'baseline', justifyContent: 'space-around'}>
      {
        if window._decks?
          for deck, index in window._decks
            <Checkbox key={index}
                      onChange={@handleClickCheckbox.bind(@, index)}
                      checked={@state.deckChecked[index]}>
              {deck.api_name}
            </Checkbox>
      }
      </div>
      <FormControl type='text'
                   label={__ 'Title'}
                   placeholder={__ 'Title'}
                   value={@state.title}
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
            deck = @state.deck
            deck.v = 'min'
            <HenseiItem deckItem={deck}/>
        }
      </Panel>
      <div style={display: 'flex'}>
        <Button bsSize='small'
                disabled={@state.preDisable}
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
