{React, ReactBootstrap, $ships, $shipTypes, $slotitems} = window
{Button, Input, Panel} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

TagPanel = require './tagPanel'

AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    comment: ''
    deckId: 0
    btnDisable: true
    panelShow: false
    disable: true
    checkItem: ''
    selectItems: ''
    tagItem: ''
    tags: ''
  componentWillReceiveProps: (nextProps)->
    if nextProps.indexKey is nextProps.selectedKey
      @setState
        btnDisable: true
        deckId: 0
        title: ''
        comment: ''
  handleTitleChange: ->
    title = @refs.title.getValue()
    if title? and title.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      title: title
      btnDisable: btnDisable
  handleCommentChange: ->
    comment = @refs.comment.getValue()
    @setState
      comment: comment
  handleSaveClick: ->
    {deckId, comment, title, tags} = @state
    deck = @props.getDeckDetail deckId, comment, tags
    @props.handleAddData title, deck
  handleAddTagClick: ->
    if !@state.panelShow
      deck = @props.getDeckDetail @state.deckId, '', ''
      #shipTypes & without = shipNames & without= slotItems = []
      selectItems = [[], [], [], [], []]
      for item in deck.ships
        continue if item[0] is null
        ship = $ships[item[0]]
        selectItems[0].push $shipTypes[ship.api_stype].api_name
        selectItems[2].push ship.api_name
        for slotId in item[2]
          selectItems[4].push $slotitems[slotId].api_name
      for count in [1..$shipTypes.length - 1]
        continue if $shipTypes[count].api_name in selectItems[0]
        selectItems[1].push $shipTypes[count].api_name
      @setState
        panelShow: true
        selectItems: selectItems
    else
      @setState
        panelShow: !@state.panelShow
  handleDeckSelect: (e) ->
    deckId = parseInt e.target.value
    @setState
      deckId: deckId
  render: ->
    <div className='add-data-tab'>
      <Input type='select'
             label={__ 'select fleet'}
             value={@state.deckId}
             onChange={@handleDeckSelect}>
        {
          if window._decks?
            for deck, index in window._decks
              <option value={index} key={index}>{deck.api_name}</option>
        }
      </Input>
      <Input type='text'
             label={__ 'title'}
             placeholder={__ 'title'}
             value={@state.title}
             hasFeedback
             ref='title'
             onChange={@handleTitleChange} />
      <div>
        <Button bsStyle='default'
                bsSize='small'
                disabled={@state.disable}
                onClick={@handleAddTagClick}
                block>
          {if @state.panelShow then __ 'Cancel' else __ 'Add check tags'}
        </Button>

      </div>
      <div>
        <Input style={height: '150px'}
               type='textarea'
               label={__ 'comment'}
               placeholder={__ 'comment'}
               value={@state.comment}
               hasFeedback
               ref='comment'
               onChange={@handleCommentChange} />
      </div>
      <div>
        <Button bsStyle='default'
                bsSize='small'
                disabled={@state.btnDisable}
                onClick={@handleSaveClick}
                block>
          {__ 'save'}
        </Button>
      </div>
    </div>

module.exports = AddDataTab
