import React from 'react'
import { useIntl } from 'react-intl'
import Activity from '../../containers/Activity'
import UserApplications from '../../containers/UserAppsMenu/UserApplications'

const Workspace = React.memo(() => {
  const intl = useIntl()

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
})

Workspace.propTypes = {}

export default Workspace
