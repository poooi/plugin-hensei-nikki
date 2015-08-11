{$, $$, _, APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, toggleModal} = window
{PageHeader, Grid, Row, Col, Accordion, Panel, Button, Input, Well} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
CSON = require 'cson'

i18n = require './node_modules/i18n'
{__} = i18n


DelDataTab = React.createClass
  getInitialState: ->
    btnDisable: true
#  handleClickCheckbox: (index) ->
#    {rowChooseChecked} = @props
#    rowChooseChecked[index] = !rowChooseChecked[index]
#    @props.tabFilterRules rowChooseChecked
#    config.set "plugin.Akashic.#{@props.contentType}.checkbox", JSON.stringify rowChooseChecked
  render: ->
    <div>

    </div>
module.exports = DelDataTab
