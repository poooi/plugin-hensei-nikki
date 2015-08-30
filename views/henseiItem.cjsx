{React, ReactBootstrap, FontAwesome} = window
{Grid, Row, Col, OverlayTrigger, Tooltip, Table, Button, Input} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

# [shipId, [lv, cond], [slotId], [slotLv], [slotALv]]

ShipItem = React.createClass
  render: ->
    <div className='ship-item'>
      {
        ship = window.$ships[@props.ship[0]]
        name = ship.api_name
        type = window.$shipTypes[ship.api_stype].api_name
        <div className='ship-detail'>
          <span className='ship-name'>{name}</span>
          <span>Lv.{@props.ship[1][0]}</span>
          <span>{type}</span>
        </div>
      }
      <div className='slot-detail'>
        {
          for slotId, index in @props.ship[2]
            continue if slotId is null
            slot = window.$slotitems[slotId]
            name = slot.api_name
            type = slot.api_type[3]
            if @props.ship[3] isnt [] and @props.ship[3][index]?
              lv = @props.ship[3][index]
            else
              lv = null
            if @props.ship[4]? and @props.ship[4] isnt [] and @props.ship[4][index]? and @props.ship[4][index] isnt null
              alv = @props.ship[4][index]
            else
              alv = 0
            <div key={index} className='slotitem-container'>
              <span>
                <img src={join('assets', 'img', 'slotitem', "#{type + 100}.png")} />
              </span>
              <span className='slot-name'>{name}</span>
              <span>
                  {if lv? and lv isnt null then <strong style={color: '#45A9A5'}>★+{lv}</strong> else ''}
                  &nbsp;&nbsp;{
                    if alv? and alv >=1 and alv <= 3
                      for j in [1..alv]
                        <strong key={j} style={color: '#3EAEFF'}>|</strong>
                    else if alv? and alv >= 4 and alv <= 6
                      for j in [1..alv - 3]
                        <strong key={j} style={color: '#F9C62F'}>\</strong>
                    else if alv? and alv >= 7 and alv <= 9
                      <strong key={j} style={color: '#F9C62F'}>
                        <FontAwesome key={0} name='angle-double-right' />
                      </strong>
                    else if alv? and alv >= 9
                      <strong key={j} style={color: '#F94D2F'}>★</strong>
                    else ''
                  }
             </span>
          </div>
        }
      </div>
    </div>

HenseiItem = React.createClass
  getInitialState: ->
    deckId: 0
    isChecking: false
    disable: true
  getStatusStyle: (status) ->
    flag = status.reduce (a, b) -> a or b
    if flag? and flag
      return {opacity: 0.4}
    else
      return {}
  handleDeckSelect: (e) ->
    deckId = parseInt e.target.value
    @setState
      deckId: deckId
  handleCheckClick: ->
    @props.handleCheck()
    #if @state.isChecking
    #  window.removeEventListener 'game.response', @handleResponse
    #else
    #  window.addEventListener 'game.response', @handleResponse
    @setState
      isChecking: !@state.isChecking
  handleResponse: (e) ->
    {path, body} = e.detail
    refreshFlag = false
    switch path
      when '/kcsapi/api_req_hensei/change'
        refreshFlag = true
      when '/kcsapi/api_req_kaisou/slotset'
        refreshFlag = true
    if refreshFlag
      @checkDeck()
  checkDeck: ->
    {deckId} = @state
    deckDetail = @props.getDeckDetail deckId, ''
    checkDetail = @props.henseiData[title]
  render: ->
    <div className='titles-container'>
      <div style={display: 'flex', padding: '5px 5px 5px 5px'}>
        <div className='titles-container' style={width: '50%', padding: '0 5px 0 5px'}>
          <span style={textAlign: 'center', fontSize: '120%'}>{@props.title}</span>
          <Button bsSize='small'
                  disabled={@state.disable}
                  onClick={@handleCheckClick}
                  block>
            {if @state.isChecking then __ 'Close Check' else __ 'Check'}
          </Button>
        </div>
        <div className={if @state.isChecking then 'hidden' else 'comment-container'}>
          <span>{if @props.deckItem.comment? then @props.deckItem.comment else ' '}</span>
        </div>
        <div className={if @state.isChecking then 'show' else 'hidden'}
             style={width: '50%', padding: '0 5px 0 5px'}>
          <Input type='select'
                 label={__ 'Select fleet'}
                 value={@state.deckId}
                 onChange={@handleDeckSelect}>
            {
              if window._decks?
                for deck, index in window._decks
                  <option value={index} key={index}>{deck.api_name}</option>
            }
          </Input>
        </div>
      </div>
      <div className='details-container'>
        <span>{__ 'Total Lv '}{@props.deckItem.details[0]}</span>
        <span>{__ 'Avg Lv '}{@props.deckItem.details[1]}</span>
        <span>{__ 'Fighter Power '}{@props.deckItem.details[2]}</span>
        {
          if @props.deckItem.details.length > 3
            <span>
              {__ 'LOS '}{@props.deckItem.details[3]}({__ ' Old'}),
                         {@props.deckItem.details[4]}({__ ' Autumn'})
            </span>
        }
      </div>
      <div className='ships-container'>
        {
          for ship, index in @props.deckItem.ships
            break if ship[0] is null
            <ShipItem ship={ship} key={index}/>
        }
     </div>
    </div>

module.exports = HenseiItem
