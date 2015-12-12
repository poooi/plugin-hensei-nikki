{React, ReactBootstrap, FontAwesome} = window
{Grid, Row, Col, Accordion, Panel, Input, Button} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitlesList = require './titlesList'
HenseiItem = require './henseiItem'
TagsEditor = require './tagsEditor'

HenseiList = React.createClass
  getInitialState: ->
    activeTitle: ''
    edit: false
  handleTitleChange: (title) ->
    @setState
      activeTitle: title
  handleDelClick: ->
    if confirm('确定删除？')
      @props.handleDeleteData [@state.activeTitle]
    else
      return
  handleEditClick: ->
    @setState
      edit: true
  handleBackClick: ->
    @setState
      edit: false
  render: ->
    <div className='hensei-list-container'>
      <TitlesList activeTitle={@state.activeTitle}
                  henseiData={@props.henseiData}
                  handleTitleChange={@handleTitleChange} />
      <div style={flex: 1}>
        {
          if @props.henseiData?
            if @props.henseiData.titles? and @props.henseiData.titles.length >= 1 and @props.henseiData[@state.activeTitle]?
              <div>
                <div className={if @state.edit then 'hidden' else 'show'}>
                  <div style={display: 'flex', justifyContent: 'space-around', margin: 10, marginBottom: 0}>
                    <Button bsSize='small' onClick={@handleDelClick}>
                      <FontAwesome name='trash'  />删除记录
                    </Button>
                    <Button bsSize='small' onClick={@handleEditClick}>
                      <FontAwesome name='pencil' />编辑tag
                    </Button>
                  </div>
                  <HenseiItem deckItem={@props.henseiData[@state.activeTitle]} />
                </div>
                <div className={if @state.edit then 'show' else 'hidden'}>
                  <TagsEditor edit={@state.edit}
                              title={@state.activeTitle}
                              henseiData={@props.henseiData}
                              handleBackClick={@handleBackClick}
                              saveData={@props.saveData} />
                </div>
              </div>
        }
      </div>
    </div>

module.exports = HenseiList
