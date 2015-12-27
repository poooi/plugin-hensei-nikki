{React, ReactBootstrap, useSVGIcon} = window
{OverlayTrigger, Tooltip, Button, Input, Tabs, Tab} = ReactBootstrap
{join} = require 'path-extra'
__ = window.i18n.compositionRecord.__.bind(window.i18n.compositionRecord)

# [shipId, [lv, cond], [slotId], [slotLv], [slotALv]]
# {version: 3, f1: {s1: {id: '100', lv: 40, luck: -1, items:{i1:{id:1, rf: 4, rp:},...,ix:{id:200}}}, s2:{}...},...}

ShipItem = React.createClass
  render: ->
    <div className='ship-item'>
      {
        ship = window.$ships[@props.ship[0]]
        name = window.i18n.resources.__ ship.api_name
        type = window.i18n.resources.__ window.$shipTypes[ship.api_stype].api_name
        <div className='ship-detail'>
          <span className='ship-name'>{name}</span>
          <div className='ship-detail-group'>
            <span>Lv.{@props.ship[1][0]}</span>
            <span className='ship-type'>{type}</span>
          </div>
        </div>
      }
      <div className='slot-detail'>
        {
          for slotId, index in @props.ship[2]
            continue if slotId is null
            slot = window.$slotitems[slotId]
            name = window.i18n.resources.__ slot.api_name
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
              {
                if useSVGIcon
                  <img className='img-svg' src={join('assets', 'svg', 'slotitem', "#{type}.svg")} />
                else
                  <img className='img-img' src={join('assets', 'img', 'slotitem', "#{type + 100}.png")} />
              }
              <OverlayTrigger placement='top' overlay={
                <Tooltip id='name'>
                  <span>{name}</span>
                </Tooltip>
              }>
                <span className='slot-name'>{name}</span>
              </OverlayTrigger>
              <span className='slot-improvment'>
                  &nbsp;&nbsp;{if lv? and lv isnt null then <strong style={color: '#45A9A5'}>★{lv}</strong> else ''}
                  {
                    if alv? and 1 <= alv <= 7
                      <img className='alv-img' src={join(window.ROOT, 'assets', 'img', 'airplane', "alv#{alv}.png")} />
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
                  <Tooltip id='fp-basic'>
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
                  <Tooltip id='los'>
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
    tab: ['I', 'II', 'III', 'IV']
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
            fpBasic = @props.deckItem.details[index][1]
            fpAlv = @props.deckItem.details[index][2]
            fpTotal = fpBasic + fpAlv
            los = @props.deckItem.details[index][3]
            losA = @props.deckItem.details[index][4]
          else
            totalLv = @props.deckItem.details[index][0]
            fpTotal = @props.deckItem.details[index][1] + @props.deckItem.details[index][2]
            fpBasic = @props.deckItem.details[index][1]
            fpAlv = @props.deckItem.details[index][2]
            los = losA = null

          <Tab eventKey={index} title={@state.tab[index]} key={index}>
            <div className='details-container'>
              <span>{__ 'Total Lv '}{totalLv}</span>
              {
                if fpBasic isnt null
                  <span>
                    <OverlayTrigger placement='bottom' overlay={
                      <Tooltip id='fpbasic'>
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
                      <Tooltip id='los'>
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
