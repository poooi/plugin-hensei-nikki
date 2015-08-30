{_, React, ReactBootstrap} = window
{Grid, Row, Col, Button, Input, TabbedArea, TabPane} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

AddDataTab = require './addDataTab'
ImportTab = require './importTab'
DelDataTab = require './delDataTab'

EditDataTab = React.createClass
  getInitialState: ->
    selectedKey: 0
  handleSelectTab: (selectedKey) ->
    @setState
      selectedKey: selectedKey
  render: ->
    <TabbedArea activeKey={@state.selectedKey} animation={false} onSelect={@handleSelectTab}>
      <TabPane eventKey={0} tab={__ 'Add'} >
        <AddDataTab indexKey={0}
                    selectedKey={@state.selectedKey}
                    henseiData={@props.henseiData}
                    getDeckDetail={@props.getDeckDetail}
                    handleAddData={@props.handleAddData} />
      </TabPane>
      <TabPane eventKey={1} tab={__('Import') + '/' + __('Export')} >
        <ImportTab indexKey={1}
                   selectedKey={@state.selectedKey}
                   henseiData={@props.henseiData}
                   handleAddData={@props.handleAddData} />
      </TabPane>
      <TabPane eventKey={2} tab={__ 'Delete'} >
        <DelDataTab indexKey={2}
                    selectedKey={@state.selectedKey}
                    henseiData={@props.henseiData}
                    handleDeleteData={@props.handleDeleteData} />
      </TabPane>
    </TabbedArea>

module.exports = EditDataTab
