{React, ReactBootstrap} = window
{Panel, Input, Button} = ReactBootstrap
i18n = require '../node_modules/i18n'
{__} = i18n

TitleEditor = React.createClass
  getInitialState: ->
    titleInput: ''
    btnDisable: true
  componentWillReceiveProps: (nextProps) ->
    if nextProps.editTitle and !@props.editTitle
      @setState
        titleInput: @props.activeTitle
        btnDisable: true
  handleTitleInputChange: ->
    titleInput = @refs.titleInput.getValue()
    if titleInput? and titleInput.length > 0 and titleInput isnt @props.activeTitle
      btnDisable = false
    else
      btnDisable = true
    @setState
      titleInput: titleInput
      btnDisable: btnDisable
  handleTitleSaveClick: ->
    flag = true
    for title in @props.henseiData.titles
      if title is @state.titleInput
        toggleModal __('Error'), __('The title is already exist.')
        flag = false
    if flag
      @props.handleTitleSaveClick @state.titleInput
  render: ->
    <Panel collapsible expanded={@props.editTitle} style={marginTop: 10, marginBottom: 0}>
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
module.exports = TitleEditor
