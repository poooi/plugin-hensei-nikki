{React, ReactBootstrap, JSON} = window
fs = require 'fs-extra'
{remote} = require 'electron'
{dialog} = remote.require 'electron'
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])

TitlesList = require './titlesList'
HenseiList = require './henseiList'
AddDataTab = require './addDataTab'
ImportModule = require './importModule'

Main = React.createClass
  getInitialState: ->
    activeTitle: ''
    status: 'list'
  handleTitleClick: (title) ->
    @setState
      activeTitle: title
  handleTitleSaveClick: (title) ->
    @props.handleTitleChange title, @state.activeTitle
    @setState
      activeTitle: title
  handleAddDataClick: (eventKey, selectedKey) ->
    switch selectedKey
      when '1'
        @setState
          status: 'add'
      when '2'
        @setState
          status: 'import'
      when '3' then @handleFileImportClick()
      when '4' then @handleFileExportClick()
  handleFileImportClick: ->
    henseiData = @props.henseiData
    filename = dialog.showOpenDialog
      title: __ 'Import records file'
      filters: [
        {
          name: "json file"
          extensions: ['json']
        }
      ]
      properties: ['openFile']
    if filename?[0]?
      try
        fs.accessSync(filename[0], fs.R_OK)
        fileContentBuffer = fs.readJSONSync filename[0]
        flag = false
        for title in fileContentBuffer.titles
          continue if title in henseiData.titles
          henseiData.titles.push title
          henseiData[title] = fileContentBuffer[title]
          flag = true
        if flag
          @props.saveData henseiData
      catch e
        console.log e.message
        throw e
  handleFileExportClick: ->
    filename = dialog.showSaveDialog
      title: __ 'Export records file'
      defaultPath: "HenseiNikki.json"
    if filename?
      fs.writeFile filename, JSON.stringify(@props.henseiData), (err)->
        if err
          console.log "err! Save data error"
  handleBackClick: ->
    @setState
      status: 'list'
  render: ->
    <div>
      <div className={if @state.status is 'list' then 'show' else 'hidden'}>
        <div className='hensei-list-container'>
          <TitlesList status={@state.status}
                      activeTitle={@state.activeTitle}
                      henseiData={@props.henseiData}
                      handleAddDataClick={@handleAddDataClick}
                      handleTitleClick={@handleTitleClick} />
          <HenseiList handleDeleteData={@props.handleDeleteData}
                      activeTitle={@state.activeTitle}
                      saveData={@props.saveData}
                      handleTitleSaveClick={@handleTitleSaveClick}
                      henseiData={@props.henseiData} />
        </div>
      </div>
      <div className={if @state.status is 'add' then 'show' else 'hidden'}>
        <AddDataTab status={@state.status}
                    henseiData={@props.henseiData}
                    getDeckDetail={@props.getDeckDetail}
                    handleBackClick={@handleBackClick}
                    handleAddData={@props.handleAddData} />
      </div>
      <div className={if @state.status is 'import' then 'show' else 'hidden'}>
        <ImportModule status={@state.status}
                     handleBackClick={@handleBackClick}
                     handleAddData={@props.handleAddData} />
      </div>
    </div>
module.exports = Main
