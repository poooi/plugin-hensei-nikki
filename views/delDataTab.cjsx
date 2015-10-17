{React, ReactBootstrap} = window
{Input, Button} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

DelDataTab = React.createClass
  getInitialState: ->
    btnDisable: true
    deckChecked: []
  componentWillReceiveProps: (nextProps) ->
    if nextProps.indexKey is nextProps.selectedKey and nextProps.henseiData.titles?
      deckChecked = []
      for index in nextProps.henseiData.titles
        deckChecked.push(false)
      @setState
        deckChecked: deckChecked
  shouldComponentUpdate: (nextProps, nextState)->
    updateflag = false
    if nextProps.indexKey is nextProps.selectedKey
      updateflag = true
    updateflag
  handleClickCheckbox: (index) ->
    {deckChecked} = @state
    if deckChecked isnt []
      deckChecked[index] = !deckChecked[index]
      btnDisable = true
      for deck in deckChecked
        if deck is true
          btnDisable = false
      @setState {deckChecked, btnDisable}
  handleDelClick: ->
    {deckChecked} = @state
    delTitle = []
    for item, index in deckChecked
      if item is true
        delTitle.push(@props.henseiData.titles[index])
    if delTitle isnt [] and delTitle.length > 0
      @props.handleDeleteData(delTitle)
      @setState
        btnDisable: true
  render: ->
    <div className='tab-container'>
      <div>
        {
          if @state.deckChecked isnt [] and @state.deckChecked.length > 0
            for title, index in @props.henseiData.titles
              shipName = []
              shipName.push(title)
              shipName.push(' : ')
              if !@props.henseiData[title].ships[0][0][0]?
                for ship in @props.henseiData[title].ships
                  break if ship[0] is null
                  shipName.push(window.$ships[ship[0]].api_name)
                  shipName.push('. ')
              else
                for fleet, index in @props.henseiData[title].ships
                  break if !fleet[0]?[0]?
                  shipName.push(window.$ships[fleet[0][0]].api_name)
                  shipName.push('. ')
              <Input type='checkbox'
                     label={shipName}
                     key={title}
                     onChange={@handleClickCheckbox.bind(@, index)}
                     checked={@state.deckChecked[index]}/>
        }
      </div>
      <Button style={alignItems: 'flex-end'}
              bsSize='small'
              disabled={@state.btnDisable}
              onClick={@handleDelClick}
              block>
        {__ 'Delete'}
      </Button>
    </div>

module.exports = DelDataTab
