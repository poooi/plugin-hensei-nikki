{React, ReactBootstrap} = window
{Grid, Row, Col, Accordion, Panel, Input} = ReactBootstrap
i18n = require './node_modules/i18n'
{__} = i18n

PanelItem = require './PanelItem'

HenseiList = React.createClass
  getInitialState: ->
    filterKey: ''
    henseiData: {}
  showData: {}
  componentWillReceiveProps: (nextProps) ->
    if nextProps.henseiData isnt @state.henseiData
      @setState
        henseiData: nextProps.henseiData
        showData: nextProps.henseiData
  handleKeyWordChange: ->
    key = @refs.keywords.getValue()
    @filterBuffer key
  filterBuffer: (key) ->
    {henseiData} = @state
    if henseiData.titles isnt []
      filterData = []
      for title in henseiData.titles
        filterData.push(@getDataValue(henseiData[title], title))
      matchData = @_filter(key, filterData)
      showData = {}
      showData.titles = []
      for deck in matchData
        showData.titles.push(deck[0])
        showData[deck[0]] = henseiData[deck[0]]
      @setState
        filterKey: key
        showData: showData
  _filter: (keywords, filterData) ->
    if keywords?
      filterData.filter (data) ->
        match = false
        for item, index in data
          key = item.toString().toLowerCase().trim().indexOf(keywords.toString().toLowerCase().trim())
          if key >= 0
            match = true
        match
    else filterData
  getDataValue: (data, title) ->
    valueData = []
    valueData.push(title)
    for item in data.details
      valueData.push(item)
    for ship in data.ships
      for item, index in ship
        if index is 3 and item isnt []
          for slot in item
            valueData.push(slot[1])
        else
          valueData.push(item)
    valueData
  render: ->
    <Grid>
      <Col xs={5}>
        <Input
          type='text'
          value={@state.filterKey}
          placeholder={__ "keywords"}
          hasFeedback
          ref='keywords'
          onChange={@handleKeyWordChange} />
      </Col>
      <Col xs={12}>
        <Accordion>
           {
             if @state.showData?
               if @state.showData.titles? and @state.showData.titles isnt []
                 for title, index in @state.showData.titles
                   <Panel header={title} eventKey={index} key={index}>
                     <PanelItem deckItem={@state.showData[title]} />
                   </Panel>
           }
         </Accordion>
      </Col>
    </Grid>

module.exports = HenseiList
