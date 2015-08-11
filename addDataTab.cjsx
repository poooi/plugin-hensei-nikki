{_, React, ReactBootstrap} = window
{Grid, Row, Col, Button, Input, Well, Collapse} = ReactBootstrap
{join} = require 'path-extra'

i18n = require './node_modules/i18n'
{__} = i18n

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


AddDataTab = React.createClass
  getInitialState: ->
    title: ''
    deckId: 0
    btnDisable: true
  componentWillReceiveProps: (nextProps)->
    if nextProps.indexKey is nextProps.selectedKey
      @setState
        btnDisable: true
        deckId: 0
        title: ''
  getDeckDetail: ->
    {deckId} = @state
    shipsDetail = []
    for shipId in _decks[deckId].api_ship
      continue if shipId is -1
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
      shipsDetail.push [name, lv, type, slotsDetail]
    messages = getDeckMessage @state.deckId

    deckDetail =
      details: [
        messages.totalLv
        messages.avgLv
        messages.tyku
        messages.saku25.total
        messages.saku25a.total
      ]
      ships: shipsDetail

  handleInputChange: ->
    title = @refs.title.getValue()
    if title? and title.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      title: title
      btnDisable: btnDisable
  handleSaveClick: ->
    deck = @getDeckDetail()
    @props.saveDataToFile(@state.title, deck)
  handleDeckSelect: (e) ->
    deckId = parseInt e.target.value
    @setState
      deckId: deckId
  render: ->
    <Grid>
      <Row>
        <Col xs={5} xsOffset={1}>
          <Input type='select'
                 label={__ "select fleet"}
                 value={@state.deckId}
                 onChange={@handleDeckSelect}>
            {
              if window._decks?
                for deck, index in window._decks
                  <option value={index} key={index}> {deck.api_name} </option>
            }
          </Input>
        </Col>
        <Col xs={5}>
          <Input type='text'
                 label={__ "title"}
                 placeholder={__ "title"}
                 value={@state.title}
                 hasFeedback
                 ref='title'
                 onChange={@handleInputChange}
                 />
        </Col>
        <Col xs={4} xsOffset={7}>
          <Button bsStyle='default'
                  bsSize='small'
                  disabled={@state.btnDisable}
                  onClick={@handleSaveClick}
                  block>
            {__ "save"}
          </Button>
        </Col>
      </Row>
    </Grid>

module.exports = AddDataTab
