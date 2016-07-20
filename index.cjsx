{_, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, toggleModal} = window
fs = require 'fs-extra'
{relative, join} = require 'path-extra'

__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])

{Main} = require './views'

# Tyku
# 制空値= ∑ [艦載機の対空値 x √(搭載数) + √(熟練値/10) + 机种制空加值 ] ( [ ] 方括号代表取整)

aircraftExpTable = [0, 10, 25, 40, 55, 70, 85, 100, 121]

aircraftLevelBonus = {
  '6': [0, 0, 2, 5, 9, 14, 14, 22, 22]   # 艦上戦闘機
  '7': [0, 0, 0, 0, 0, 0, 0, 0, 0]       # 艦上爆撃機
  '8': [0, 0, 0, 0, 0, 0, 0, 0, 0]       # 艦上攻撃機
  '11': [0, 1, 1, 1, 1, 3, 3, 6, 6]      # 水上爆撃機
  '45': [0, 0, 2, 5, 9, 14, 14, 22, 22]  # 水上戦闘機
}

getTyku = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  minTyku = maxTyku = 0
  for shipId in deck.api_ship
    continue if shipId == -1
    ship = _ships[shipId]
    for itemId, slotId in ship.api_slot
      continue unless itemId != -1 && _slotitems[itemId]?
      item = _slotitems[itemId]
      tempTyku = 0.0
      # Basic tyku

      tempAlv = if item.api_alv? then item.api_alv else 0
      if item.api_type[3] in [6, 7, 8]
        tempTyku += Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku
        tempTyku += aircraftLevelBonus[item.api_type[3]][tempAlv]
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv + 1] / 10))

      else if item.api_type[3] == 10 && (item.api_type[2] == 11 || item.api_type[2] == 45)
        tempTyku += Math.sqrt(ship.api_onslot[slotId]) * item.api_tyku
        tempTyku += aircraftLevelBonus[item.api_type[2]][tempAlv]
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv + 1] / 10))

  min: minTyku
  max: maxTyku

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
      continue unless itemId != -1 && _slotitems[itemId]?
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
      continue unless itemId != -1 && _slotitems[itemId]?
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

  # Saku (33)
  # 索敵スコア = Sigma(CiSi) + Sigma(sqrt(s)) - Ceil(0.4H) + 2M
  #     Si(改修): 電探(1.25 * Sqrt(Star)) 水上偵察機(1.2 * Sqrt(Star))
  #     Ci(装備):
  #              6 0.6 艦上戦闘機
  #              7 0.6 艦上爆撃機
  #              8 0.8 艦上攻撃機
  #              9 1.0 艦上偵察機
  #             10 1.2 水上偵察機
  #             11 1.1 水上爆撃機
  #             12 0.6 小型電探
  #             13 0.6 大型電探
  #             26 0.6 対潜哨戒機
  #             29 0.6 探照灯
  #             34 0.6 司令部施設
  #             35 0.6 航空要員
  #             39 0.6 水上艦要員
  #             40 0.6 大型ソナー
  #             41 0.6 大型飛行艇
  #             42 0.6 大型探照灯
	#             45 0.6 水上戦闘機
  #             93 大型電探(II) null
  #             94 艦上偵察機(II) null
  #     S(各艦毎の素索敵)
  #     H(レベル)
  #     M(空き数)

getSaku33 = (deck) ->
  {$ships, $slotitems, _ships, _slotitems} = window
  totalSaku = shipSaku = itemSaku = teitokuSaku = 0
  shipCount = 6
  for shipId in deck.api_ship
    continue if shipId == -1
    shipCount -= 1
    ship = _ships[shipId]
    shipPureSaku = ship.api_sakuteki[0]
    for itemId, slotId in ship.api_slot
      continue unless itemId != -1 && _slotitems[itemId]?
      item = _slotitems[itemId]
      shipPureSaku -= item.api_saku
      switch item.api_type[2]
        when 8
          itemSaku += item.api_saku * 0.8
        when 9
          itemSaku += item.api_saku * 1.0
        when 10
          itemSaku += (item.api_saku + 1.2 * Math.sqrt(item.api_level)) * 1.2
        when 11
          itemSaku += item.api_saku * 1.1
        when 12
          itemSaku += (item.api_saku + 1.25 * Math.sqrt(item.api_level)) * 0.6
        when 13
          itemSaku += (item.api_saku + 1.25 * Math.sqrt(item.api_level)) * 0.6
        else
          itemSaku += item.api_saku * 0.6
    shipSaku += Math.sqrt(shipPureSaku)
  teitokuSaku = Math.ceil(window._teitokuLv * 0.4)
  totalSaku = shipSaku + itemSaku - teitokuSaku + 2 * shipCount

  ship: parseFloat(shipSaku.toFixed(4))
  item: parseFloat(itemSaku.toFixed(4))
  teitoku: parseFloat(teitokuSaku.toFixed(4))
  total: parseFloat(totalSaku.toFixed(4))

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
  saku33: getSaku33(_decks[deckId])

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
                    message.tyku.min,
                    message.tyku.max,
                    message.saku25.total,
                    message.saku25a.total,
                    message.saku33.total
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
  reactClass: React.createClass
    getInitialState: ->
      memberId: ''
      css: getCss()
    henseiData: {}
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
      window.addEventListener 'resize', @handleResize
    componentWillUnmount: ->
      window.removeEventListener 'game.response', @handleResponse
      window.removeEventListener 'resize', @handleResize
    handleResize: ->
      @setState
        css: getCss()
    handleResponse: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_get_member/require_info'
          memberId = body.api_basic.api_member_id
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
    addData: (title, deck, replace) ->
      data = @state.henseiData
      data[title] = deck
      if !replace
        data.titles.push title
      @saveData data
    handleAddData: (title, deck) ->
      data = @state.henseiData
      self = this
      if title in data.titles
        toggleModal __('Error'), __('The title is already exist. Do you want to replace it?'), [
          {
            name: __ 'Yes'
            func: -> self.addData title, deck, true
            style: 'success'
          },
          {
            name: __ 'No'
            style: 'primary'
          }
        ]
      else
        deck.v = 'min'
        @addData title, deck, false
    handleDeleteData: (delTitle) ->
      {henseiData} = @state
      for title in delTitle
        delete henseiData[title]
        for item,index in henseiData.titles
          if item is title
            henseiData.titles.splice(index, 1)
      @saveData henseiData
    handleTitleChange: (newTitle, oldTitle) ->
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
    render: ->
      <div id='HenseiNikki' className='HenseiNikki'>
        <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', 'hensei-nikki.css')} />
        <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', @state.css)} />
        <Main handleDeleteData={@handleDeleteData}
              saveData={@saveData}
              handleAddData={@handleAddData}
              handleTitleChange={@handleTitleChange}
              getDeckDetail={getDeckDetail}
              henseiData={@state.henseiData} />
      </div>
