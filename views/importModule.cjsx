{React, ReactBootstrap, JSON, toggleModal} = window
{Button, Input} = ReactBootstrap
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

getTyku = (deck) ->
  {$ships, $slotitems} = window
  basicTyku = alvTyku = totalTyku = 0
  for shipDetail in deck
    continue if shipDetail[0] is null
    ship = $ships[shipDetail[0]]
    for slotId, index in shipDetail[2]
      slot = $slotitems[slotId]
      # Basic tyku
      if slot.api_type[3] in [6, 7, 8]
        basicTyku += Math.floor(Math.sqrt(ship.api_maxeq[index]) * slot.api_tyku)
      else if slot.api_type[3] is 10 and slot.api_type[2] is 11
        basicTyku += Math.floor(Math.sqrt(ship.api_maxeq[index]) * slot.api_tyku)
      # Alv
      if shipDetail[4]? and shipDetail[4][index]? and shipDetail[4][index] isnt null
        if slot.api_type[3] is 6  and shipDetail[4][index] > 0 and shipDetail[4][index] <= 7
          alvTyku += [0, 1, 4, 6, 11, 16, 17, 25][shipDetail[4][index]]
        else if slot.api_type[3] in [7, 8] and shipDetail[4][index] is 7
          alvTyku += 3
        else if slot.api_type[3] is 10 and slot.api_type[2] is 11 and shipDetail[4][index] is 7
          alvTyku += 9

  basic: basicTyku
  alv: alvTyku

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
  handleInputTitleChange: ->
    inputTitle = @refs.inputTitle.getValue()
    if inputTitle? and inputTitle.length > 0 and @state.importCode.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      inputTitle: inputTitle
      btnDisable: btnDisable
  handleImportCodeChange: ->
    importCode = @refs.importCode.getValue()
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
      <Input type='text'
             label={__ 'Title'}
             placeholder={__ 'Title'}
             value={@state.inputTitle}
             hasFeedback
             ref='inputTitle'
             onChange={@handleInputTitleChange} />
      <Input style={height: '250px'}
             type='textarea'
             label={__ 'Import code'}
             placeholder={__ 'Import code'}
             value={@state.importCode}
             hasFeedback
             ref='importCode'
             onChange={@handleImportCodeChange} />
      <Button disabled={@state.btnDisable}
              onClick={@importHandler}
              block>
        {__ 'Import'}
      </Button>
    </div>

module.exports = ImportModule
