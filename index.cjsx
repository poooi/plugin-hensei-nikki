{_, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, toggleModal, JSON} = window
{Tabs, Tab} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
i18n = require './node_modules/i18n'

# i18n configure
i18n.configure({
    locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
    defaultLocale: 'zh-CN',
    directory: join(__dirname, 'assets', 'i18n'),
    updateFiles: false,
    indent: '\t',
    extension: '.json'
})
i18n.setLocale(window.language)
{__} = i18n

{HenseiList, EditDataTab} = require './views'

getTyku = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  basicTyku = alvTyku = totalTyku = 0
  for shipId in deck.api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    for itemId, slotId in ship.api_slot
      continue if itemId == -1
      item = _slotitems[itemId]
      # Basic tyku
      if item.api_type[3] in [6, 7, 8]
        basicTyku += Math.floor(Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku)
      else if item.api_type[3] == 10 && item.api_type[2] == 11
        basicTyku += Math.floor(Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku)
      # Alv
      if item.api_type[3] == 6 && item.api_alv > 0 && item.api_alv <= 7
        alvTyku += [0, 1, 4, 6, 11, 16, 17, 25][item.api_alv]
      else if item.api_type[3] in [7, 8] && item.api_alv == 7
        alvTyku += 3
      else if item.api_type[3] == 10 && item.api_type[2] == 11 && item.api_alv == 7
        alvTyku += 9
  totalTyku = basicTyku + alvTyku

  basic: basicTyku
  alv: alvTyku
  total: totalTyku

# Saku (2-5 旧式)
# 偵察機索敵値×2 ＋ 電探索敵値 ＋ √(艦隊の装備込み索敵値合計 - 偵察機索敵値 - 電探索敵値)
getSaku25 = (deck) ->
  {_ships, _slotitems} = window
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
  {_ships, _slotitems} = window
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
  {_ships, _decks} = window
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

isNull = (item) ->
  item is null

# [shipId, [lv, luck], [slotId], [slotLv], [slotALv]]
emptyShip = [null, [null, -1], [], [], []]
# {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}

getShipsDetail = (deckId) ->
  {_ships, _slotitems, _decks} = window
  shipsDetail = []
  for shipId in _decks[deckId].api_ship
    shipDetail = Object.clone emptyShip
    if shipId isnt -1
      ship = _ships[shipId]
      shipDetail[0] = ship.api_ship_id
      shipDetail[1][0] = ship.api_lv
      shipDetail[1][1] = ship.api_luck[0]
      #shipDetail[1][1] = -1
      for slotId, index in ship.api_slot
        continue if slotId is -1
        shipDetail[2].push _slotitems[slotId].api_slotitem_id
        if _slotitems[slotId].api_level is 0
          shipDetail[3].push null
        else
          shipDetail[3].push _slotitems[slotId].api_level
        if _slotitems[slotId].api_alv?
          shipDetail[4].push _slotitems[slotId].api_alv
        else
          shipDetail[4].push null
      shipDetail[3] = [] if shipDetail[3].every isNull
      shipDetail[4] = [] if shipDetail[4].every isNull
    shipsDetail.push shipDetail
  shipsDetail

getDeckDetail = (deckChecked, tags)->
  shipsDetail = []
  decks = []
  messages = []
  for deck, index in deckChecked
    if deck
      decks.push index
  for deckId in decks
    shipsDetail.push getShipsDetail deckId
    message = getDeckMessage deckId
    messages.push [
                    message.totalLv,
                    message.tyku.basic,
                    message.tyku.alv,
                    message.saku25.total,
                    message.saku25a.total
                  ]

  details: messages
  ships: shipsDetail
  tags: tags

getCss = ->
  {doubleTabbed} = window
  if doubleTabbed then width = 800 else width = 400
  if config.get('poi.layout', 'horizontal') == 'horizontal' then area = 'poi-app' else area = 'body'
  if $("#{area}").clientWidth < width then css = 'ship-item-horizontal.css' else css = 'ship-item-vertical.css'
  css

module.exports =
  name: 'HenseiNikki'
  displayName: <span><FontAwesome key={0} name='folder-open' /> {__ 'Display Name'}</span>
  priority: 7
  author: 'Rui'
  link: 'https://github.com/ruiii'
  description: __ 'Description'
  version: '3.4.0'
  reactClass: React.createClass
    getInitialState: ->
      memberId: ''
      css: getCss()
    henseiData: {}
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
      window.addEventListener 'resize', @handleResize
    handleResize: ->
      @setState
        css: getCss()
    handleResponse: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_get_member/basic'
          memberId = body.api_member_id
          @getDataFromFile memberId
          window.removeEventListener 'game.response', @handleResponse
    getDataFromFile: (memberId) ->
      data = {}
      try
        fs.ensureDirSync join(APPDATA_PATH, 'hensei-nikki')
        data = fs.readJSONSync join(APPDATA_PATH, 'hensei-nikki', "#{memberId}.json")
      catch e
        console.log "Read hensei error!#{e}" if process.env.DEBUG?
      if !data.titles?
        data.titles = []
      @setState
        henseiData: data
        memberId: memberId
    handleAddData: (title, deck) ->
      data = @state.henseiData
      if title in data.titles
        toggleModal __('Error'), __('The title is already exist.')
      else
        data[title] = deck
        data.titles.push title
        @saveData data
    handleDeleteData: (delTitle) ->
      {henseiData} = @state
      for title in delTitle
        delete henseiData[title]
        for item,index in henseiData.titles
          if item is title
            henseiData.titles.splice(index, 1)
      @saveData henseiData
    handleTitleChang: (newTitle, oldTitle) ->
      {henseiData} = @state
      henseiData[newTitle] = henseiData[oldTitle]
      delete henseiData[oldTitle]
      idx = henseiData.titles.indexOf oldTitle
      henseiData.titles[idx] = newTitle
      @saveData henseiData
    saveData: (data) ->
      try
        fs.writeJSONSync join(APPDATA_PATH, 'hensei-nikki', "#{@state.memberId}.json"), data
      catch e
        console.log "Write hensei error!#{e}"
      @setState
        henseiData: data
    handleSelectTab: (selectedKey) ->
      @setState
        selectedKey: selectedKey
    render: ->
      <div>
      <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', 'hensei-nikki.css')} />
      <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', @state.css)} />
        <Tabs activeKey={@state.selectedKey} onSelect={@handleSelectTab} animation={false}>
          <Tab eventKey={1} title={__ 'Records'}>
            <HenseiList indexKey={0}
                        selectedKey={@state.selectedKey}
                        handleDeleteData={@handleDeleteData}
                        saveData={@saveData}
                        handleTitleChang={@handleTitleChang}
                        henseiData={@state.henseiData} />
          </Tab>
          <Tab eventKey={2} title={__ 'Edit'}>
            <EditDataTab indexKey={1}
                         selectedKey={@state.selectedKey}
                         henseiData={@state.henseiData}
                         getDeckDetail={getDeckDetail}
                         handleAddData={@handleAddData}
                         handleDeleteData={@handleDeleteData}
                         saveData={@saveData} />
          </Tab>
        </Tabs>
      </div>
