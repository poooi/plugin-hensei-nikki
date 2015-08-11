{$, $$, _, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, toggleModal} = window
{NavItem, Nav, PageHeader, Grid, Row, Col, Accordion, Panel, Button, Input, Well, OverlayTrigger, Tooltip, Table} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
CSON = require 'cson'
i18n = require './node_modules/i18n'
{__} = i18n


SlotsItem = React.createClass
  render: ->
    <OverlayTrigger placement='bottom' overlay={<Tooltip>{@props.slot[1]}{if @props.slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{@props.slot[2]}</strong> else ''}</Tooltip>}>
  　  <img key={@props.key} src={join('assets', 'img', 'slotitem', "#{@props.slot[0] + 33}.png")} />
  　</OverlayTrigger>
#              ships[]:
#                   name, lv, type, slots[]
ShipItem = React.createClass
  render: ->
    <Col xs={6}>
      <tr>
        <td colSpan={2}>{ @props.ship[0] }</td>
        {
          slots = @props.ship[3]
          if @props.tab is "double"
            for slot in [0..1]
              continue if !slots[slot]?
              <td>
                <SlotsItem slot={slots[slot]} key={slot}/>
              </td>
          else
            <td rowSpan={2}>
            {
              for slot in [0..3]
                continue if !slots[slot]?
                <SlotsItem slot={slots[slot]} key={slot}/>
            }
            </td>
        }
      </tr>
      <tr>
        <td>{ @props.ship[1] }</td>
        <td>{ @props.ship[2] }</td>
        {
          if @props.tab is "double"
            for slot in [2..3]
              continue if !slots[slot]?
              <td>
                <SlotsItem slot={slots[slot]} key={slot}/>
             　</td>
        }
      </tr>
    </Col>

ShipItemD = React.createClass
  render: ->
    <Col xs={6}>
      <Table condensed>
        <tbody>
          <tr>
            <td width="100%" colSpan="2">{@props.ship[0]}</td>
            <td width="200%" rowSpan="2">
            {
              for slot, index in @props.ship[3]
                <OverlayTrigger placement='bottom' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                  <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 33}.png")} />
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
    <Col xs={6}>
      <Table condensed>
        <tbody>
          <tr>
            <td width="25%" colSpan="2">{@props.ship[0]}</td>
            <td width="33%" rowSpan="2" >
            {
              for slot,index in @props.ship[3]
                <OverlayTrigger placement='right' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                  <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 33}.png")} />
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


PanelItem = React.createClass

  render: ->
    <Grid>
      <Row>
        <Col xs={3}> {__ "Total Lv."} {@props.deckItem.details[0]} </Col>
        <Col xs={3}> {__ "Avg. Lv."} {@props.deckItem.details[1]} </Col>
        <Col xs={3}> {__ "Fighter Power: "} {@props.deckItem.details[2]} </Col>
        <Col xs={3}> {__ "LOS: "} {@props.deckItem.details[3]},{@props.deckItem.details[4]} </Col>
      </Row>
      <Row>
        {
          if config.get('poi.tabarea.double')
            for ship, index in @props.deckItem.ships
              <ShipItemS ship={ship} key={index}/>
          else
            for ship, index in @props.deckItem.ships
              <ShipItemD ship={ship} key={index}/>
        }
      </Row>
    </Grid>

module.exports = PanelItem
