{React, ReactBootstrap} = window
{Button, Input, Label} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TagsInputContainer = require './tagsInputContainer'

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    saveDisable: true
    tags: []
    deckChecked: [false, false, false, false]
  componentWillReceiveProps: (nextProps)->
    if nextProps.indexKey is nextProps.selectedKey
      @setState
        saveDisable: true
        title: ''
        tags: []
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
  handleClickCheckbox: (index) ->
    {deckChecked} = @state
    if deckChecked isnt []
      deckChecked[index] = !deckChecked[index]
      @setState {deckChecked}
  render: ->
    <div className='add-data-tab'>
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
