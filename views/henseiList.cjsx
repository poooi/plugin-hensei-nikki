{React, ReactBootstrap} = window
{Button, DropdownButton, MenuItem} = ReactBootstrap
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])
FontAwesome = if require('react-fontawesome')?.default? then require('react-fontawesome').default else require('react-fontawesome')

HenseiItem = require './henseiItem'
TagsEditor = require './tagsEditor'
TitleEditor = require './titleEditor'
ExportModule = require './exportModule'

HenseiList = React.createClass
  getInitialState: ->
    edit: false
    editTitle: false
    export: false
  componentWillReceiveProps: (nextProps)->
    if nextProps.activeTitle isnt @props.activeTitle
      @setState
        edit: false
        editTitle: false
        export: false
  handleDelClick: ->
    if confirm(__('Confirm?'))
      @props.handleDeleteData [@props.activeTitle]
    else
      return
  handleEditClick: ->
    @setState
      edit: true
  handleBackClick: ->
    @setState
      edit: false
      export: false
  handleEditTitleClick: ->
    @setState
      editTitle: !@state.editTitle
  handleExportClick: ->
    @setState
      export: true
  render: ->
    <div style={flex: 1}>
      {
        if @props.henseiData?
          if @props.henseiData.titles? and @props.henseiData.titles.length >= 1 and @props.henseiData[@props.activeTitle]?
            dTitle = <span><FontAwesome name='pencil' /> {__('Edit')}</span>
            <div>
              <div className={if @state.edit or @state.export then 'hidden' else 'show'}>
                <div style={display: 'flex', justifyContent: 'space-around', margin: 10, marginBottom: 0}>
                  <Button bsSize='small' onClick={@handleExportClick}>
                    <FontAwesome name='share-square-o' /> {__('Export')}
                  </Button>
                  <DropdownButton title={dTitle} key={0} id="henseinikki-list-dropdown">
                    <MenuItem eventKey='1' onSelect={@handleEditClick}>{__('Edit tag')}</MenuItem>
                    <MenuItem eventKey='2' onSelect={@handleEditTitleClick}>{__('Edit title')}</MenuItem>
                  </DropdownButton>
                  <Button bsSize='small' onClick={@handleDelClick}>
                    <FontAwesome name='trash'  /> {__('Delete Records')}
                  </Button>
                </div>
                <TitleEditor editTitle={@state.editTitle}
                             henseiData={@props.henseiData}
                             handleTitleSaveClick={@props.handleTitleSaveClick}
                             activeTitle={@props.activeTitle} />
                <HenseiItem deckItem={@props.henseiData[@props.activeTitle]} />
              </div>
              <div className={if @state.edit then 'show' else 'hidden'}>
                <TagsEditor edit={@state.edit}
                            title={@props.activeTitle}
                            henseiData={@props.henseiData}
                            handleBackClick={@handleBackClick}
                            saveData={@props.saveData} />
              </div>
              <div className={if @state.export then 'show' else 'hidden'}>
                <ExportModule export={@state.export}
                              title={@props.activeTitle}
                              handleBackClick={@handleBackClick}
                              henseiData={@props.henseiData} />
              </div>
            </div>
      }
    </div>

module.exports = HenseiList
