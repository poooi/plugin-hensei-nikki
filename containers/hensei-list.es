import React, { Component } from 'react'
import { connect } from 'react-redux'
import { tabStatusSelector } from '../redux/selectors'

import TitleList from '../components/title-list'
import HeiseiItem from '../components/heisei-item'

export default connect(
  tabStatusSelector,
)(class HeiseiList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTitle: '',
    }
  }
  onSelectTitle = (title) => {
    if (title !== this.state.activeTitle) {
      this.setState({ activeTitle: title })
    }
  }
  render() {
    const { activeTitle } = this.state
    const { status } = this.props
    return (
      <div className={`hensei-list${status === 'list' ? '' : ' hidden'}`}>
        <TitleList activeTitle={activeTitle}
                   status={status}
                   onSelectTitle={this.onSelectTitle} />
        <HeiseiItem activeTitle={activeTitle} />
      </div>
    )
  }
})
