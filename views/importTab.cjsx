{React, ReactBootstrap, JSON, toggleModal} = window
{Button, Input} = ReactBootstrap
{openExternal} = require 'shell'
fs = require 'fs-extra'
{join} = require 'path-extra'
remote = require 'remote'
dialog = remote.require 'dialog'
i18n = require '../node_modules/i18n'
{__} = i18n

emptyShip = [null, [null, -1], [], [], []]

handleSlot = (slots) ->
  slotId = []
  slotLv = []
  for i in [1..4]
    slot = 'i' + i.toString()
    if slots.hasOwnProperty slot
      slotId.push slots[slot].id
      if slots[slot].rf > 0
        slotLv.push slots[slot].rf
      else
        slotLv.push null
  if slots.ix?.id?
    slotId.push slots.ix.id
    slotLv.push null

  ids: slotId
  lvs: slotLv



handleFleet = (fleet) ->
  ship = Object.clone emptyShip
  ship[0] = parseInt fleet.id
  ship[1][0] = fleet.lv
  ship[1][1] = fleet.luck
  slots = handleSlot fleet.items
  ship[2] = slots.ids
  ship[3] = slots.lvs

  ship

codeConversion = (code) ->
  fleet = []
  for i in [1..6]
    ship = 's' + i.toString()
    if code.hasOwnProperty(ship) and code[ship].id?
      fleet[i - 1] = handleFleet code[ship]

  fleet

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

ImportTab = React.createClass
  getInitialState: ->
    checked: [true, false]
    importFlag: true
    importCode: []
    code: ''
    selectTitle: 0
    inputTitle: ''
    btnDisable: true
    fileDisable: true
  componentWillUpdate: (nextProps, nextState) ->
    if nextProps.henseiData? and nextProps.henseiData.titles? and nextState.fileDisable
      @setState
        fileDisable: false
  #[[
  #  [shipid,[lv,-1],[slotId],[slotLv],[slotALv]],X6
  #],[],[],[]]
  importLogHandle: ->
    {importCode, inputTitle} = @state
    importCode = JSON.parse importCode
    try
      if importCode.version?
        if importCode.f2?
          toggleModal __('Error'), __('Not support combie fleet.')
        else
          fleet = codeConversion importCode.f1
      else
        flag = true
        for fleet, index in importCode
          continue if index is 0
          if fleet.length isnt 0
            flag = false
        if flag
          for fleet in importCode
            continue if fleet.length is 0
            for ship in fleet
              ship[0] = parseInt ship[0]
              if ship.length is 4
                ship.push []
        else
          toggleModal __('Error'), __('Not support combie fleet.')
      if !checkData(fleet)
        toggleModal __('Error'), __('Incorrect code.')
      else
        deck = {}
        deck.ships = fleet
        deck.details = []
        for item in getDetails fleet
          deck.details.push item
        deck.comment = ''
        deck.tags = ''
        @props.handleAddData inputTitle, deck

    catch e
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
  handleTitleSelect: (e) ->
    selectTitle = parseInt e.target.value
    @setState
      selectTitle: selectTitle
  handleExportClick: ->
    title = @props.henseiData.titles[@state.selectTitle]
    code = JSON.stringify @props.henseiData[title].ships
    code = '[' + code + ']'
    @setState
      code: code
  handleFileImportClick: ->
    henseiData = @props.henseiData
    filename = dialog.showOpenDialog
      title: __ 'Import records file'
      filters: [
        {
          name: "json file"
          extensions: ['json']
        }
      ]
      properties: ['openFile']
    if filename?[0]?
      try
        fs.accessSync(filename[0], fs.R_OK)
        fileContentBuffer = fs.readJSONSync filename[0]
        flag = false
        for title in fileContentBuffer.titles
          continue if title in henseiData.titles
          henseiData.titles.push title
          henseiData[title] = fileContentBuffer[title]
          flag = true
        if flag
          @props.saveData henseiData
      catch e
        console.log e.message
        throw e
  handleFileExportClick: ->
    filename = dialog.showSaveDialog
      title: __ 'Export records file'
      defaultPath: "HenseiNikki.json"
    if filename?
      fs.writeFile filename, JSON.stringify(@props.henseiData), (err)->
        if err
          console.log "err! Save data error"
  handleCilckRadio: (index) ->
    {checked} = @state
    for item in [0, 1]
      if index is item
        checked[item] = true
      else
        checked[item] = false
    if index is 0
      importFlag = true
    else
      importFlag = false
    @setState
      checked: checked
      importFlag: importFlag
  render: ->
    <div className='tab-container'>
      <span>
        {__ 'Support'}:
          <a onClick={openExternal.bind(this, 'http://fleet.diablohu.com')}>是谁呼叫舰队</a>,
          <a onClick={openExternal.bind(this, 'http://www.kancolle-calc.net/')}>艦載機厨デッキビルダー</a>。
      </span>
      <div className='container-col'>
        <div style={display: 'flex', padding: 7}>
            <Input type='radio'
                   label={__ 'Import'}
                   onChange={@handleCilckRadio.bind(@, 0)}
                   checked={@state.checked[0]} />
            <Input type='radio'
                   label={__ 'Export'}
                   onChange={@handleCilckRadio.bind(@, 1)}
                   checked={@state.checked[1]} />
            <Button onClick={@handleFileImportClick}
                    disabled={@state.fileDisable}
                    style={height: '50%'}>
              {__ 'Import records file'}
            </Button>
            <Button onClick={@handleFileExportClick}
                    disabled={@state.fileDisable}
                    style={height: '50%'}>
              {__ 'Export records file'}
            </Button>
        </div>
        <div className={if @state.importFlag then 'show' else 'hidden'}>
          <Input type='text'
                 label={__ 'Title'}
                 placeholder={__ 'Title'}
                 value={@state.inputTitle}
                 hasFeedback
                 ref='inputTitle'
                 onChange={@handleInputTitleChange} />
          <Input style={height: '150px'}
                 type='textarea'
                 label={__ 'Import code'}
                 placeholder={__ 'Import code'}
                 value={@state.importCode}
                 hasFeedback
                 ref='importCode'
                 onChange={@handleImportCodeChange} />
          <Button disabled={@state.btnDisable}
                  onClick={@importLogHandle}
                  block>
            {__ 'Import'}
          </Button>
        </div>
        <div className={if @state.importFlag then 'hidden' else 'show'}>
          <div className='container-col'>
            <Input type='select'
                   label={__ 'Select title'}
                   value={@state.selectTitle}
                   onChange={@handleTitleSelect}>
              {
                if @props.henseiData?
                  for title, index in @props.henseiData.titles
                    <option value={index} key={index}>{title}</option>
              }
            </Input>
            <Button onClick={@handleExportClick} block>
              {__ 'Export'}
            </Button>
          </div>
          <Input style={height: '150px'}
                 type='textarea'
                 label={__ 'Code'}
                 placeholder={__ 'Code'}
                 value={@state.code}
                 hasFeedback
                 ref='code' />
        </div>
      </div>
    </div>

module.exports = ImportTab
