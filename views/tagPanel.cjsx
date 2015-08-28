{React, ReactBootstrap, toggleModal} = window
{Button, Input, Panel} = ReactBootstrap
{join} = require 'path-extra'
i18n = require '../node_modules/i18n'
{__} = i18n

getStyleByType = (Type) ->
  switch type
    when 0 and 1
      return 'default'
    when 2 and 3
      return 'primary'
    when 4
      return 'info'
    when 5
      return 'warning'
    else
      return 'error'

TagPanel = React.createClass
  getInitialState: ->
    btnDisable: true
    panelShow: false
    checkItem: ''
    tagItem: ''
    tags: []
    checkItemsLabel: [__('Ship type'), "#{__('Ship type')}(#{__('Do not add')})",
                      __('Ship name'), "#{__('Ship name')}(#{__('Do not add')})",
                      __('Slot items'), __('Fighter Power '), __('LOS ')]
  componentWillReceiveProps: (nextProps)->
    if nextProps.panelShow
      @setState
        btnDisable: true
        deckId: 0
        number: 0
        title: ''
        comment: ''
  handleCheckItemSelect: (e) ->
    checkItem = parseInt e.target.value
    @setState
      checkItem: checkItem
  handleTagItemSelect: (e) ->
    tagItem = parseInt e.target.value
    @setState
      tagItem: tagItem
  handleTagInputChange: ->
    tagInput = @refs.tagInput.getValue()
    if tagInput? and tagInput.length > 0
      btnDisable = false
    else
      btnDisable = true
    @setState
      tagInput: tagInput
      btnDisable: btnDisable
  handleTagAddClick: ->
    if @state.checkItem is 4 and @state.number is 0
      toggleModal __('Error'), __('"The number must be larger than 0.')
    else
      type = getStyleByType @state.checkItem
      
  handleNumberChange: ->
    number = @refs.number.getValue()
    @setState
      number: number
  render: ->
    <Panel collapsible expanded={@props.panelShow}>
      {
        if @props.panelShow
          <div>
            <Input type='select'
                   label={__ 'select fleet'}
                   value={@state.checkItem}
                   onChange={@handleCheckItemSelect}>
              {
                for item, index in @state.checkItemsLabel
                  <option value={index} key={index}>{item}</option>
              }
            </Input>
            <div>
              {
                if @state.checkItem in [0, 2, 3, 4]
                  <Input type='select'
                         label={__ 'select fleet'}
                         value={@state.tagItem}
                         onChange={@handleTagItemSelect}>
                  {
                    if @state.checkItem isnt ''
                      for item, index in @props.selectItems[@state.checkItem]
                        <option value={index} key={index}>{item}</option>
                  }
                  </Input>
                else
                  <Input type='text'
                         label={@state.checkItemsLabel[@state.checkItem]}
                         placeholder={@state.checkItemsLabel[@state.checkItem]}
                         value={@state.tagInput}
                         hasFeedback
                         ref='tagInput'
                         onChange={@handleTagInputChange} />
              }
              {
                if @state.checkItem is 4
                  <Input type='text'
                         label={__ 'Number'}
                         placeholder={__ 'Number'}
                         value={@state.number}
                         hasFeedback
                         ref='number'
                         onChange={@handleNumberChange} />
              }
            </div>
            <Button bsStyle='default'
                    bsSize='small'
                    disabled={@state.btnDisable}
                    onClick={@handleTagAddClick}
                    block>
              {__ 'Add'}
            </Button>
          </div>
      }
    </Panel>

module.exports = TagPanel
