{$, $$, _, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, toggleModal} = window
{PageHeader, Grid, Row, Col, Accordion, Panel, Button, Input, Well} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
CSON = require 'cson'

i18n = require './node_modules/i18n'
{__} = i18n

# i18n configure
i18n.configure({
    locales: ['en_US', 'ja_JP', 'zh_CN', 'zh_TW'],
    defaultLocale: 'zh_CN',
    directory: join(__dirname, "i18n"),
    updateFiles: false,
    indent: "\t",
    extension: '.json'
})
i18n.setLocale(window.language)


if config.get('poi.tabarea.double', false)
  HenseiDecks = require './deckItemsDT'
  cssName = "hensei-nikkiDT.css"
  doubleTab = true
else
  HenseiDecks = require './deckItemsST'
  doubleTab = false
  cssName = "hensei-nikkiST.css"

# Tyku
# 制空値 = [(艦載機の対空値) × √(搭載数)] の総計
getTyku = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  totalTyku = 0
  for shipId in deck.api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    for itemId, slotId in ship.api_slot
      continue if itemId == -1
      item = _slotitems[itemId]
      if item.api_type[3] in [6, 7, 8]
        totalTyku += Math.floor(Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku)
      else if item.api_type[3] == 10 && item.api_type[2] == 11
        totalTyku += Math.floor(Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku)
  totalTyku

# Saku (2-5 旧式)
# 偵察機索敵値×2 ＋ 電探索敵値 ＋ √(艦隊の装備込み索敵値合計 - 偵察機索敵値 - 電探索敵値)
getSaku25 = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  reconSaku = shipSaku = radarSaku = 0
  for shipId in deck.api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    shipSaku += ship.api_sakuteki[0]
    for itemId, slotId in ship.api_slot
      continue if itemId == -1
      item = _slotitems[itemId]
      switch item.api_type[3]
        when 9
          reconSaku += item.api_saku
          shipSaku -= item.api_saku
        when 10
          if item.api_type[2] == 10
            reconSaku += item.api_saku
            shipSaku -= item.api_saku
        when 11
          radarSaku += item.api_saku
          shipSaku -= item.api_saku
  reconSaku = reconSaku * 2.00
  shipSaku = Math.sqrt(shipSaku)
  totalSaku = reconSaku + radarSaku + shipSaku

  recon: parseFloat(reconSaku.toFixed(2))
  radar: parseFloat(radarSaku.toFixed(2))
  ship: parseFloat(shipSaku.toFixed(2))
  total: parseFloat(totalSaku.toFixed(2))

# Saku (2-5 秋式)
# 索敵スコア = 艦上爆撃機 × (1.04) + 艦上攻撃機 × (1.37) + 艦上偵察機 × (1.66) + 水上偵察機 × (2.00)
#            + 水上爆撃機 × (1.78) + 小型電探 × (1.00) + 大型電探 × (0.99) + 探照灯 × (0.91)
#            + √(各艦毎の素索敵) × (1.69) + (司令部レベルを5の倍数に切り上げ) × (-0.61)
getSaku25a = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  totalSaku = shipSaku = itemSaku = teitokuSaku = 0
  for shipId in deck.api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    shipPureSaku = ship.api_sakuteki[0]
    for itemId, slotId in ship.api_slot
      continue if itemId == -1
      item = _slotitems[itemId]
      shipPureSaku -= item.api_saku
      switch item.api_type[3]
        when 7
          itemSaku += item.api_saku * 1.04
        when 8
          itemSaku += item.api_saku * 1.37
        when 9
          itemSaku += item.api_saku * 1.66
        when 10
          if item.api_type[2] == 10
            itemSaku += item.api_saku * 2.00
          else if item.api_type[2] == 11
            itemSaku += item.api_saku * 1.78
        when 11
          if item.api_type[2] == 12
            itemSaku += item.api_saku * 1.00
          else if item.api_type[2] == 13
            itemSaku += item.api_saku * 0.99
        when 24
          itemSaku += item.api_saku * 0.91
    shipSaku += Math.sqrt(shipPureSaku) * 1.69
  teitokuSaku = 0.61 * Math.floor((window._teitokuLv + 4) / 5) * 5
  totalSaku = shipSaku + itemSaku - teitokuSaku

  ship: parseFloat(shipSaku.toFixed(2))
  item: parseFloat(itemSaku.toFixed(2))
  teitoku: parseFloat(teitokuSaku.toFixed(2))
  total: parseFloat(totalSaku.toFixed(2))

getDeckMessage = (deckId) ->
  {$ships, $slotitems, _ships} = window
  totalLv = totalShip = 0
  for shipId in _decks[deckId].api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    totalLv += ship.api_lv
    totalShip += 1
  avgLv = totalLv / totalShip

  totalLv: totalLv
  avgLv: parseFloat(avgLv.toFixed(0))
  tyku: getTyku(_decks[deckId])
  saku25: getSaku25(_decks[deckId])
  saku25a: getSaku25a(_decks[deckId])


AddDataPanel = React.createClass
  getInitialState: ->
    btnDisable: true
  handleInputChange: ->
    @props.getTitleInput @refs.title.getValue()
    if !@refs.title.getValue()? or @refs.title.getValue() is "" or @props.title is ""
      btnDisable = true
    else
      btnDisable = false
    @setState
      btnDisable: btnDisable
  render: ->
    <Panel collapsible expanded={@props.panelShow}>
        <Grid>
          <Row>
            <Col xs={5} xsOffset={1}>
              <Input type='select' label={__ "select fleet"} value={@props.deckId} onChange={@props.handleDeckSelect}>
                {
                  if @props.decks?
                    for deck,index in @props.decks
                      <option value={index} key={index}>{deck.api_name}</option>
                }
              </Input>
            </Col>
            <Col xs={5}>
              <Input type='text'
                     value={@props.title}
                     label={__ "title"}
                     placeholder={__ "title"}
                     hasFeedback
                     ref='title'
                     onChange={@handleInputChange}
                     />
            </Col>
          </Row>
          <Row>
            <Col xs={4} xsOffset={7}>
              <Button bsStyle='default' bsSize='small' disabled={@state.btnDisable} onClick={@props.handleSaveClick} block>
                {__ "save"}
              </Button>
            </Col>
          </Row>
        </Grid>
    </Panel>

module.exports =
  name: "HenseiNikki"
  displayName: <span><FontAwesome key={0} name='pancil-square-o' />{__ "Organization Records"}</span>
  priority: 7
  author: "Rui"
  link: "https://github.com/ruiii"
  description: "记录编成信息"
  version: "1.0.0"
  reactClass: React.createClass
    getInitialState: ->
      panelShow: false
      deckId: 0
      filterKey: ''
      memberId: ""
      henseiData: {}
      title: ""
    tempData: {}
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
    handleResponse: (e) ->
      {method, path, body, postBody} = e.detail
      switch path
        when '/kcsapi/api_get_member/basic'
          memberId = body.api_member_id
          @getDataFromFile memberId
          @setState
            memberId: memberId
          window.removeEventListener 'game.response', @handleResponse
    getDeckDetail: ->
      shipsDetail = {}
      count = 0
      for shipId in _decks[@state.deckId].api_ship
        continue if shipId is -1
        count += 1
        ship = _ships[shipId]
        lv = ship.api_lv
        shipInfo = $ships[ship.api_ship_id]
        name = shipInfo.api_name
        type = $shipTypes[shipInfo.api_stype].api_name
        slotsDetail = []
        for slotId, index in ship.api_slot
          continue if slotId is -1
          slotType = _slotitems[slotId].api_type[3]
          slotName = _slotitems[slotId].api_name
          slotLv = _slotitems[slotId].api_level
          slotsDetail[index] = [slotType, slotName, slotLv]
        shipsDetail[count] =
          shipName: name
          shipLv: lv
          shipType: type
          slots: slotsDetail
      messages = getDeckMessage @state.deckId
      deckDetail =
        totalLv: messages.totalLv
        avgLv: messages.avgLv
        tyku: messages.tyku
        saku25: messages.saku25.total
        saku25a: messages.saku25a.total
        shipsCount: count
        ships: shipsDetail
    getDataFromFile: (memberId) ->
      data = {}
      try
        fs.ensureDirSync(join(APPDATA_PATH, 'hensei-nikki'))
        console.log "get data from hensei-nikki"
        data = CSON.parseCSONFile(join(APPDATA_PATH, 'hensei-nikki', "#{memberId}.cson"))
      catch e
        error "Read hensei error!#{e}"
      if !data.titles?
        data.titles = []
      @setState
        henseiData: data
        tempData: data
    handleDeckSelect: (e) ->
      deckId = parseInt e.target.value
      @setState
        deckId: deckId
    handleAddDataClick: ->
      @setState
        panelShow: !@state.panelShow
    handleSaveClick: ->
      {tempData, title} = @state
      data = tempData
      if title in data.titles
        toggleModal(__("save error"), __("The title is already exist."))
        @setState
          title: ""
          deckId: 0
          panelShow: false
      else
        data[title] = @getDeckDetail()
        data.titles.push(title)
        try
          fs.writeFileSync(join(APPDATA_PATH, 'hensei-nikki', "#{@state.memberId}.cson"), CSON.stringify(data), null, 2)
        catch e
          error "Write hensei error!#{e}"
        console.log "save data to hensei-nikki"
        @setState
          panelShow: false
          henseiData: data
          tempData: data
    getDataValue: (data, title) ->
      valueData = []
      valueData.push(title)
      valueData.push(data.totalLv)
      valueData.push(data.avgLv)
      valueData.push(data.tyku)
      valueData.push(data.saku25)
      valueData.push(data.saku25a)
      for count in [1..data.shipsCount]
        valueData.push(data.ships[count].shipName)
        valueData.push(data.ships[count].shipLv)
        valueData.push(data.ships[count].shipType)
        for slot in data.ships[count].slots
          valueData.push(slot[1])
      valueData
    handleKeyWordChange: ->
      key = @refs.keyWord.getValue()
      @filterBuffer key
    _filter: (keyWord, filterData) ->
      if keyWord?
        filterData.filter (data) ->
          match = false
          for item, index in data
            key = item.toString().toLowerCase().trim().indexOf(keyWord.toString().toLowerCase().trim())
            if key >= 0
              match = true
          match
      else filterData
    filterBuffer: (key) ->
      {tempData} = @state
      if tempData.titles isnt []
        filterData = []
        for title in tempData.titles
          filterData.push(@getDataValue(tempData[title], title))
        matchData = @_filter(key, filterData)
        showData = {}
        showData.titles = []
        for deck in matchData
          showData.titles.push(deck[0])
          showData[deck[0]] = tempData[deck[0]]
        @setState
          filterKey: key
          henseiData: showData
    getTitleInput: (title) ->
      @setState
        title: title
    render: ->
      <div>
        <link rel="stylesheet" href={join(relative(ROOT, __dirname), 'assets', cssName)} />
        <Well>"11"</Well>
        <Grid>
          <Row>
            <Col xs={5} xsOffset={1} >
              <Button bsStyle='default' bsSize='medium' onClick={@handleAddDataClick} block>
                {__ "add record"}
              </Button>
            </Col>
            <Col xs={5}>
              <Input
                type='text'
                value={@state.filterKey}
                placeholder={__ "keywords"}
                hasFeedback
                ref='keyWord'
                onChange={@handleKeyWordChange} />
            </Col>
          </Row>
          <Row>
            <AddDataPanel panelShow={@state.panelShow}
                          deckId={@state.deckId}
                          decks={window._decks}
                          title={@state.title}
                          handleDeckSelect={@handleDeckSelect}
                          handleSaveClick={@handleSaveClick}
                          getTitleInput={@getTitleInput}/>
          </Row>
          <Row>
            <HenseiDecks henseiData={@state.henseiData}/>
          </Row>
        </Grid>
      </div>
