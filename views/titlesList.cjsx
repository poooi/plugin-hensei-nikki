{React, ReactBootstrap} = window
{Input, ButtonGroup, Button, OverlayTrigger, Popover, Overlay, Label} = ReactBootstrap
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
      valueData.push(ship[1][0]) if ship[1][0] isnt null
      for slotId in ship[2]
        continue if slotId is null
        valueData.push window.$slotitems[slotId].api_name
    valueData
  handleClick: (title) ->
    if title isnt @props.activeTitle
      @props.handleTitleChange title
  render: ->
    <div style={flex: "0 1", maxWidth: 80, minWidth: 50}>
      <div style={flex: 1} className='titles-keywords'>
        <Input type='text'
               value={@state.filterKey}
               placeholder={__ "Keywords"}
               hasFeedback
               ref='keywords'
               onChange={@handleKeyWordChange} />
      </div>
      <div>
        <ButtonGroup vertical bsSize='xsmall' className='titles-container'>
        {
          if @state.showData?
            if @state.showData.titles? and @state.showData.titles isnt []
              for title, index in @state.showData.titles
                <OverlayTrigger placement='bottom' overlay={
                  <Popover>
                    <div style={padding: 7}>
                      <div>{title}</div>
                      <div>
                        {
                          if @state.showData[title].tags.length != 0
                            for tag, tagIndex in @state.showData[title].tags
                              <Label style={display: 'inline-block', margin: 5}
                                     bsStyle={@state.showData[title].tagsStyle[tagIndex]}
                                     key={tagIndex}>
                               {tag}
                              </Label>
                        }
                      </div>
                    </div>
                  </Popover>
                }>
                  <Button key={index}
                          onClick={@handleClick.bind(@, title)}
                          className={if @props.activeTitle is title then 'active' else ''}>
                    {title}
                  </Button>
                </OverlayTrigger>
        }
        </ButtonGroup>
      </div>
    </div>

module.exports = TitlesList
