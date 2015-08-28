{React, ReactBootstrap} = window
{Grid, Row, Col, Accordion, Panel, Input} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitlesList = require './titlesList'
HenseiItem = require './henseiItem'

HenseiList = React.createClass
  getInitialState: ->
    checkItemsLabel = [__('Ship type'), null, "#{__('Ship type')}(#{__('In order')})",
                       __('Ship name'), null, null, __('Slot items'), null,
                       "#{__('Slot items')}(#{__('In order')})", null, null,
                       __('Total Lv '), __('Fighter Power '), __('LOS ')]
    checkItems = []
    for item in checkItemsLabel
      if item is null
        checkItems.push -1
      else
        checkItems.push false
    activeTitle: ''
    isChecking: false
    checkItemsLabel: checkItemsLabel
    checkItems: checkItems
  handleTitleChange: (title) ->
    @setState
      activeTitle: title

  handleClickCheckbox: (index) ->
    {checkItems} = @state
    if checkItems isnt []
      checkItems[index] = !checkItems[index]
      @setState {checkItems}
  handleCheck: ->
    @setState
      isChecking: !@state.isChecking
  render: ->
    <div style={display: 'flex', flex: 'none', padding: 15}>
      <div className={if @state.isChecking then 'show' else 'hidden'}
           style={width: '15%'}>
      {
        for item, index in @state.checkItemsLabel
          if item is null
            <hr style={display: 'block', marginTop: -7, marginBottom: 15}/>
          else
            <Input type='checkbox'
                   label={item}
                   key={index}
                   onChange={@handleClickCheckbox.bind(@, index)}
                   checked={@state.checkItems[index]} />
      }
      </div>
      <TitlesList isChecking={@state.isChecking}
                  activeTitle={@state.activeTitle}
                  henseiData={@props.henseiData}
                  handleTitleChange={@handleTitleChange} />
      <div style={width: '85%'}>
        {
          if @props.henseiData?
               if @props.henseiData.titles? and @props.henseiData.titles.length >= 1 and @props.henseiData[@state.activeTitle]?
                 <HenseiItem title={@state.activeTitle}
                             deckItem={@props.henseiData[@state.activeTitle]}
                             checkItems={@state.checkItems}
                             handleCheck={@handleCheck}
                             getDeckDetail={@props.getDeckDetail} />
        }
      </div>
    </div>

module.exports = HenseiList
