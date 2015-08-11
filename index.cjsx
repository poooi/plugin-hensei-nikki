{$, $$, _, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, toggleModal} = window
{NavItem, Nav, PageHeader, Grid, Row, Col, Accordion, Panel, Button, Input, Well, TabbedArea, TabPane} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
CSON = require 'cson'
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

AddDataTab = require './addDataTab'
HenseiList = require './henseiList'
DelDataTab = require './delDataTab'

module.exports =
  name: "HenseiNikki"
  displayName: <span><FontAwesome key={0} name='pancil-square-o' />{__ "Organization Records"}</span>
  priority: 7
  author: "Rui"
  link: "https://github.com/ruiii"
  description: "记录编成信息"
  version: "1.0.0"
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

    # data: title:
    #              details[]: totalLv, avglv, tyku, saku, sakua
    #              ships[]:
    #                   name, lv, type, slots[]
    #       titles[]
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
    saveDataToFile: (title, deck) ->
      data = @state.henseiData
      if title in data.titles
        toggleModal(__("save error"), __("The title is already exist."))
      else
        data[title] = deck
        data.titles.push(title)
        try
          fs.writeFileSync(join(APPDATA_PATH, 'hensei-nikki', "#{@state.memberId}.cson"), CSON.stringify(data), null, 2)
        catch e
          error "Write hensei error!#{e}"
        console.log "save data to hensei-nikki"
        @setState
          henseiData: data
        toggleModal(__("save succeed"), __("The title is already exist."))
    handleSelectTab: (selectedKey) ->
      @setState
        selectedKey: selectedKey
    render: ->
      <TabbedArea activeKey={@state.selectedKey} animation={false} onSelect={@handleSelectTab}>
      <link rel="stylesheet" href={join(relative(ROOT, __dirname), 'assets', "hensei-nikkiST.css")} />
        <TabPane eventKey={0} tab='Records' >
          <HenseiList indexKey={0}
                      selectedKey={@state.selectedKey}
                      henseiData={@state.henseiData} />
        </TabPane>
        <TabPane eventKey={1} tab='Add' >
          <AddDataTab indexKey={1}
                      selectedKey={@state.selectedKey}
                      saveDataToFile={@saveDataToFile} />
        </TabPane>
        <TabPane eventKey={2} tab='Delete' >
          <DelDataTab indexKey={2}
                      selectedKey={@state.selectedKey}
                      henseiData={@state.henseiData} />
        </TabPane>
      </TabbedArea>
