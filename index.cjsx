{APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, toggleModal} = window
{TabbedArea, TabPane} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
CSON = require 'cson'
i18n = require './node_modules/i18n'

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

{__} = i18n

AddDataTab = require './addDataTab'
HenseiList = require './henseiList'
DelDataTab = require './delDataTab'

module.exports =
  name: "HenseiNikki"
  displayName: <span><FontAwesome key={0} name='folder-open' />{__ "Organization Records"}</span>
  priority: 7
  author: "Rui"
  link: "https://github.com/ruiii"
  description: "记录编成信息"
  version: "2.0.0"
  reactClass: React.createClass
    getInitialState: ->
      memberId: ""
    henseiData: {}
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
    handleResponse: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_get_member/basic'
          memberId = body.api_member_id
          @getDataFromFile memberId
          window.removeEventListener 'game.response', @handleResponse
    getDataFromFile: (memberId) ->
      data = {}
      try
        fs.ensureDirSync(join(APPDATA_PATH, 'hensei-nikki'))
        console.log "get data from hensei-nikki"
        data = CSON.parseCSONFile(join(APPDATA_PATH, 'hensei-nikki', "#{memberId}.cson"))
      catch e
        error "Read hensei error!#{e}"
      if !data.titles?
        data.titles = []
      @setState
        henseiData: data
        memberId: memberId
    handleAddData: (title, deck) ->
      data = @state.henseiData
      if title in data.titles
        toggleModal(__("save error"), __("The title is already exist."))
      else
        data[title] = deck
        data.titles.push(title)
        @saveData(data)
    handleDeleteData: (delTitle) ->
      {henseiData} = @state
      for title in delTitle
        delete henseiData[title]
        for item,index in henseiData.titles
          if item is title
            henseiData.titles.splice(index, 1)
      @saveData(henseiData)
    saveData: (data) ->
      try
        fs.writeFileSync(join(APPDATA_PATH, 'hensei-nikki', "#{@state.memberId}.cson"), CSON.stringify(data), null, 2)
      catch e
        error "Write hensei error!#{e}"
      console.log "save data to hensei-nikki"
      @setState
        henseiData: data
    handleSelectTab: (selectedKey) ->
      @setState
        selectedKey: selectedKey
    render: ->
      <TabbedArea activeKey={@state.selectedKey} animation={false} onSelect={@handleSelectTab}>
      <link rel="stylesheet" href={join(relative(ROOT, __dirname), 'assets', "hensei-nikki.css")} />
        <TabPane eventKey={0} tab={__ 'Records'} >
          <HenseiList indexKey={0}
                      selectedKey={@state.selectedKey}
                      henseiData={@state.henseiData} />
        </TabPane>
        <TabPane eventKey={1} tab={__ 'Add'} >
          <AddDataTab indexKey={1}
                      selectedKey={@state.selectedKey}
                      handleAddData={@handleAddData} />
        </TabPane>
        <TabPane eventKey={2} tab={__ 'Delete'} >
          <DelDataTab indexKey={2}
                      selectedKey={@state.selectedKey}
                      henseiData={@state.henseiData}
                      handleDeleteData={@handleDeleteData} />
        </TabPane>
      </TabbedArea>
