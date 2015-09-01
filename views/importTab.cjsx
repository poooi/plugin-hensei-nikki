{React, ReactBootstrap, JSON, toggleModal} = window
{Grid, Row, Col, Button, Input} = ReactBootstrap
{openExternal} = require 'shell'
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n


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
    selectTitle: ''
    inputTitle: ''
    btnDisable: true
  #[[
  #  [shipid,[lv,-1],[slotId],[slotLv],[slotALv]],X6
  #],[],[],[]]
  importLogHandle: ->
    {importCode, inputTitle} = @state
    try
      importCode = JSON.parse importCode
      deck = {}
      for fleets in importCode
        continue if fleets is []
        for ship in fleets
          ship[0] = parseInt ship[0]
          if ship.length is 4
            ship.push []
        if !checkData(fleets)
          toggleModal __('Error'), __('Incorrect code.')
        else
          deck.ships = fleets
          deck.details = []
          for item in getDetails fleets
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
  handleTitleSelect: ->
    selectTitle = parseInt e.target.value
    @setState
      selectTitle: selectTitle
  handleExportClick: ->
    title = @props.henseiData.titles[@state.selectTitle]
    code = JSON.stringify @props.henseiData.title.ships
    code = '[' + code + ']'
    @setState
      code: code
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
        代码支持:
          <a onClick={openExternal.bind(this, 'http://fleet.diablohu.com')}>是谁呼叫舰队</a>,
          <a onClick={openExternal.bind(this, 'http://www.kancolle-calc.net/')}>艦載機厨デッキビルダー</a>。
      </span>
      <div className='container-col'>
        <div style={display: 'flex'}>
            <Input type='radio'
                   label={__ 'Import'}
                   onChange={@handleCilckRadio.bind(@, 0)}
                   checked={@state.checked[0]} />
            <Input type='radio'
                   label={__ 'Export'}
                   onChange={@handleCilckRadio.bind(@, 1)}
                   checked={@state.checked[1]} />
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
