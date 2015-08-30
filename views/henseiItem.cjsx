{React, ReactBootstrap, FontAwesome} = window
{OverlayTrigger, Tooltip, Button, Input, Label} = ReactBootstrap
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
    disable: true
  handleDeckSelect: (e) ->
    deckId = parseInt e.target.value
    @setState
      deckId: deckId
  render: ->
    <div className='titles-container'>
      <div style={display: 'flex', padding: 10}>
        <div className='titles-container' style={width: '50%', padding: 10}>
          <span style={textAlign: 'center', fontSize: '120%'}>{@props.title}</span>
        </div>
        <div style={display: 'flex', padding: 5}>
          {
            for tag, index in @props.deckItem.tags
              <Label style={margin: 5}
                     bsStyle={@props.deckItem.tagsStyle[index]}
                     key={index}>
                {tag}
              </Label>
          }
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
