import React from 'react'
import { injectIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import UserApplications from '../../containers/UserAppsMenu/UserApplications'

const Workspace = (props) => {
  const { intl } = props

  return (
    <Activity
      title={intl.formatMessage({ id: 'workspace' })}
      appBarContent={
        <>
          <UserApplications />
        </>
      }
    />
  )
}

Workspace.propTypes = {}

export default injectIntl(Workspace)
