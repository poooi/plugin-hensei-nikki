{React, ReactBootstrap, FontAwesome} = window
{Panel, Input, Button} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitlesList = require './titlesList'
HenseiItem = require './henseiItem'
TagsEditor = require './tagsEditor'

HenseiList = React.createClass
  getInitialState: ->
    activeTitle: ''
    titleInput: ''
    btnDisable: true
    edit: false
    editTitle: false
  handleTitleChange: (title) ->
    @setState
      activeTitle: title
  handleDelClick: ->
    if confirm(__('Confirm?'))
      @props.handleDeleteData [@state.activeTitle]
    else
      return
  handleEditClick: ->
    @setState
      edit: true
  handleBackClick: ->
    @setState
      edit: false
  handleEditTitleClick: ->
    if @state.editTitle
      @setState
        titleInput: ''
        btnDisable: true
        editTitle: !@state.editTitle
    else
      @setState
        editTitle: !@state.editTitle
  handleTitleInputChange: ->
    titleInput = @refs.titleInput.getValue()
    if titleInput? and titleInput.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      titleInput: titleInput
      btnDisable: btnDisable
  handleTitleSaveClick: ->
    @props.handleTitleChang @state.titleInput, @state.activeTitle
    @setState
      activeTitle: @state.titleInput
      editTitle: false
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
                      <FontAwesome name='trash'  />{__('Delete Records')}
                    </Button>
                    <Button bsSize='small' onClick={@handleEditClick}>
                      <FontAwesome name='pencil' />{__('Edit tag')}
                    </Button>
                    <Button bsSize='small' onClick={@handleEditTitleClick}>
                      <FontAwesome name='pencil' />{__('Edit title')}
                    </Button>
                  </div>
                  <Panel collapsible expanded={@state.editTitle} style={marginBottom: 0}>
                    <Input style={margin: 10}
                           type='text'
                           label={__ 'Title'}
                           placeholder={__ 'Title'}
                           value={@state.titleInput}
                           hasFeedback
                           ref='titleInput'
                           onChange={@handleTitleInputChange} />
                    <Button style={height: '50%', width: '50%', margin: 10}
                            bsSize='small'
                            disabled={@state.btnDisable}
                            onClick={@handleTitleSaveClick}>
                      {__ 'Save'}
                    </Button>
                  </Panel>
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
