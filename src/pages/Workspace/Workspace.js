import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import Scrollbar from '../../components/Scrollbar'

class Workspace extends Component {
  // Sorry for using setState here but I have to remove 'marked' from the dependencies
  // because of a vulnerability issue
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
