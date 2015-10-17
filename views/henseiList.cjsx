{React, ReactBootstrap} = window
{Grid, Row, Col, Accordion, Panel, Input} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitlesList = require './titlesList'
HenseiItem = require './henseiItem'

HenseiList = React.createClass
  getInitialState: ->
    activeTitle: ''
  handleTitleChange: (title) ->
    @setState
      activeTitle: title
  render: ->
    <div className='hensei-list-container'>
      <TitlesList activeTitle={@state.activeTitle}
                  henseiData={@props.henseiData}
                  handleTitleChange={@handleTitleChange} />
      <div style={flex: 1}>
        {
          if @props.henseiData?
               if @props.henseiData.titles? and @props.henseiData.titles.length >= 1 and @props.henseiData[@state.activeTitle]?
                 <HenseiItem deckItem={@props.henseiData[@state.activeTitle]} />
        }
      </div>
    </div>

module.exports = HenseiList
