{React, ReactBootstrap} = window
{Grid, Row, Col, OverlayTrigger, Tooltip, Table} = ReactBootstrap
{join} = require 'path-extra'
i18n = require './node_modules/i18n'
{__} = i18n

ShipItemD = React.createClass
  render: ->
    <Col key={@props.key} xs={12}>
      <Table condensed>
        <tbody>
          <tr>
            <td width="100%" colSpan="2">{@props.ship[0]}</td>
            <td width="200%" rowSpan="2">
            {
              for slot, index in @props.ship[3]
                <OverlayTrigger key={index} placement='bottom' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                  <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 100}.png")} />
                </OverlayTrigger>
            }
            </td>
          </tr>
          <tr>
            <td width="23%">Lv:{@props.ship[1]}</td>
            <td >{@props.ship[2]}</td>
          </tr>
        </tbody>
      </Table>
    </Col>

ShipItemS = React.createClass
  render: ->
    <Col key={@props.key} xs={6}>
      <Table condensed>
        <tbody>
          <tr>
            <td width="25%" colSpan="2">{@props.ship[0]}</td>
            <td width="33%" rowSpan="2" >
            {
              for slot,index in @props.ship[3]
                <OverlayTrigger placement='right' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                  <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 100}.png")} />
                </OverlayTrigger>
            }
            </td>
          </tr>
          <tr>
            <td width="22%">Lv:{@props.ship[1]}</td>
            <td >{@props.ship[2]}</td>
          </tr>
        </tbody>
      </Table>
    </Col>

isDouble = config.get('poi.tabarea.double')

PanelItem = React.createClass
  getInitialState: ->
    if isDouble
      col: 6
    else
      col: 3
  render: ->
    <Grid>
      <Row>
        <Col xs={@state.col}> {__ "Total Lv."} {@props.deckItem.details[0]} </Col>
        <Col xs={@state.col}> {__ "Avg. Lv."} {@props.deckItem.details[1]} </Col>
        <Col xs={@state.col}> {__ "Fighter Power: "} {@props.deckItem.details[2]} </Col>
        <Col xs={@state.col}> {__ "LOS: "} {@props.deckItem.details[3]},{@props.deckItem.details[4]} </Col>
      </Row>
      <Row>
        {
          if isDouble
            for ship, index in @props.deckItem.ships
              <ShipItemD ship={ship} key={index}/>
          else
            for ship, index in @props.deckItem.ships
              <ShipItemS ship={ship} key={index}/>
        }
      </Row>
    </Grid>

module.exports = PanelItem
