{React, ReactBootstrap, FontAwesome} = window
{OverlayTrigger, Tooltip, Button, Input, Tabs, Tab} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n


# [shipId, [lv, cond], [slotId], [slotLv], [slotALv]]
# {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}

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
          <span className='ship-type'>{type}</span>
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
              <img src={join('assets', 'img', 'slotitem', "#{type + 100}.png")} />
              <OverlayTrigger placement='top' overlay={
                <Tooltip>
                  <span>{name}</span>
                </Tooltip>
              }>
                <span className='slot-name'>{name}</span>
              </OverlayTrigger>
              <span className='slot-improvment'>
                  &nbsp;&nbsp;{if lv? and lv isnt null then <strong style={color: '#45A9A5'}>★+{lv}</strong> else ''}
                  {
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

FleetItem = React.createClass
  render: ->
    <div className='titles-container'>
      {
        if @props.deckItem.details.totalLv?
          totalLv = @props.deckItem.details.totalLv
          fpTotal = @props.deckItem.details.tykuBasic + @props.deckItem.details.tykuAlv
          fpBasic = @props.deckItem.details.tykuBasic
          fpAlv = @props.deckItem.details.tykuAlv
          los = @props.deckItem.details.saku25
          losA = @props.deckItem.details.saku25a
        else
          if @props.deckItem.details.length > 3
            totalLv = @props.deckItem.details[0]
            fpTotal = @props.deckItem.details[2]
            fpBasic = fpAlv = null
            los = @props.deckItem.details[3]
            losA = @props.deckItem.details[4]
          else
            totalLv = @props.deckItem.details[0]
            fpTotal = @props.deckItem.details[1] + @props.deckItem.details[2]
            fpBasic = @props.deckItem.details[1]
            fpAlv = @props.deckItem.details[2]
            los = losA = null
        <div className='details-container'>
          <span>{__ 'Total Lv '}{totalLv}</span>
          {
            if fpBasic isnt null
              <span>
                <OverlayTrigger placement='bottom' overlay={
                  <Tooltip>
                    <div>{__ 'Basic FP'}: {fpBasic}</div>
                    <div>{__ 'Rank bonuses'}: {fpAlv}</div>
                  </Tooltip>
                }>
                  <span>{__ 'Fighter Power '}{fpTotal}</span>
                </OverlayTrigger>
              </span>
            else
              <span>{__ 'Fighter Power '}{fpTotal}</span>
          }
          {
            if los isnt null
              <span>
                <OverlayTrigger placement='bottom' overlay={
                  <Tooltip>
                    <div>{losA}{__ ' Autumn'}</div>
                    <div>{los}{__ ' Old'}</div>
                  </Tooltip>
                }>
                  <span>{__ 'LOS '}: {losA}</span>
                </OverlayTrigger>
              </span>
          }
        </div>
      }
      <div className='ships-container'>
        {
          for ship, index in @props.deckItem.ships
            break if ship[0] is null
            <ShipItem ship={ship} key={index}/>
        }
     </div>
    </div>

HenseiItem = React.createClass
  getInitialState: ->
    deckId: 0
    selectedKey: 0
  componentWillReceiveProps: (nextProps) ->
    if nextProps.deckItem isnt @props.deckItem
      @setState
        selectedKey: 0
  handleSelectTab: (selectedKey) ->
    @setState
      selectedKey: selectedKey
  render: ->
    if @props.deckItem.ships[0][0][0]?
      <Tabs activeKey={@state.selectedKey} onSelect={@handleSelectTab} animation={false}>
      {
        for fleet, index in @props.deckItem.ships
          break if !fleet[0]?
          if @props.deckItem.details[index].length > 3
            totalLv = @props.deckItem.details[index][0]
            fpTotal = @props.deckItem.details[index][2]
            fpBasic = fpAlv = null
            los = @props.deckItem.details[index][3]
            losA = @props.deckItem.details[index][4]
          else
            totalLv = @props.deckItem.details[index][0]
            fpTotal = @props.deckItem.details[index][1] + @props.deckItem.details[index][2]
            fpBasic = @props.deckItem.details[index][1]
            fpAlv = @props.deckItem.details[index][2]
            los = losA = null

          <Tab eventKey={index} title={index} key={index}>
            <div className='details-container'>
              <span>{__ 'Total Lv '}{totalLv}</span>
              {
                if fpBasic isnt null
                  <span>
                    <OverlayTrigger placement='bottom' overlay={
                      <Tooltip>
                        <div>{__ 'Basic FP'}: {fpBasic}</div>
                        <div>{__ 'Rank bonuses'}: {fpAlv}</div>
                      </Tooltip>
                    }>
                      <span>{__ 'Fighter Power '}{fpTotal}</span>
                    </OverlayTrigger>
                  </span>
                else
                  <span>{__ 'Fighter Power '}{fpTotal}</span>
              }
              {
                if los isnt null
                  <span>
                    <OverlayTrigger placement='bottom' overlay={
                      <Tooltip>
                        <div>{losA}{__ ' Autumn'}</div>
                        <div>{los}{__ ' Old'}</div>
                      </Tooltip>
                    }>
                      <span>{__ 'LOS '}: {losA}</span>
                    </OverlayTrigger>
                  </span>
              }
            </div>
            <div className='ships-container'>
              {
                for ship, idx in @props.deckItem.ships[index]
                  break if ship[0] is null
                  <ShipItem ship={ship} key={idx}/>
              }
           </div>
          </Tab>
      }
      </Tabs>
    else
      <FleetItem deckItem={@props.deckItem} />

module.exports = HenseiItem
