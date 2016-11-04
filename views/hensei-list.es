import React, { Component } from 'react'
import { connect } from 'react-redux'
import { topStateSelector } from '../redux/selectors'

import TitleList from '../components/title-list'
import HenseiItem from '../components/hensei-item'

export default connect(
  topStateSelector,
)(class HenseiList extends Component {
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
    const { topState } = this.props
    return (
      <div className={`hensei-list${topState === 'list' ? '' : ' hidden'}`}>
        <TitleList activeTitle={activeTitle}
                   topState={topState}
                   onSelectTitle={this.onSelectTitle} />
        <HenseiItem activeTitle={activeTitle} />
      </div>
    )
  }
})
