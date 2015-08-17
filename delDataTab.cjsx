{React, ReactBootstrap} = window
{Grid, Input, Nav, NavItem} = ReactBootstrap
i18n = require './node_modules/i18n'
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
    if nextProps.selectedKey is 2
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
  handleSaveSelect: ->
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
    <Grid>
      <Nav bsStyle='pills' activeKey={1} onSelect={@handleSaveSelect}>
        <NavItem eventKey={1} disabled={@state.btnDisable} block>{__ "Delete"}</NavItem>
      </Nav>
      {
        if @state.deckChecked isnt [] and @state.deckChecked.length > 0
          for title, index in @props.henseiData.titles
            shipName = []
            shipName.push(title)
            shipName.push(" : ")
            for ship in @props.henseiData[title].ships
              shipName.push(ship[0])
              shipName.push(". ")
            <Input type='checkbox' label={shipName} key={title} onChange={@handleClickCheckbox.bind(@, index)} checked={@state.deckChecked[index]}/>
      }
    </Grid>
module.exports = DelDataTab
