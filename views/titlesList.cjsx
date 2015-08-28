{React, ReactBootstrap} = window
{Input, ButtonGroup, Button} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitlesList = React.createClass
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
        filterData.push @getDataValue(henseiData[title], title)
      matchData = @_filter key, filterData
      showData = {}
      showData.titles = []
      for deck in matchData
        showData.titles.push deck[0]
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
# [shipId, [lv, cond], [slotId], [slotLv], [slotALv]]
  getDataValue: (data, title) ->
    valueData = []
    valueData.push title
    for item in data.details
      valueData.push item
    for ship in data.ships
      continue if ship[0] is null
      name = window.$ships[ship[0]].api_name
      valueData.push name
      valueData.push ship[1][0]
      for slotId in ship[2]
        continue if slotId is null
        valueData.push window.$slotitems[slotId].api_name
    valueData
  handleClick: (title) ->
    if title isnt @props.activeTitle
      @props.handleTitleChange title
  render: ->
    <div className={if @props.isChecking then 'hidden' else ''}
         style={width: '15%'}>
      <div style={flex: 1}>
        <Input type='text'
               value={@state.filterKey}
               placeholder={__ "keywords"}
               hasFeedback
               ref='keywords'
               onChange={@handleKeyWordChange} />
      </div>
      <div>
        <ButtonGroup bsSize="xsmall" className="titles-container">
        {
          if @state.showData?
            if @state.showData.titles? and @state.showData.titles isnt []
              for title, index in @state.showData.titles
                <Button key={index}
                        onClick={@handleClick.bind(@, title)}
                        className={if @props.activeTitle is title then 'active' else ''}>
                  {title}
                </Button>
        }
        </ButtonGroup>
      </div>
    </div>

module.exports = TitlesList
