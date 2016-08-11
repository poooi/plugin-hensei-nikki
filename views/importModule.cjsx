{React, ReactBootstrap, JSON, toggleModal} = window
{Button, FormControl} = ReactBootstrap
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])

emptyShip = [null, [null, -1], [], [], []]

handleSlot = (slots) ->
  slotId = []
  slotLv = []
  slotAlv = []
  for i in [1..4]
    slot = 'i' + i.toString()
    if slots.hasOwnProperty(slot)
      slotId.push slots[slot].id
      if slots[slot].rf > 0
        slotLv.push slots[slot].rf
      else
        slotLv.push null
      if slots[slot].rp? > 0
        slotAlv.push slots[slot].rp
      else
        slotAlv.push null
  if slots.ix?.id?
    slotId.push slots.ix.id
    slotLv.push null

  ids: slotId
  lvs: slotLv
  alvs: slotAlv

handleShip = (ship) ->
  shipDetail = Object.clone emptyShip
  shipDetail[0] = parseInt ship.id
  shipDetail[1][0] = ship.lv
  shipDetail[1][1] = ship.luck
  slots = handleSlot ship.items
  shipDetail[2] = slots.ids
  shipDetail[3] = slots.lvs
  shipDetail[4] = slots.alvs

  shipDetail

handleFleet = (fleet) ->
  newfleet = []
  for i in [1..6]
    ship = 's' + i
    if fleet.hasOwnProperty(ship) and fleet[ship].id?
      newfleet.push handleShip fleet[ship]

  newfleet

codeConversion = (code) ->
  newCode = [[], [], [], []]
  for i in [1..4]
    fleet = 'f' + i
    if code.hasOwnProperty(fleet) and code[fleet].s1?
      newCode[i - 1] = handleFleet code[fleet]
  newCode

battleDetail2Code = (code) ->
  newCode = [[], [], [], []]
  newfleet = []
  for shipId, index in code.poi_sortie_fleet
    newShip = Object.clone emptyShip
    newShip[0] = shipId
    newShip[2] = code.poi_sortie_equipment[index].filter (item) -> item isnt null
    newCode[0].push newShip
  if code.poi_combined_fleet.length > 0
    for shipId, index in poi_combined_fleet
      newShip = Object.clone emptyShip
      newShip[0] = shipId
      newShip[2] = code.poi_combined_equipment[index].filter (item) -> item isnt null
      newCode[1].push newShip
  newCode

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
  for shipDetail in deck
    continue if shipDetail[0] is null
    ship = $ships[shipDetail[0]]
    for slotId, index in shipDetail[2]
      slot = $slotitems[slotId]
      tempTyku = 0.0
      # Basic tyku
      tempAlv = if shipDetail[3][index] then shipDetail[3][index] else 0
      if slot.api_type[3] in [6, 7, 8]
        tempTyku += Math.sqrt(ship.api_maxeq[index]) * slot.api_tyku
        tempTyku += aircraftLevelBonus[slot.api_type[3]][tempAlv]
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv + 1] / 10))

      else if slot.api_type[3] == 10 && (slot.api_type[2] == 11 || slot.api_type[2] == 45)
        tempTyku += Math.sqrt(ship.api_maxeq[index]) * slot.api_tyku
        tempTyku += aircraftLevelBonus[slot.api_type[2]][tempAlv]
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv + 1] / 10))

  basic: minTyku
  alv: maxTyku


getDetails = (deck) ->
  totalLv = 0
  for ship in deck
    continue if ship[0] is null
    totalLv += ship[1][0]
  tyku = getTyku(deck)

  [totalLv,
   tyku.basic,
   tyku.alv]

checkData = (data) ->
  matchFlag = true
  try
    for ship in data
      continue if ship.length is 0
      if ship.length < 4
        matchFlag = false
        break
      if !window.$ships[ship[0]]?
        matchFlag = false
        break
      if ship[1].length isnt 2
        matchFlag = false
        break
      for slotId in ship[2]
        if !window.$slotitems[slotId]?
          matchFlag = false
          break
      for slotlv in ship[3]
        if ship[3].length? and ship[2].length? and ship[3].length > ship[2].length
          matchFlag = false
          break
      if ship[4]? and ship[4].length? and ship[2].length? and ship[4].length > ship[2].length
        matchFlag = false
        break
  catch e
    matchFlag = false
    throw e
  matchFlag

ImportModule = React.createClass
  getInitialState: ->
    code: ''
    inputTitle: ''
    btnDisable: true
  componentWillReceiveProps: (nextProps) ->
    if nextProps.status isnt @props.status and nextProps.status is 'import'
      @setState
        code: ''
        inputTitle: ''
        btnDisable: true
  importHandler: ->
    {importCode, inputTitle} = @state
    importCode = JSON.parse importCode
    try
      if importCode.version?
        fleets = codeConversion importCode
      else if importCode.poi_sortie_fleet?
        fleets = battleDetail2Code importCode
      else
        fleets = []
        for fleet, index in importCode
          continue if fleet.length is 0
          for ship in fleet
            continue if !ship[0]? or ship.length is 0
            ship[0] = parseInt ship[0]
            if ship.length is 4
              ship.push []
          fleets[index] = fleet.filter (ship) -> ship[0] isnt null
      flag = false
      for fleet in fleets
        break if fleet.lenth is 0
        if !checkData(fleet)
          flag = true
          break
      if flag
        toggleModal __('Error'), __('Incorrect code.')
      else
        deck = {}
        deck.ships = fleets
        deck.details = []
        for fleet in fleets
          detail = []
          for item in getDetails fleet
            detail.push item
          deck.details.push detail
        deck.tags = ''
        @props.handleAddData inputTitle, deck
    catch e
      toggleModal __('Error'), __('Incorrect code.')
      throw e
    @setState
      inputTitle: ''
      importCode: ''
  handleInputTitleChange: (e) ->
    inputTitle = e.target.value
    if inputTitle? and inputTitle.length > 0 and @state.importCode?.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      inputTitle: inputTitle
      btnDisable: btnDisable
  handleImportCodeChange: (e) ->
    importCode = e.target.value
    if importCode? and importCode.length > 0 and @state.inputTitle.length >0
      btnDisable = false
    else
      btnDisable = true
    @setState
      importCode: importCode
      btnDisable: btnDisable
  render: ->
    <div style={width: '99%'}>
      <Button bsSize='small'
              onClick={@props.handleBackClick}
              style={margin: 10}>
        <FontAwesome name='arrow-left' />
      </Button>
      <FormControl type='text'
                   label={__ 'Title'}
                   placeholder={__ 'Title'}
                   value={@state.inputTitle}
                   ref='inputTitle'
                   onChange={@handleInputTitleChange} />
      <FormControl style={height: '250px'}
                   componentClass='textarea'
                   label={__ 'Import code'}
                   placeholder={__ 'Import code'}
                   value={@state.importCode}
                   ref='importCode'
                   onChange={@handleImportCodeChange} />
      <Button disabled={@state.btnDisable}
              onClick={@importHandler}
              block>
        {__ 'Import'}
      </Button>
    </div>

module.exports = ImportModule
