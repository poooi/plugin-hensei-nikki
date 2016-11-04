import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { forEach, isEmpty, includes, pickBy } from 'lodash'
import { onSaveTags } from '../redux/actions'
import { subStateSelector, henseiDataSelector } from '../redux/selectors'

import TagsInput from '../components/tags-input'

const initialState = {
  delShow: false,
  delDisable: true,
  tags: {},
}

export default connect(
  createSelector([
    subStateSelector,
    henseiDataSelector,
  ], ({ subState }, data) => ({ subState, data })),
  { onSaveTags }
)(class TagsEditor extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subState === 'editTag' && this.props.subState !== 'editTag' || nextProps.data !== this.props.data) {
      const { data, title } = nextProps
      const tags = {}

      forEach(data[title].tags, (tag) => {
        tags[tag] = false
      })

      const delShow = !isEmpty(tags)

      this.setState({
        ...initialState,
        delShow,
        tags,
      })
    }
  }
  onClickCheckbox = (tag) => {
    const { tags } = this.state
    tags[tag] = !tags[tag]

    const delDisable = includes(tags, true)
    this.setState({
      delDisable,
      tags,
    })
  }
  onDelTag = () => {
    let { delShow, delDisable, tags } = this.state

    tags = pickBy(tags, false)
    delShow = isEmpty(tags)
    delDisable = true

    this.setState({
      delShow,
      delDisable,
      tags,
    })
  }
  onAddTag(tag) {
    const { tags } = this.state

    if (includes(tags, tag)) {
      toggleModal(__('Error'), __('The tag is already exist.'))
    } else {
      tags[tag] = false
      this.setState({ tags })
    }
  }
  onSave = () => {
    const { onSaveTags, title } = this.props
    onSaveTags(title, this.state.tags)
  }
  render() {
    const { delShow, delDisable, tags } = this.state
    const { onClickCheckbox, onDelTag, onAddTag, onSave } = this
    const tagsDom = []
    forEach(tags, (checked, tag) => {
      tagsDom.push(
        <Checkbox key={tag}
                 onChange={onClickCheckbox.bind(this, tag)}
                 checked={checked}>
          <Label style={display: 'inline-block', margin: 5}>
            {tag}
          </Label>
        </Checkbox>
      )
    })
    return (
      <div className='tab-container'>
        <div className='container-col'>
          <div>
            { tagsDom }
            <Button style={alignItems: 'flex-end'}
                    bsSize="small"
                    className={`tag-del-btn${delShow ? '' : ' hidden'}`}
                    disabled={delDisable}
                    onClick={onDelTag}
                    block>
              {__('Delete')}
            </Button>
          </div>
          <TagsInput onAddTag={onAddTag} />
        </div>
        <Button bsSize="small" onClick={onSave} block>
          {__('Save')}
        </Button>
      </div>
    )
  }
})
