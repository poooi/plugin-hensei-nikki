{React, ReactBootstrap, FontAwesome} = window
{FormControl, ButtonGroup, Button, OverlayTrigger, Popover, Overlay, Label, DropdownButton, MenuItem} = ReactBootstrap
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])

TitlesList = React.createClass
  getInitialState: ->
    filterKey: ''
    henseiData: {}
  showData: {}
  componentWillReceiveProps: (nextProps) ->
    if (nextProps.henseiData isnt @state.henseiData) or (nextProps.status is 'list' and nextProps.status isnt @props.status)
      @setState
        henseiData: nextProps.henseiData
        showData: nextProps.henseiData
  handleKeyWordChange: (e) ->
    key = e.target.value
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
# {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}
  getDataValue: (data, title) ->
    valueData = []
    valueData.push title
    for item in data.details
      valueData.push item
    for fIdx in [1..4]
      index = 'f' + fIdx
      break if !data.ships[index]?
      fleet = data.ships[index]
      for sIdx in [1..6]
        index = 's' + sIdx
        break if !fleet[ship]?
        valueData.push window.i18n.resources.__ window.$ships[fleet[ship].id].api_name
        valueData.push fleet[ship].lv if fleet[ship].lv isnt null
        for iIdx in [1..5]
          index = 'i' + iIdx
          break if !fleet[ship].items[index]?
          valueData.push window.i18n.resources.__ window.$slotitems[fleet[ship].items[index].id].api_name
    valueData
  handleClick: (title) ->
    if title isnt @props.activeTitle
      @props.handleTitleClick title
  render: ->
    #dTitle = <span><FontAwesome name='plus-square-o' />{__('Add')}</span>
    dTitle = <FontAwesome name='plus-square-o' />
    <div style={flex: '0 1', maxWidth: 80, minWidth: 50}>
      <DropdownButton title={dTitle} key={0} id="henseinikki-add-dropdown">
        <MenuItem eventKey='1' onSelect={@props.handleAddDataClick}>{__ 'Add'}</MenuItem>
        <MenuItem eventKey='2' onSelect={@props.handleAddDataClick}>{__ 'Import'}</MenuItem>
        <MenuItem divider />
        <MenuItem eventKey='3' onSelect={@props.handleAddDataClick}>{__ 'Import records file'}</MenuItem>
        <MenuItem eventKey='4' onSelect={@props.handleAddDataClick}>{__ 'Export records file'}</MenuItem>
      </DropdownButton>
      <div style={flex: 1} className='titles-keywords'>
        <FormControl type='text'
                     value={@state.filterKey}
                     placeholder={__ 'Keywords'}
                     ref='keywords'
                     onChange={@handleKeyWordChange} />
      </div>
      <div>
        <ButtonGroup vertical bsSize='xsmall' className='titles-container'>
        {
          if @state.showData?
            if @state.showData.titles? and @state.showData.titles isnt []
              for title, index in @state.showData.titles
                <OverlayTrigger key={index} placement='right' overlay={
                  <Popover id="titles">
                    <div style={padding: 7}>
                      <div>{title}</div>
                      <div>
                        {
                          if @state.showData[title].tags.length != 0
                            for tag, tagIndex in @state.showData[title].tags
                              <Label style={display: 'inline-block', margin: 5, fontSize: 14}
                                     key={tagIndex}>
                               {tag}
                              </Label>
                        }
                      </div>
                    </div>
                  </Popover>
                }>
                  <Button style={margin: '0px'}
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
