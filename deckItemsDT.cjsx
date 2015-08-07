{React, ReactBootstrap} = window
{Grid, Row, Col, Accordion, Panel, Button, Input, OverlayTrigger, Tooltip, Table} = ReactBootstrap
CSON = require 'cson'
{join} = require 'path-extra'

i18n = require './node_modules/i18n'
{__} = i18n

# i18n configure
i18n.configure({
    locales: ['en_US', 'ja_JP', 'zh_CN', 'zh_TW'],
    defaultLocale: 'zh_CN',
    directory: join(__dirname, "i18n"),
    updateFiles: false,
    indent: "\t",
    extension: '.json'
})
i18n.setLocale(window.language)

PanelItem = React.createClass
  render: ->
    <Row>
      {
        console.log "deckItem render"
        if @props.deckItem.shipsCount > 0
          for ship in [1..@props.deckItem.shipsCount]
            shipName = @props.deckItem.ships[ship].shipName
            shipLv = @props.deckItem.ships[ship].shipLv
            shipType = @props.deckItem.ships[ship].shipType
            slots = @props.deckItem.ships[ship].slots
            <Col xs={6}>
              <Table condensed>
                <tbody>
                  <tr>
                    <td width="100%" colSpan="2">{shipName}</td>
                    <td width="200%" rowSpan="2">
                    {
                      for slot,index in slots
                        <OverlayTrigger placement='bottom' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                          <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 33}.png")} />
                        </OverlayTrigger>
                    }
                    </td>
                  </tr>
                  <tr>
                    <td width="23%">Lv:{shipLv}</td>
                    <td >{shipType}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
      }
    </Row>

HenseiDecks = React.createClass
  render: ->
    <div>
      <Accordion>
         {
           console.log "decks render"
           if @props.henseiData.titles? and @props.henseiData.titles isnt []
             for title, index in @props.henseiData.titles
               deckItem = @props.henseiData[title]
               <Panel header={title} eventKey={index} key={index}>
                  <Grid>
                    <Col xs={4}>
                      <br/>
                      {__ "Total Lv."}<br/>
                      　{deckItem.totalLv}<br/><br/>
                      {__ "Avg. Lv."}<br/>
                      　{deckItem.avgLv}<br/><br/>
                      {__ "Fighter Power: "}<br/>
                      　{deckItem.tyku}<br/><br/>
                      {__ "LOS: "}<br/>
                      　{deckItem.saku25}{__ " Autumn"}<br/>
                      　{deckItem.saku25a}{__ " Old"}<br/>
                    </Col>
                    <PanelItem deckItem={deckItem} key={index} />
                  </Grid>
                </Panel>
         }
       </Accordion>
     </div>
module.exports = HenseiDecks
