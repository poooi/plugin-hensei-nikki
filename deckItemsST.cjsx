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
                    <td width="25%" colSpan="2">{shipName}</td>
                    <td width="33%" rowSpan="2" >
                    {
                      for slot,index in slots
                        <OverlayTrigger placement='right' overlay={<Tooltip>{slot[1]}{if slot[2] > 0 then <strong style={color: '#45A9A5'}>★+{slot[2]}</strong> else ''}</Tooltip>}>
                          <img key={index} src={join('assets', 'img', 'slotitem', "#{slot[0] + 33}.png")} />
                        </OverlayTrigger>
                    }
                    </td>
                  </tr>
                  <tr>
                    <td width="22%">Lv:{shipLv}</td>
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
           if @props.henseiData.titles isnt []
             for title, index in @props.henseiData.titles
               deckItem = @props.henseiData[title]
               <Panel header={title} eventKey={index} key={index}>
                 <Panel bsStyle='default'>
                  <Grid>
                    <Col xs={3}>{__ "Total Lv."}{deckItem.totalLv}</Col>
                    <Col xs={3}>{__ "Avg. Lv."}{deckItem.avgLv}</Col>
                    <Col xs={3}>{__ "Fighter Power: "}{deckItem.tyku}</Col>
                    <Col xs={3}>{__ "LOS: "}{deckItem.saku25},{deckItem.saku25a}</Col>
                  </Grid>
                 </Panel>
                <Grid>
                  <PanelItem deckItem={deckItem}/>
                </Grid>
               </Panel>
         }
       </Accordion>
     </div>
module.exports = HenseiDecks
