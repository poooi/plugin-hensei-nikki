{_, React, ReactBootstrap} = window
{Tabs, Tab} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

AddDataTab = require './addDataTab'
ImportTab = require './importTab'
#DelDataTab = require './delDataTab'
#EditTagTab = require './editTagTab'

EditDataTab = React.createClass
  getInitialState: ->
    selectedKey: 0
  handleSelectTab: (selectedKey) ->
    @setState
      selectedKey: selectedKey
  render: ->
    <Tabs activeKey={@state.selectedKey} animation={false} onSelect={@handleSelectTab}>
      <Tab eventKey={0} title={__ 'Add'} >
        <AddDataTab indexKey={0}
                    selectedKey={@state.selectedKey}
                    henseiData={@props.henseiData}
                    getDeckDetail={@props.getDeckDetail}
                    handleAddData={@props.handleAddData} />
      </Tab>
      <Tab eventKey={1} title={__('Import') + '/' + __('Export')} >
        <ImportTab indexKey={1}
                   selectedKey={@state.selectedKey}
                   henseiData={@props.henseiData}
                   handleAddData={@props.handleAddData}
                   saveData={@props.saveData} />
      </Tab>
    </Tabs>

module.exports = EditDataTab
###
<Tab eventKey={2} title={__ 'Delete'} >
  <DelDataTab indexKey={2}
              selectedKey={@state.selectedKey}
              henseiData={@props.henseiData}
              handleDeleteData={@props.handleDeleteData} />
</Tab>
<Tab eventKey={3} title={__ 'Edit tag'} >
  <EditTagTab indexKey={3}
              selectedKey={@state.selectedKey}
              henseiData={@props.henseiData}
              saveData={@props.saveData} />
</Tab>
###
