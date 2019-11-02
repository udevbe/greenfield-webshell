import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import Activity from '../../containers/Activity'

class Workspace extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: ''
    }
  }

  render () {
    const { intl } = this.props

    return (
      <Activity
        title={intl.formatMessage({ id: 'workspace' })}>
      </Activity>
    )
  }
}

Workspace.propTypes = {}

export default injectIntl(Workspace)
