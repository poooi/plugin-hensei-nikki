{React, ReactBootstrap, JSON, toggleModal} = window
{Button, FormControl} = ReactBootstrap
{shell} = require 'electron'
{openExternal} = shell
clipboard = require('electron').clipboard
__ = window.i18n["poi-plugin-hensei-nikki"].__.bind(window.i18n["poi-plugin-hensei-nikki"])
FontAwesome = if require('react-fontawesome')?.default? then require('react-fontawesome').default else require('react-fontawesome')

ExportMoudle = React.createClass
  getInitialState: ->
    code: ''
  componentWillReceiveProps: (nextProps)->
    if nextProps.export and !@props.export
      code = @props.henseiData[nextProps.title].ships
      if !code[0][0][0]?
        code = '[' + JSON.stringify(code) + ']'
      else
        code = JSON.stringify(code)
      @setState
        code: code
  handleCopyClick: ->
    clipboard.writeText @state.code
    toggleModal __('Copy'), __('The code has been copied to the clipboard.')
  render: ->
    <div className='tab-container'>
      <Button bsSize='small'
              onClick={@props.handleBackClick}
              style={margin: 10}>
        <FontAwesome name='arrow-left' />
      </Button>
      <span>
        {__ 'Support'}:
          <a onClick={openExternal.bind(this, 'http://fleet.diablohu.com')}>是谁呼叫舰队</a>,
          <a onClick={openExternal.bind(this, 'http://www.kancolle-calc.net/')}>艦載機厨デッキビルダー</a>。
      </span>
      <div className='container-col'>
        <Button bsSize='small' onClick={@handleCopyClick}>
          {__('Copy')}
        </Button>
        <FormControl style={height: '250px'}
                     componentClass='textarea'
                     label={__ 'Code'}
                     placeholder={__ 'Code'}
                     value={@state.code} />
      </div>
    </div>

module.exports = ExportMoudle
